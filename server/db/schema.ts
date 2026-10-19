import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  bigint,
} from "drizzle-orm/pg-core";
// Read-model mappings. SQL migrations own cyclic ownership FKs, triggers and checks.
export const contentEntities = pgTable("content_entities", {
  id: uuid("id").primaryKey(),
  kind: text("kind").notNull(),
  slug: text("slug").notNull(),
  lifecycle: text("lifecycle").notNull(),
  liveRevisionId: uuid("live_revision_id"),
  previewRevisionId: uuid("preview_revision_id"),
  version: integer("version").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
});
export const contentRevisions = pgTable("content_revisions", {
  id: uuid("id").primaryKey(),
  entityId: uuid("entity_id").notNull(),
  revisionNumber: integer("revision_number").notNull(),
  content: jsonb("content").notNull(),
  seo: jsonb("seo").notNull(),
  desiredSlug: text("desired_slug"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
export const variants = pgTable("product_variants", {
  id: uuid("id").primaryKey(),
  productId: uuid("product_id").notNull(),
  sku: text("sku").notNull(),
  priceMinor: bigint("price_minor", { mode: "bigint" }),
  currency: text("currency").notNull(),
});
