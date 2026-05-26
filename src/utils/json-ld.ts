import type {
  Data,
  FAQ,
  Socials,
  Sponsor,
  TeamMember,
} from "../data/data.type";

const EVENT_DURATION_HOURS = 12;

function socialUrls(socials: Socials): string[] {
  if (!socials) return [];
  return Object.entries(socials)
    .filter(([key, value]) => key !== "mail" && typeof value === "string" && value)
    .map(([, value]) => value as string);
}

function stripMarkdown(input: string): string {
  return input
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildEventJsonLd(
  data: Data,
  baseUrl: URL | string,
): Record<string, unknown> {
  const start = data.date instanceof Date ? data.date.toISOString() : "";
  const end =
    data.date instanceof Date
      ? new Date(
          data.date.getTime() + EVENT_DURATION_HOURS * 60 * 60 * 1000,
        ).toISOString()
      : "";

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: data.title,
    description: data.description,
    startDate: start,
    endDate: end,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: [new URL("/BIZNAGAFEST-2026-OPENGRAPH.webp", baseUrl).toString()],
    location: {
      "@type": "Place",
      name: data.venue?.title,
      address: {
        "@type": "PostalAddress",
        streetAddress: data.venue?.address,
        addressLocality: data.venue?.city,
        addressCountry: "ES",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "GDG Málaga",
      url: "https://gdg.community.dev/gdg-malaga/",
    },
    ...(data.ticketsUrl
      ? {
          offers: {
            "@type": "Offer",
            url: data.ticketsUrl,
            availability: "https://schema.org/InStock",
            priceCurrency: "EUR",
            validFrom: new Date().toISOString(),
          },
        }
      : {}),
    performer: data.speakers?.map((s) => ({
      "@type": "Person",
      name: s.name,
    })),
  };
}

export function buildPersonJsonLd(
  person: TeamMember,
  pageUrl: URL | string,
  baseUrl: URL | string,
): Record<string, unknown> {
  const sameAs = socialUrls(person.socials);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    ...(person.position ? { jobTitle: person.position } : {}),
    ...(person.description
      ? { description: stripMarkdown(person.description) }
      : {}),
    image: new URL(person.picture, baseUrl).toString(),
    url: pageUrl.toString(),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function buildOrganizationJsonLd(
  sponsor: Sponsor,
  pageUrl: URL | string,
  baseUrl: URL | string,
): Record<string, unknown> {
  const sameAs = socialUrls(sponsor.socials);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: sponsor.name,
    ...(sponsor.description
      ? { description: stripMarkdown(sponsor.description) }
      : {}),
    logo: new URL(sponsor.picture, baseUrl).toString(),
    url: sponsor.url || pageUrl.toString(),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: URL | string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.toString(),
    })),
  };
}

export function buildFaqJsonLd(faq: FAQ[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((entry) => ({
      "@type": "Question",
      name: entry.title,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripMarkdown(entry.body),
      },
    })),
  };
}
