import { z } from "astro/zod";

export const SocialsSchema = z
  .object({
    twitter: z.string(),
    youtube: z.string(),
    linkedin: z.string(),
    website: z.string(),
    mastodon: z.string(),
    github: z.string(),
    medium: z.string(),
    mail: z.string(),
    instagram: z.string(),
    devto: z.string(),
    twitch: z.string(),
  })
  .partial()
  .nullish();

const PersonSchema = z.object({
  name: z.string(),
  position: z.string().nullish(),
  description: z.string().nullish(),
  socials: SocialsSchema,
  picture: z.string(),
});

export const SpeakerSchema = PersonSchema;
export const HostSchema = PersonSchema;
export const TeamMemberSchema = PersonSchema;

export const TeamSchema = z.object({
  organizers: z.array(TeamMemberSchema),
  staff: z.array(TeamMemberSchema),
});

export const SponsorTierSchema = z.enum([
  "platinum",
  "gold",
  "silver",
  "bronze",
  "communitySponsor",
  "media",
  "food",
  "community",
  "supporter",
]);

export const JobOfferSchema = z.object({
  title: z.string(),
  url: z.string(),
  description: z.string(),
});

export const SponsorSchema = z.object({
  hasFeaturedPage: z.boolean(),
  jobOffers: z.array(JobOfferSchema),
  name: z.string(),
  tier: SponsorTierSchema,
  description: z.string().nullish(),
  picture: z.string(),
  socials: SocialsSchema,
  url: z.string(),
});

export const TicketSchema = z.object({
  name: z.string(),
  subtitle: z.string().nullish(),
  price: z.number(),
  url: z.string(),
  perks: z.array(z.string()),
  isSoldOut: z.boolean().nullish(),
  isFeatured: z.boolean().nullish(),
  notice: z.string().nullish(),
});

export const WelcomeBannerSchema = z.object({
  isEnabled: z.boolean(),
});

export const FAQSchema = z.object({
  title: z.string(),
  body: z.string(),
});

export const RaffleSchema = z.object({
  description: z.string(),
  picture: z.string(),
});

export const PreviousEditionSchema = z.object({
  name: z.string(),
  url: z.string(),
});

export const EventSchema = z.object({
  name: z.string(),
  type: z.enum(["lecture", "workshop"]),
  speakers: z.array(z.string()),
  description: z.string().nullish(),
  durationInMinutes: z.number().nullish(),
  place: z.string().nullish(),
  date: z.string().nullish(),
  language: z.string().nullish(),
});

export const FooterLinkSchema = z.object({
  title: z.string(),
  href: z.string(),
});

export const CallForPapersSchema = z.object({
  isEnabled: z.boolean(),
  title: z.string(),
  url: z.string(),
});

export const SponsorsDossierSchema = z.discriminatedUnion("enabled", [
  z.object({ enabled: z.literal(true), es: z.string(), en: z.string() }),
  z.object({ enabled: z.literal(false) }),
]);

export const LastEditionSchema = z.object({
  lastEditionVideoUrl: z.string().nullish(),
  gallery: z.array(z.string()),
});

export const ScheduleItemSchema = z.object({
  kind: z.enum(["break", "nobreak", "half-divider"]),
  type: z.enum(["lecture", "workshop"]).nullish(),
  start: z.string(),
  end: z.string(),
  title: z.string(),
  subtitle: z.string().nullish(),
  description: z.string().nullish(),
  location: z.string().nullish(),
  language: z.string().nullish(),
  topic: z.string().nullish(),
});

export const HallOfFameItemSchema = z.object({
  name: z.string(),
  edition: z.string(),
  picture: z.string(),
});

export const TshirtSchema = z.object({
  type: z.enum(["video", "image"]),
  title: z.string().nullish(),
  subtitle: z.string().nullish(),
  url: z.string(),
});

export const VenueSchema = z.object({
  title: z.string(),
  description: z.string().nullish(),
  address: z.string(),
  mapUrl: z.string(),
  pictures: z.array(z.string()),
  city: z.string(),
  howToArrive: z
    .object({
      howToArriveByBus: z.string(),
      howToArriveByBike: z.string(),
      howToArriveByMetro: z.string(),
    })
    .partial()
    .nullish(),
});

export const CompanyTicketsNoticeSchema = z.object({
  enabled: z.boolean(),
  title: z.string(),
  description: z.string(),
});

export const DataSchema = z.object({
  title: z.string(),
  date: z.date(),
  ticketsUrl: z.string(),
  description: z.string(),
  socials: SocialsSchema,
  venue: VenueSchema,
  companyTicketsNotice: CompanyTicketsNoticeSchema,
  speakers: z.array(SpeakerSchema),
  hosts: z.array(HostSchema),
  schedule: z.array(ScheduleItemSchema),
  team: TeamSchema,
  sponsors: z.array(SponsorSchema),
  sponsorsDossier: SponsorsDossierSchema,
  events: z.array(EventSchema),
  tickets: z.array(TicketSchema),
  previousEditions: z.array(PreviousEditionSchema),
  lastEdition: LastEditionSchema.nullish(),
  faq: z.array(FAQSchema),
  footerLinks: z.array(FooterLinkSchema),
  raffles: z.array(RaffleSchema),
  welcomeBanner: WelcomeBannerSchema,
  callForPapers: CallForPapersSchema,
  hallOfFame: z.array(HallOfFameItemSchema),
  tshirt: TshirtSchema.nullish(),
});

export type Data = z.infer<typeof DataSchema>;
export type Socials = z.infer<typeof SocialsSchema>;
export type Speaker = z.infer<typeof SpeakerSchema>;
export type Host = z.infer<typeof HostSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type SponsorTier = z.infer<typeof SponsorTierSchema>;
export type JobOffer = z.infer<typeof JobOfferSchema>;
export type Sponsor = z.infer<typeof SponsorSchema>;
export type Ticket = z.infer<typeof TicketSchema>;
export type WelcomeBanner = z.infer<typeof WelcomeBannerSchema>;
export type FAQ = z.infer<typeof FAQSchema>;
export type Raffle = z.infer<typeof RaffleSchema>;
export type PreviousEdition = z.infer<typeof PreviousEditionSchema>;
export type Event = z.infer<typeof EventSchema>;
export type FooterLink = z.infer<typeof FooterLinkSchema>;
export type CallForPapers = z.infer<typeof CallForPapersSchema>;
export type SponssorsDossier = z.infer<typeof SponsorsDossierSchema>;
export type LastEdition = z.infer<typeof LastEditionSchema>;
export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;
export type HallOfFameitem = z.infer<typeof HallOfFameItemSchema>;
export type Tshirt = z.infer<typeof TshirtSchema>;
