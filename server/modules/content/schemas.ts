import { z } from "zod";
const text = z.string().max(12000);
const short = z.string().max(300);
export const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(120);
export const safePath = z
  .string()
  .max(300)
  .refine(
    (v) =>
      /^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(v) &&
      !/^\/(api|admin|preview|account|auth)(\/|$)/.test(v),
    "Use a public internal path",
  );
export const mediaUrl = z
  .string()
  .max(2000)
  .refine(
    (v) =>
      /^\/api\/v1\/media\/[0-9a-f-]{36}$/.test(v) ||
      /^\/(?!\/)[\w/.-]+$/.test(v) ||
      /^https:\/\/(images\.unsplash\.com|assets\.mixkit\.co|videos\.pexels\.com)\//.test(
        v,
      ),
    "Use uploaded media or an approved media host",
  );
export const seoSchema = z
  .object({
    seo_title: short.optional(),
    meta_description: z.string().max(500).optional(),
    canonical_path: safePath.optional(),
    robots_index: z.boolean().default(true),
    robots_follow: z.boolean().default(true),
    og_title: short.optional(),
    og_description: z.string().max(500).optional(),
    og_image: mediaUrl.optional(),
  })
  .strict();
const product = z
  .object({
    id: short,
    slug,
    title: short.min(1),
    subtitle: short,
    category: z.enum([
      "metabolic-balance",
      "evening-restoration",
      "bath-and-body",
      "adaptogenic-resilience",
    ]),
    categoryLabel: short,
    circadianTime: short,
    badge: short.optional(),
    imageUrl: mediaUrl.optional(),
    galleryImages: z.array(mediaUrl).max(20).optional(),
    sensoryProfile: z
      .object({ aroma: short, texture: short, finish: short })
      .strict(),
    duration: short,
    overview: text,
    theScience: text,
    keyPillars: z.array(short).max(30),
    components: z
      .array(
        z
          .object({
            title: short,
            format: short,
            dailyTiming: short,
            purpose: text,
          })
          .strict(),
      )
      .max(30),
    botanicalActives: z
      .array(
        z
          .object({
            name: short,
            scientificName: short,
            sourceRegion: short,
            activeCompound: short,
            therapeuticFunction: text,
          })
          .strict(),
      )
      .max(50),
    stepByStepProtocol: z
      .array(
        z
          .object({
            step: z.number().int().min(1),
            title: short,
            timing: short,
            instruction: text,
          })
          .strict(),
      )
      .max(30),
    lifestyleSynergies: z.array(text).max(30),
    fssaiLicense: short.optional(),
    precautions: z.array(text).max(30),
    artVariant: z.enum([
      "hero_wellness",
      "weight_kit",
      "gummies",
      "soap_botanical",
      "soap_lavender",
      "bundle_ritual",
      "daily_supplement",
      "philosophy",
      "atelier_sanctuary",
      "tea_ceremony",
      "botanical_press",
      "circadian_clock",
    ]),
  })
  .strict();
const film = z
  .object({
    id: short,
    categoryId: slug,
    categoryName: short,
    eyebrow: short,
    headline: short,
    description: text,
    ctaLabel: short,
    ctaUrl: safePath,
    videoUrl: mediaUrl,
    posterUrl: mediaUrl,
    mobilePosterUrl: mediaUrl.optional(),
    mobileVideoUrl: mediaUrl.optional(),
    layout: z.enum(["centered", "left", "asymmetric"]),
    overlayOpacity: z.number().min(0).max(0.8).optional(),
    videoCredit: short.optional(),
    isAutoplay: z.boolean().optional(),
    isActive: z.boolean(),
    sortOrder: z.number().int(),
  })
  .strict();
