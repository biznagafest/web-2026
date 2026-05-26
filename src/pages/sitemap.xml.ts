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

type SitemapEntry = {
  loc: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

export const GET: APIRoute = ({ locals, site, url }) => {
  const data = locals.data;
  const baseUrl = site ?? new URL("/", url);
  const today = new Date().toISOString().slice(0, 10);

  const entries = new Map<string, SitemapEntry>();
  const add = (path: string, opts: Omit<SitemapEntry, "loc"> = {}) => {
    const loc = new URL(path, baseUrl).toString();
    if (entries.has(loc)) return;
    entries.set(loc, { loc, ...opts });
  };

  add("/", { changefreq: "daily", priority: 1.0 });
  add("/code", { changefreq: "yearly", priority: 0.3 });
  if (data.schedule?.length) {
    add("/schedule", { changefreq: "weekly", priority: 0.9 });
  }
  if (data.raffles?.length) {
    add("/raffles", { changefreq: "weekly", priority: 0.6 });
  }
  for (const speaker of data.speakers ?? []) {
    add(`/speaker/${slugify(speaker.name)}`, {
      changefreq: "monthly",
      priority: 0.7,
    });
  }
  for (const host of data.hosts ?? []) {
    add(`/host/${slugify(host.name)}`, {
      changefreq: "monthly",
      priority: 0.5,
    });
  }
  for (const organizer of data.team?.organizers ?? []) {
    add(`/organizer/${slugify(organizer.name)}`, {
      changefreq: "monthly",
      priority: 0.4,
    });
  }
  for (const staff of data.team?.staff ?? []) {
    add(`/staff/${slugify(staff.name)}`, {
      changefreq: "monthly",
      priority: 0.3,
    });
  }
  for (const sponsor of data.sponsors ?? []) {
    if (sponsor.hasFeaturedPage === false) continue;
    add(`/sponsor/${slugify(sponsor.name)}`, {
      changefreq: "monthly",
      priority: 0.6,
    });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...entries.values()]
  .map((entry) => {
    const parts = [`<loc>${xmlEscape(entry.loc)}</loc>`, `<lastmod>${today}</lastmod>`];
    if (entry.changefreq) parts.push(`<changefreq>${entry.changefreq}</changefreq>`);
    if (entry.priority !== undefined) parts.push(`<priority>${entry.priority.toFixed(1)}</priority>`);
    return `  <url>${parts.join("")}</url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
