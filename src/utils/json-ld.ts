import type { Data } from "../data/data.type";

const EVENT_DURATION_HOURS = 12;

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
