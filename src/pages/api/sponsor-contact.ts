import type { APIRoute } from "astro";
import { Resend } from "resend";
import { RESEND_API_KEY, TURNSTILE_SECRET_KEY } from "astro:env/server";
import { z } from "astro/zod";

const ContactPayloadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  message: z.string().trim().min(1).max(5000),
  token: z.string().min(1).max(2048),
});

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isAllowedOrigin(request: Request, site: URL | undefined): boolean {
  if (!site) return true;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === site.host;
  } catch {
    return false;
  }
}

function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("cf-connecting-ip");
  if (forwarded) return forwarded;
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return null;
}

async function verifyTurnstile(
  token: string,
  remoteip: string | null,
): Promise<boolean> {
  const body = new FormData();
  body.append("secret", TURNSTILE_SECRET_KEY);
  body.append("response", token);
  if (remoteip) body.append("remoteip", remoteip);

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[sponsor-contact] turnstile verify failed", err);
    return false;
  }
}

export const POST: APIRoute = async ({ request, site }) => {
  if (!isAllowedOrigin(request, site)) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const parsed = ContactPayloadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    token: formData.get("cf-turnstile-response"),
  });

  if (!parsed.success) {
    return Response.json(
      { message: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { name, email, message, token } = parsed.data;

  const turnstileOk = await verifyTurnstile(token, getClientIp(request));
  if (!turnstileOk) {
    return Response.json(
      { message: "Captcha verification failed" },
      { status: 403 },
    );
  }

  const resend = new Resend(RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "sponsors@biznagafest.com",
    to: "biznagafest@gmail.com",
    replyTo: email,
    subject: `[SPONSOR CONTACT]: ${name} (${email})`,
    html: `<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
  });

  if (error) {
    console.error("[sponsor-contact] resend error", error);
    return Response.json({ message: "Failed to send email" }, { status: 502 });
  }

  return Response.json({ success: true }, { status: 200 });
};

export const ALL: APIRoute = () =>
  new Response(null, { status: 405, headers: { Allow: "POST" } });
