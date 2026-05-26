import type {
  Data,
  FAQ,
  Socials,
  Sponsor,
  TeamMember,
} from "../data/data.type";
import { stripMarkdown } from "./strip-markdown";

function socialUrls(socials: Socials): string[] {
  if (!socials) return [];
  return Object.entries(socials)
    .filter(([key, value]) => key !== "mail" && typeof value === "string" && value)
    .map(([, value]) => value as string);
}

const EVENT_START_HOUR_LOCAL = 9;
const EVENT_END_HOUR_LOCAL = 21;
const SPAIN_OFFSET = "+01:00";

function toEventISOString(date: Date, hourLocal: number): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(hourLocal).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:00:00${SPAIN_OFFSET}`;
}

export function buildEventJsonLd(
  data: Data,
  baseUrl: URL | string,
): Record<string, unknown> {
  const hasDate = data.date instanceof Date;
  const startDate = hasDate
    ? toEventISOString(data.date, EVENT_START_HOUR_LOCAL)
    : "";
  const endDate = hasDate
    ? toEventISOString(data.date, EVENT_END_HOUR_LOCAL)
    : "";

  const description = stripMarkdown(data.description ?? "");
  const performer = (data.speakers ?? []).map((s) => ({
    "@type": "Person",
    name: s.name,
  }));
  const minTicketPrice = (data.tickets ?? [])
    .map((t) => t.price)
    .filter((p): p is number => typeof p === "number" && p >= 0)
    .reduce<number | undefined>(
      (min, price) => (min === undefined || price < min ? price : min),
      undefined,
    );

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: data.title,
    description,
    startDate,
    endDate,
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
            ...(minTicketPrice !== undefined ? { price: minTicketPrice } : {}),
            validFrom: hasDate
              ? toEventISOString(new Date(data.date.getTime() - 1000 * 60 * 60 * 24 * 180), 0)
              : new Date().toISOString(),
          },
        }
      : {}),
    ...(performer.length ? { performer } : {}),
  };
}

export function buildWebSiteJsonLd(
  data: Data,
  baseUrl: URL | string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.title,
    url: new URL("/", baseUrl).toString(),
    description: stripMarkdown(data.description ?? ""),
    inLanguage: "es-ES",
    publisher: {
      "@type": "Organization",
      name: "GDG Málaga",
      url: "https://gdg.community.dev/gdg-malaga/",
    },
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