export const section = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("text"),
      heading: short,
      body: text,
      enabled: z.boolean().default(true),
    })
    .strict(),
  z
    .object({
      type: z.literal("hero"),
      heading: short,
      body: text,
      image: mediaUrl.optional(),
      ctaLabel: short.optional(),
      ctaPath: safePath.optional(),
      enabled: z.boolean().default(true),
    })
    .strict(),
  z
    .object({
      type: z.literal("faq"),
      heading: short,
      items: z
        .array(z.object({ question: short, answer: text }).strict())
        .max(30),
      enabled: z.boolean().default(true),
    })
    .strict(),
  z
    .object({
      type: z.literal("products"),
      heading: short,
      productIds: z.array(z.string().uuid()).max(30),
      enabled: z.boolean().default(true),
    })
    .strict(),
]);
const navigation = z
  .array(z.object({ label: short, path: safePath }).strict())
  .max(20);
export const contentSchemas = {
  products: product,
  collections: z
    .object({
      title: short,
      description: text,
      film,
      productIds: z.array(z.string().uuid()).max(100),
    })
    .strict(),
  journal: z
    .object({
      id: short,
      slug,
      title: short,
      excerpt: text,
      content: text,
      readTime: short,
      publishedDate: short,
      category: short,
      author: short,
      tags: z.array(short).max(30),
    })
    .strict(),
  pages: z
    .object({ title: short, sections: z.array(section).max(40) })
    .strict(),
  "site-config": z
    .object({
      title: short,
      description: text,
      announcement: short,
      logo: mediaUrl.optional(),
        defaultShareImage: mediaUrl.optional(),
      navigation,
      footer: navigation,
      theme: z
        .object({
          primary: z.string().regex(/^#[0-9a-f]{6}$/i),
          background: z.string().regex(/^#[0-9a-f]{6}$/i),
          radius: z.enum(["none", "soft", "round"]),
          font: z.enum(["house", "sans"]),
        })
        .strict(),
      contactEmail: z.string().email(),
      socialLinks: z
        .array(
          z
            .string()
            .url()
            .refine((v) => v.startsWith("https://")),
        )
        .max(10),
    })
    .strict(),
  videos: z
    .object({
      id: short,
      title: short,
      subtitle: short.optional(),
      description: text,
      videoUrl: mediaUrl,
      posterUrl: mediaUrl,
      aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:3", "21:9", "2.4:1"]),
      placement: z.enum([
        "homepage-brand-film",
        "shoppable-reels",
        "shop-the-film",
        "product-gallery",
        "editorial-story",
        "campaign-spotlight",
        "category-film",
      ]),
      categoryId: short.optional(),
      layout: z.enum(["centered", "left", "asymmetric"]).optional(),
      linkedProductSlug: slug.optional(),
      linkedProductTitle: short.optional(),
      linkedProductPrice: short.optional(),
      ctaLabel: short.optional(),
      ctaUrl: safePath.optional(),
      duration: short.optional(),
      isActive: z.boolean(),
      sortOrder: z.number().int(),
      campaignStartDate: short.optional(),
      campaignEndDate: short.optional(),
      createdAt: short,
      updatedAt: short,
    })
    .strict(),
  "email-templates": z
    .object({
      title: short,
      subject: short,
      body: text,
      allowedVariables: z.array(z.enum(["name", "reference", "status"])).max(3),
    })
    .strict(),
  locations: z
    .object({
      title: short,
      mode: z.enum(["in_person", "virtual"]),
      timezone: z.string().refine((v) => {
        try {
          new Intl.DateTimeFormat("en", { timeZone: v });
          return true;
        } catch {
          return false;
        }
      }),
      address: text,
      hours: text,
      active: z.boolean(),
    })
    .strict(),
};
export type Kind = keyof typeof contentSchemas;
export const kindSchema = z.enum([
  "products",
  "collections",
  "journal",
  "pages",
  "videos",
  "site-config",
  "email-templates",
  "locations",
]);
export function validateContent(kind: Kind, value: unknown) {
  return contentSchemas[kind].parse(value);
}
export function mediaIds(value: unknown): string[] {
  return [
    ...new Set(
      (
        JSON.stringify(value).match(/\/api\/v1\/media\/[0-9a-f-]{36}/g) || []
      ).map((v) => v.split("/").pop()!),
    ),
  ];
}
