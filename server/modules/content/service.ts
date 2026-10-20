import { pool, transaction } from "../../db";
import { authorize, type Principal } from "../../security/session";
import { AppError } from "../../security/http";
import { token, hash } from "../../security/crypto";
import {
  validateContent,
  seoSchema,
  slug as slugSchema,
  mediaIds,
  safePath,
  type Kind,
} from "./schemas";
import type { PoolClient } from "pg";
export async function audit(
  c: PoolClient,
  actor: string,
  action: string,
  id: string,
  changes: unknown = {},
) {
  await c.query(
    "INSERT INTO audit_logs(actor_id,action,entity_id,changes) VALUES($1,$2,$3,$4)",
    [actor, action, id, JSON.stringify(changes)],
  );
}
export async function listAdmin(p: Principal | null, kind: Kind, after = "") {
  authorize(p, "content.read");
  return (
    await pool.query(
      `SELECT e.*,r.content,r.seo,r.desired_slug FROM content_entities e LEFT JOIN content_revisions r ON r.id=e.preview_revision_id WHERE e.kind=$1 AND e.id::text>$2 ORDER BY e.id LIMIT 50`,
      [kind, after],
    )
  ).rows;
}
export async function save(
  p: Principal | null,
  kind: Kind,
  input: {
    id?: string;
    slug: string;
    expectedVersion: number;
    content: unknown;
    seo: unknown;
  },
) {
  const actor = authorize(p, "content.edit");
  if (kind === "site-config") authorize(p, "settings.edit");
  const content = validateContent(kind, input.content),
    seo = seoSchema.parse(input.seo);
  slugSchema.parse(input.slug);
  if (kind === "pages") safePath.parse(input.slug === "home" ? "/" : "/" + input.slug);
  return transaction(async (c) => {
    let entity;
    if (input.id) {
      entity = (
        await c.query(
          "SELECT * FROM content_entities WHERE id=$1 AND kind=$2 FOR UPDATE",
          [input.id, kind],
        )
      ).rows[0];
      if (!entity) throw new AppError(404, "NOT_FOUND", "Content not found");
    } else {
      if (input.expectedVersion !== 0)
        throw new AppError(409, "VERSION", "New content requires version zero");
      entity = (
        await c.query(
          "INSERT INTO content_entities(kind,slug) VALUES($1,$2) RETURNING *",
          [kind, input.slug],
        )
      ).rows[0];
    }
    if(!input.id&&kind==='products'){for(const code of ['standard-30','reserve-60'])await c.query('INSERT INTO product_variants(product_id,sku,title,supply_code) VALUES($1,$2,$3,$4)',[entity.id,entity.id+'-'+code,('title' in content?content.title:input.slug)+' — '+(code==='reserve-60'?'60-day supply':'30-day supply'),code]);}
    if (entity.version !== input.expectedVersion)
      throw new AppError(
        409,
        "VERSION",
        "Content changed. Reload before saving.",
      );
    // The desired slug belongs to the revision; Live changes only on publish.

    if ("slug" in content && content.slug !== input.slug)
      throw new AppError(422, "SLUG", "Document slug must match its identity");
    const r = (
      await c.query(
        "INSERT INTO content_revisions(entity_id,revision_number,content,seo,created_by,desired_slug) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
        [
          entity.id,
          entity.version + 1,
          JSON.stringify(content),
          JSON.stringify(seo),
          actor.userId,
          input.slug,
        ],
      )
    ).rows[0];
    for (const id of mediaIds(content).concat(mediaIds(seo)))
      await c.query(
        "INSERT INTO revision_media VALUES($1,$2) ON CONFLICT DO NOTHING",
        [r.id, id],
      );
    const productIds =
      "productIds" in content
        ? content.productIds
        : "sections" in content
          ? content.sections.flatMap((s) =>
              s.type === "products" ? s.productIds : [],
            )
          : [];
    for (const [position, id] of productIds.entries()) {
      if (
        !(
          await c.query(
            "SELECT 1 FROM content_entities WHERE id=$1 AND kind='products'",
            [id],
          )
        ).rowCount
      )
        throw new AppError(422, "PRODUCT", "Unknown product reference");
      await c.query(
        "INSERT INTO revision_products VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
        [r.id, id, position],
      );
    }
    await c.query(
      "UPDATE content_entities SET preview_revision_id=$2,version=version+1 WHERE id=$1",
      [entity.id, r.id],
    );
    await audit(c, actor.userId, "content.save", entity.id, {
      revisionId: r.id,
    });
    return { id: entity.id, revisionId: r.id, version: entity.version + 1 };
  });
}
export async function publish(
  p: Principal | null,
  id: string,
  expectedVersion: number,
  revisionId?: string,
  unpublish = false,
) {
  const actor = authorize(p, "content.publish");
  return transaction(async (c) => {
    const e = (
      await c.query("SELECT * FROM content_entities WHERE id=$1 FOR UPDATE", [
        id,
      ])
    ).rows[0];
    if (!e) throw new AppError(404, "NOT_FOUND", "Content not found");
    if (e.version !== expectedVersion)
      throw new AppError(
        409,
        "VERSION",
        "Publication changed. Reload before publishing.",
      );
    const rid = revisionId || e.preview_revision_id;
    if (!unpublish) {
      const r = (
        await c.query(
          "SELECT * FROM content_revisions WHERE id=$1 AND entity_id=$2",
          [rid, id],
        )
      ).rows[0];
      if (!r) throw new AppError(422, "REVISION", "Invalid revision");
      validateContent(e.kind, r.content);
      seoSchema.parse(r.seo);
      const newSlug = r.desired_slug || e.slug;
      if (newSlug !== e.slug) {
        await c.query("SELECT pg_advisory_xact_lock(781208)");
        const taken = (
          await c.query(
            "SELECT entity_id FROM content_slugs WHERE kind=$1 AND slug=$2",
            [e.kind, newSlug],
          )
        ).rows[0];
        if (taken && taken.entity_id !== id)
          throw new AppError(
            409,
            "SLUG_TAKEN",
            "Slug is reserved by another record",
          );
        await c.query(
          "UPDATE content_slugs SET role='redirect' WHERE entity_id=$1",
          [id],
        );
        await c.query(
          "INSERT INTO content_slugs VALUES($1,$2,$3,'canonical') ON CONFLICT(kind,slug) DO UPDATE SET role='canonical'",
          [e.kind, newSlug, id],
        );
        const prefix: Record<string, string> = {
          products: "/rituals/",
          collections: "/collections/",
          journal: "/journal/",
          pages: "/",
        };
        if (prefix[e.kind]) {
          const target = prefix[e.kind] + newSlug;
          await c.query("DELETE FROM redirects WHERE source_path=$1", [target]);
          const old = (
            await c.query(
              "SELECT slug FROM content_slugs WHERE entity_id=$1 AND role='redirect'",
              [id],
            )
          ).rows;
          for (const row of old)
            await c.query(
              "INSERT INTO redirects VALUES($1,$2,308,true) ON CONFLICT(source_path) DO UPDATE SET target_path=excluded.target_path,enabled=true",
              [prefix[e.kind] + row.slug, target],
            );
        }
        await c.query("UPDATE content_entities SET slug=$2 WHERE id=$1", [
          id,
          newSlug,
        ]);
      }

      if (
        (
          await c.query(
            "SELECT 1 FROM revision_media rm JOIN media_assets m ON m.id=rm.media_id WHERE rm.revision_id=$1 AND m.status<>'ready'",
            [rid],
          )
        ).rowCount
      )
        throw new AppError(
          422,
          "MEDIA",
          "All media must be processed before publication",
        );
    }
    await c.query(
      "UPDATE content_entities SET live_revision_id=$2,published_at=now(),version=version+1 WHERE id=$1",
      [id, unpublish ? null : rid],
    );
    await c.query(
      "INSERT INTO publication_events(entity_id,from_revision_id,to_revision_id,action,actor_id) VALUES($1,$2,$3,$4,$5)",
      [
        id,
        e.live_revision_id,
        unpublish ? null : rid,
        unpublish ? "unpublish" : "publish",
        actor.userId,
      ],
    );
    await audit(
      c,
      actor.userId,
      unpublish ? "content.unpublish" : "content.publish",
      id,
      { revisionId: rid },
    );
    return { id, version: e.version + 1 };
  });
}
export async function previewLink(
  p: Principal | null,
  id: string,
  revisionId: string,
  hours = 72,
  requireLogin = false,
) {
  const actor = authorize(p, "content.preview");
  const raw = token();
  return transaction(async (c) => {
    const r = (
      await c.query(
        "INSERT INTO preview_links(token_hash,entity_id,revision_id,created_by,expires_at,require_reviewer_login) VALUES($1,$2,$3,$4,now()+$5*interval '1 hour',$6) RETURNING id,expires_at",
        [hash(raw), id, revisionId, actor.userId, hours, requireLogin],
      )
    ).rows[0];
    await audit(c, actor.userId, "preview.create", id, { linkId: r.id });
    return { ...r, url: `/preview/rituals/${raw}` };
  });
}
export async function preview(raw: string, user: Principal | null) {
  return (
    (
      await pool.query(
        `SELECT e.id,e.kind,e.slug,r.content,r.seo,r.id AS revision_id FROM preview_sessions s JOIN preview_links l ON l.id=s.link_id JOIN content_revisions r ON r.id=l.revision_id JOIN content_entities e ON e.id=l.entity_id WHERE s.token_hash=$1 AND s.expires_at>now() AND l.expires_at>now() AND l.revoked_at IS NULL AND (NOT l.require_reviewer_login OR $2::boolean)`,
        [hash(raw), !!user],
      )
    ).rows[0] || null
  );
}
