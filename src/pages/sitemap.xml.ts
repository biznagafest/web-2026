import type { APIRoute } from "astro";
import { slugify } from "../utils/slug";

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const GET: APIRoute = ({ locals, site, url }) => {
  const data = locals.data;
  const baseUrl = site ?? new URL("/", url);

  const urls = new Set<string>();
  urls.add(new URL("/", baseUrl).toString());
  urls.add(new URL("/code", baseUrl).toString());
  if (data.schedule?.length) {
    urls.add(new URL("/schedule", baseUrl).toString());
  }
  if (data.raffles?.length) {
    urls.add(new URL("/raffles", baseUrl).toString());
  }
  for (const speaker of data.speakers ?? []) {
    urls.add(new URL(`/speaker/${slugify(speaker.name)}`, baseUrl).toString());
  }
  for (const host of data.hosts ?? []) {
    urls.add(new URL(`/host/${slugify(host.name)}`, baseUrl).toString());
  }
  for (const organizer of data.team?.organizers ?? []) {
    urls.add(
      new URL(`/organizer/${slugify(organizer.name)}`, baseUrl).toString(),
    );
  }
  for (const staff of data.team?.staff ?? []) {
    urls.add(new URL(`/staff/${slugify(staff.name)}`, baseUrl).toString());
  }
  for (const sponsor of data.sponsors ?? []) {
    if (sponsor.hasFeaturedPage === false) continue;
    urls.add(
      new URL(`/sponsor/${encodeURIComponent(sponsor.name)}`, baseUrl).toString(),
    );
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls]
  .map((loc) => `  <url><loc>${xmlEscape(loc)}</loc></url>`)
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
