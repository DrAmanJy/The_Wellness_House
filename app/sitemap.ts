import type { MetadataRoute } from "next";
import { pool } from "@/server/db";
import { origin } from "@/server/security/http";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    "",
    "/rituals",
    "/collections",
    "/journal",
    "/about",
    "/science",
    "/ingredients",
    "/atelier",
    "/faq",
    "/contact",
    "/privacy-policy",
    "/terms-and-conditions",
  ].map((path) => ({ url: origin() + path }));
  const prefixes: Record<string, string> = {
    products: "rituals",
    collections: "collections",
    journal: "journal",
    pages: "",
  };
  let after = "";
  while (true) {
    const rows = (
      await pool.query(
        "SELECT e.id,e.kind,e.slug,e.published_at,r.seo FROM content_entities e JOIN content_revisions r ON r.id=e.live_revision_id WHERE e.kind IN ('products','collections','journal','pages') AND e.lifecycle='active' AND e.id::text>$1 AND coalesce((r.seo->>'robots_index')::boolean,true) ORDER BY e.id LIMIT 500",
        [after],
      )
    ).rows;
    if (!rows.length) break;
    for (const row of rows) {
      const path =
        row.seo.canonical_path ||
        (row.kind === "pages"
          ? row.slug === "home"
            ? "/"
            : "/" + row.slug
          : "/" + prefixes[row.kind] + "/" + row.slug);
      const url = origin() + path;
      const prior = entries.find((e) => e.url === url);
      if (prior) prior.lastModified = row.published_at;
      else entries.push({ url, lastModified: row.published_at });
    }
    after = rows.at(-1).id;
    if (rows.length < 500) break;
  }
  return entries;
}
