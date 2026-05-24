import type { APIRoute } from "astro";
import { Resend } from "resend";
import { RESEND_API_KEY } from "astro:env/server";
import { z } from "astro/zod";

const ContactPayloadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  message: z.string().trim().min(1).max(5000),
});

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

export const POST: APIRoute = async ({ request, site }) => {
  if (!isAllowedOrigin(request, site)) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const parsed = ContactPayloadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return Response.json(
      { message: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { name, email, message } = parsed.data;
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
