import { pool, db } from "../../db";
import { and, eq } from "drizzle-orm";
import {
  contentEntities as entities,
  contentRevisions as revisions,
} from "../../db/schema";
import { requestSnapshot } from "../../request-context";
import type { Kind } from "./schemas";
import type { RitualFormulation, BlogPost } from "../../../lib/types";
export interface Published {
  id: string;
  kind: Kind;
  slug: string;
  revision_id: string;
  content: any;
  seo: any;
  published_at: Date;
}
export async function published(
  kind: Kind,
  slug: string,
): Promise<Published | null> {
  return requestSnapshot(`${kind}:${slug}`, async () => {
    const rows = await db
      .select({
        id: entities.id,
        kind: entities.kind,
        slug: entities.slug,
        revision_id: revisions.id,
        content: revisions.content,
        seo: revisions.seo,
        published_at: entities.publishedAt,
      })
      .from(entities)
      .innerJoin(revisions, eq(revisions.id, entities.liveRevisionId))
      .where(
        and(
          eq(entities.kind, kind),
          eq(entities.slug, slug),
          eq(entities.lifecycle, "active"),
        ),
      )
      .limit(1);
    return (rows[0] as Published | undefined) || null;
  });
}
export async function listPublished(
  kind: Kind,
  limit = 50,
  after = "",
): Promise<Published[]> {
  return (
    await pool.query(
      `SELECT e.id,e.kind,e.slug,r.id revision_id,r.content,r.seo,e.published_at FROM content_entities e JOIN content_revisions r ON r.id=e.live_revision_id WHERE e.kind=$1 AND e.lifecycle='active' AND e.id::text>$2 ORDER BY e.id LIMIT $3`,
      [
        kind,
        after,
        Math.min(
          Math.max(Number.isFinite(limit) ? Math.floor(limit) : 50, 1),
          50,
        ),
      ],
    )
  ).rows;
}
function asRitual(row: { id: string; slug: string; content: object }) {
  return { ...row.content, id: row.id, slug: row.slug } as RitualFormulation;
}
export const products = async () =>
  (await listPublished("products")).map(asRitual);
export async function catalog() {
  return (
    await pool.query(
      `SELECT e.id,e.slug,r.content - 'theScience' - 'stepByStepProtocol' - 'lifestyleSynergies' - 'precautions' - 'components' - 'keyPillars' AS content FROM content_entities e JOIN content_revisions r ON r.id=e.live_revision_id WHERE e.kind='products' AND e.lifecycle='active' ORDER BY e.id LIMIT 50`,
    )
  ).rows.map(asRitual);
}
export async function searchCatalog(q: string) {
  const query = q.trim().slice(0, 100);
  if (query.length < 2) return catalog();
  return (
    await pool.query(
      `SELECT e.id,e.slug,r.content - 'theScience' - 'stepByStepProtocol' - 'lifestyleSynergies' - 'precautions' - 'components' - 'keyPillars' AS content FROM content_entities e JOIN content_revisions r ON r.id=e.live_revision_id WHERE e.kind='products' AND e.lifecycle='active' AND to_tsvector('english',coalesce(r.content->>'title','')||' '||coalesce(r.content->>'overview','')||' '||coalesce(r.content->>'subtitle','')) @@ plainto_tsquery('english',$1) ORDER BY e.id LIMIT 50`,
      [query],
    )
  ).rows.map(asRitual);
}
export const posts = async () => {
  return (await listPublished("journal")).map((p) => p.content as BlogPost);
};
export async function collectionProducts(revisionId: string) {
  return (
    await pool.query(
      `SELECT r.content,e.id,e.slug FROM revision_products rp JOIN content_entities e ON e.id=rp.product_id JOIN content_revisions r ON r.id=e.live_revision_id WHERE rp.revision_id=$1 AND e.lifecycle='active' ORDER BY rp.position`,
      [revisionId],
    )
  ).rows.map(
    (r) => ({ ...r.content, id: r.id, slug: r.slug }) as RitualFormulation,
  );
}
