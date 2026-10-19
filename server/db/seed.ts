import { pool, transaction } from "./index";
import { RITUAL_FORMULATIONS, BLOG_POSTS } from "../../lib/rituals-data";
import { CATEGORY_FILMS } from "../../lib/video/category-films";
import { INITIAL_VIDEOS } from "../../lib/video/config";
import { validateContent, type Kind } from "../modules/content/schemas";
import { getRitualPrice } from "../../lib/pricing";
await transaction(async (c) => {
  await c.query("SELECT pg_advisory_xact_lock(781204)");
  async function seed(kind: Kind, slug: string, content: unknown) {
    const parsed = validateContent(kind, content);
    const existing = (
      await c.query(
        "SELECT id FROM content_entities WHERE kind=$1 AND slug=$2",
        [kind, slug],
      )
    ).rows[0];
    if (existing) return existing.id as string;
    const e = (
      await c.query(
        "INSERT INTO content_entities(kind,slug) VALUES($1,$2) RETURNING id",
        [kind, slug],
      )
    ).rows[0];
    const r = (
      await c.query(
        "INSERT INTO content_revisions(entity_id,revision_number,content,seo) VALUES($1,1,$2,$3) RETURNING id",
        [
          e.id,
          JSON.stringify(parsed),
          JSON.stringify({ robots_index: true, robots_follow: true }),
        ],
      )
    ).rows[0];
    await c.query(
      "UPDATE content_entities SET live_revision_id=$2,preview_revision_id=$2,version=1,published_at=now() WHERE id=$1",
      [e.id, r.id],
    );
    if ("productIds" in parsed)
      for (const [position, id] of parsed.productIds.entries())
        await c.query("INSERT INTO revision_products VALUES($1,$2,$3)", [
          r.id,
          id,
          position,
        ]);
    return e.id as string;
  }
  const ids = new Map<string, string>();
  for (const product of RITUAL_FORMULATIONS) {
    const id = await seed("products", product.slug, product);
    ids.set(product.slug, id);
    const priceMinor = getRitualPrice(product.slug) * 100;
    await c.query(
      "INSERT INTO product_variants(product_id,sku,title,price_minor,supply_code,currency) VALUES($1,$2,$3,$4,'standard-30','INR') ON CONFLICT(sku) DO UPDATE SET price_minor=COALESCE(product_variants.price_minor, EXCLUDED.price_minor)",
      [id, `TWH-${product.slug.toUpperCase()}`, product.title, priceMinor],
    );
  }
  for (const post of BLOG_POSTS) await seed("journal", post.slug, post);
  const mappings: Record<
    string,
    (p: (typeof RITUAL_FORMULATIONS)[number]) => boolean
  > = {
    "weight-management": (p) => p.category === "metabolic-balance",
    gummies: (p) => p.category === "evening-restoration",
    soaps: (p) => p.category === "bath-and-body",
    bundles: (p) =>
      p.artVariant === "bundle_ritual" ||
      p.category === "adaptogenic-resilience",
  };
  for (const film of CATEGORY_FILMS)
    await seed("collections", film.categoryId, {
      title: film.categoryName,
      description: film.description,
      film,
      productIds: RITUAL_FORMULATIONS.filter(
        mappings[film.categoryId] || (() => false),
      ).map((p) => ids.get(p.slug)),
    });
  for (const video of INITIAL_VIDEOS) await seed("videos", video.id, video);
  await seed("site-config", "global", {
    title: "The Wellness House",
    description: "Wellness, made a daily ritual.",
    announcement: "Botanical science. Everyday rituals.",
    navigation: [
      { label: "Rituals", path: "/rituals" },
      { label: "Collections", path: "/collections" },
      { label: "Journal", path: "/journal" },
      { label: "About", path: "/about" },
    ],
    footer: [
      { label: "Contact", path: "/contact" },
      { label: "Privacy", path: "/privacy-policy" },
      { label: "Terms", path: "/terms-and-conditions" },
    ],
    theme: {
      primary: "#30473B",
      background: "#F5F1E8",
      radius: "soft",
      font: "house",
    },
    contactEmail: "care@thewellnesshouse.in",
    socialLinks: [],
  });
  for (const [slug, title, mode] of [
    ["new-delhi", "New Delhi Atelier", "in_person"],
    ["mumbai", "Mumbai Atelier", "in_person"],
    ["virtual-video", "Virtual Consultation", "virtual"],
  ])
    await seed("locations", slug, {
      title,
      mode,
      timezone: "Asia/Kolkata",
      address: "",
      hours: "By confirmed appointment",
      active: true,
    });
  for (const kind of ["consultations", "inquiries"])
    for (const audience of ["customer", "staff"])
      await seed("email-templates", `${kind}-${audience}`, {
        title: `${kind} ${audience}`,
        subject: "The Wellness House — request {{status}}",
        body: "Hello {{name}},\n\nYour request reference is {{reference}}. Our team will follow up. Appointment times are confirmed separately.",
        allowedVariables: ["name", "reference", "status"],
      });
});
await pool.query(
  "INSERT INTO product_variants(product_id,sku,title,supply_code,currency,price_minor) SELECT product_id,sku||'-60',title||' — 60-day supply','reserve-60',currency,ROUND(price_minor * 1.8) FROM product_variants WHERE supply_code='standard-30' ON CONFLICT(product_id,supply_code) DO UPDATE SET price_minor=COALESCE(product_variants.price_minor, EXCLUDED.price_minor)"
);
await pool.query(
  "INSERT INTO inventory(variant_id,on_hand,reserved) SELECT id,100,0 FROM product_variants ON CONFLICT(variant_id) DO NOTHING"
);
await pool.query(
  "UPDATE commerce_settings SET enabled=true,shipping_minor=COALESCE(shipping_minor,0),tax_basis_points=COALESCE(tax_basis_points,500),postal_prefixes=CASE WHEN postal_prefixes='{}' OR postal_prefixes IS NULL THEN ARRAY['1','2','3','4','5','6','7','8','9'] ELSE postal_prefixes END,version=version+1 WHERE singleton"
);
console.log("Seed complete. Existing revisions were not overwritten.");
await pool.end();
