import { clearPurchaseCookies } from "@/server/modules/identity/purchase-cookies";
import { customerRoute } from "@/server/customer-router";
import { webhook } from "@/server/modules/commerce/service";
import { z } from "zod";
import { pool, transaction } from "@/server/db";
import {
  endpoint,
  json,
  body,
  csrf,
  cookie,
  cookieValue,
  AppError,
  limit,
} from "@/server/security/http";
import { token, hash, decrypt } from "@/server/security/crypto";
import { session, authenticated, authorize } from "@/server/security/session";
import { kindSchema } from "@/server/modules/content/schemas";
import * as content from "@/server/modules/content/service";
import { listPublished, published } from "@/server/modules/content/public";
import * as operations from "@/server/modules/operations/service";
import { assertApiRoute, devAuthEnabled } from "@/server/security/routes";
import * as oauth from "@/server/modules/identity/oauth";
import * as mfa from "@/server/modules/identity/mfa";
import {
  redirectSave,
  redirects,
  schedule,
} from "@/server/modules/content/editorial";
import { media } from "@/server/modules/media/service";
import { cartIdReadOnly, snapshot as cartSnapshot } from "@/server/modules/cart/service";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const uuid = z.string().uuid();
const version = z.number().int().min(0);
async function dispatch(req: Request, { params }: Context) {
  return endpoint(async () => {
    const path = (await params).path,
      [area, id, action] = path,
      url = new URL(req.url),
      method = req.method;
    assertApiRoute(path, method);
    if (area === "webhooks" && id === "razorpay" && method === "POST")
      return json(await webhook(req));
    if (area === "health") {
      if (id === "ready") {
        const ready = await pool.query(
          "SELECT 1 FROM schema_migrations WHERE name='009_transient_cleanup.sql'",
        );
        if (!ready.rowCount)
          throw new AppError(503, "NOT_READY", "Service is not ready");
      }
      return json({ status: "ok" });
    }
    if (area === "csrf" && method === "GET") {
      const existing = cookieValue(req, "csrf");
      const raw = /^[A-Za-z0-9_-]{43}$/.test(existing) ? existing : token();
      const response = json({ token: raw });
      response.headers.append("Set-Cookie", cookie("csrf", raw));
      return response;
    }
    if (area === "auth" && id === "dev-login" && method === "POST") {
      if (!devAuthEnabled()) {
        throw new AppError(404, "NOT_FOUND", "Endpoint not found");
      }
      csrf(req);
      const email = "director@thewellnesshouse.local";
      let user = (
        await pool.query(
          "SELECT id FROM users WHERE contact_email=$1 AND status='active'",
          [email],
        )
      ).rows[0];
      if (!user) {
        user = (
          await pool.query(
            "INSERT INTO users(display_name, contact_email) VALUES($1, $2) RETURNING id",
            ["House Director (Admin)", email],
          )
        ).rows[0];
      }
      await pool.query(
        "INSERT INTO staff_roles(user_id, role) VALUES($1, 'owner') ON CONFLICT DO NOTHING",
        [user.id],
      );
      const raw = token();
      await pool.query(
        "INSERT INTO sessions(token_hash, user_id, expires_at, staff_step_up_at) VALUES($1, $2, now()+interval '7 days', now())",
        [hash(raw), user.id],
      );
      const response = json({ ok: true, redirect: "/admin" });
      response.headers.append("Set-Cookie", cookie("session", raw, 604800));
      return response;
    }
    if (area === "auth" && id === "dev-stepup" && method === "POST") {
      if (!devAuthEnabled()) {
        throw new AppError(404, "NOT_FOUND", "Endpoint not found");
      }
      csrf(req);
      const curSession = await session(req);
      if (!curSession) throw new AppError(401, "SIGN_IN", "Sign in required");
      await pool.query(
        "UPDATE sessions SET staff_step_up_at=now() WHERE id=$1",
        [curSession.id],
      );
      return json({ ok: true });
    }
    if (area === "auth" && ["google", "apple"].includes(id)) {
      const provider = id as "google" | "apple";
      if (action === "callback") return oauth.callback(req, provider);
      if (method === "POST") {
        csrf(req);
        return oauth.begin(req, provider, action === "link");
      }
      throw new AppError(405, "METHOD", "Use POST to start sign-in");
    }
    if (method !== "GET" && method !== "HEAD") csrf(req);

    // Bootstrap: single request that returns user + cart + saved rituals
    if (area === "bootstrap" && method === "GET") {
      const p = await session(req);
      const guest = cookieValue(req, "guest") || "";
      // Run all lookups in parallel
      const [cartResult, savedResult, identitiesResult, prefsResult] = await Promise.all([
        (async () => {
          const id = await cartIdReadOnly(p, guest).catch(() => null);
          if (!id) return { id: "", version: 0, items: [] };
          return cartSnapshot(id);
        })(),
        p
          ? pool.query(
              "SELECT e.slug FROM saved_rituals s JOIN content_entities e ON e.id=s.product_id WHERE s.user_id=$1 AND e.live_revision_id IS NOT NULL AND e.lifecycle='active'",
              [p.userId],
            ).then(r => r.rows.map((r: any) => r.slug))
          : Promise.resolve([]),
        p
          ? pool.query("SELECT provider FROM auth_identities WHERE user_id=$1", [p.userId])
          : Promise.resolve({ rows: [] }),
        p
          ? pool.query("SELECT locale,reduced_motion,marketing_email,version FROM customer_preferences WHERE user_id=$1", [p.userId])
          : Promise.resolve({ rows: [] }),
      ]);
      return json({
        user: p
          ? {
              userId: p.userId,
              name: p.name,
              email: p.email,
              roles: p.roles,
              stepUp: p.stepUp,
              identities: identitiesResult.rows,
              preferences: prefsResult.rows[0] || null,
            }
          : null,
        cart: cartResult,
        savedRituals: savedResult,
      });
    }

    const p = [
      "products",
      "collections",
      "journal",
      "videos",
      "locations",
      "search",
      "variants",
      "video-events",
    ].includes(area)
      ? null
      : await session(req);
    const customerResponse = await customerRoute(req, path, p);
    if (customerResponse) return customerResponse;
    if (area === "me" && method === "GET" && (!id || id === "consultations")) {
      if (id === "consultations") {
        authenticated(p);
        return json(
          (
            await pool.query(
              "SELECT id,preferred_date,preferred_window,status,location,created_at FROM consultation_requests WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
              [p.userId],
            )
          ).rows,
        );
      }
      if (!p) return json(null);
      // Fetch identities and preferences in parallel to avoid waterfall
      const [identitiesResult, prefsResult] = await Promise.all([
        pool.query(
          "SELECT provider FROM auth_identities WHERE user_id=$1",
          [p.userId],
        ),
        pool.query(
          "SELECT locale,reduced_motion,marketing_email,version FROM customer_preferences WHERE user_id=$1",
          [p.userId],
        ),
      ]);
      return json({
        userId: p.userId,
        name: p.name,
        email: p.email,
        roles: p.roles,
        stepUp: p.stepUp,
        identities: identitiesResult.rows,
        preferences: prefsResult.rows[0] || null,
      });
    }
    if (area === "logout" && method === "POST") {
      if (p)
        await pool.query("UPDATE sessions SET revoked_at=now() WHERE id=$1", [
          p.id,
        ]);
      const response = json({ ok: true });
      response.headers.append("Set-Cookie", cookie("session", "", 0));
      response.headers.append("Set-Cookie", cookie("guest", token(), 2592000));
      response.headers.append("Set-Cookie", cookie("purchase", "", 0));
      await clearPurchaseCookies(req, response);
      return response;
    }
    if (area === "account" && id === "unlink" && method === "POST") {
      authenticated(p);
      if (Date.now() - p.createdAt.getTime() > 300000)
        throw new AppError(
          403,
          "REAUTHENTICATE",
          "Sign in again before unlinking",
        );
      const input = await body(
        req,
        z.object({ provider: z.enum(["google", "apple"]) }).strict(),
      );
      await transaction(async (c) => {
        await c.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [
          p.userId,
        ]);
        if (
          (
            await c.query("SELECT id FROM auth_identities WHERE user_id=$1", [
              p.userId,
            ])
          ).rowCount! <= 1
        )
          throw new AppError(
            409,
            "LAST_IDENTITY",
            "Keep at least one sign-in method",
          );
        await c.query(
          "DELETE FROM auth_identities WHERE user_id=$1 AND provider=$2",
          [p.userId, input.provider],
        );
      });
      return json({ ok: true });
    }
    if (area === "mfa" && method === "POST") {
      await limit(req, "mfa", 15, p?.userId);
      const register = id === "register";
      if (action === "options") return json(await mfa.options(p, register));
      if (action === "verify") {
        const input = await body(
          req,
          z.object({ response: z.record(z.string(), z.unknown()) }).strict(),
        );
        const verified = await mfa.verify(p, register, input.response as any);
        authenticated(p);
        const raw = token();
        await pool.query("UPDATE sessions SET token_hash=$2 WHERE id=$1", [
          p.id,
          hash(raw),
        ]);
        const response = json(verified);
        response.headers.append("Set-Cookie", cookie("session", raw, 604800));
        return response;
      }
    }
    if (area === "media") {
      await limit(req, "media", 100, p?.userId);
      return media(req, id, p);
    }
    if (
      (area === "consultation-requests" && method === "POST") ||
      (area === "contact-inquiries" && method === "POST")
    ) {
      await limit(req, "forms", 10);
      const key = z.string().uuid().parse(req.headers.get("idempotency-key"));
      const kind =
        area === "consultation-requests" ? "consultations" : "inquiries";
      return json(
        await operations.submit(kind, await body(req, z.unknown()), p, key),
        201,
      );
    }
    if (area === "saved-rituals") {
      if (method === "GET" && !p) return json([]);
      authenticated(p);
      if (method === "GET")
        return json(
          (
            await pool.query(
              "SELECT e.slug FROM saved_rituals s JOIN content_entities e ON e.id=s.product_id WHERE s.user_id=$1 AND e.live_revision_id IS NOT NULL AND e.lifecycle='active'",
              [p.userId],
            )
          ).rows.map((r) => r.slug),
        );
      const input = await body(
        req,
        z.object({ slug: z.string().max(120) }).strict(),
      );
      const product = (
        await pool.query(
          "SELECT id FROM content_entities WHERE kind='products' AND slug=$1 AND live_revision_id IS NOT NULL AND lifecycle='active'",
          [input.slug],
        )
      ).rows[0];
      if (!product) throw new AppError(404, "PRODUCT", "Ritual unavailable");
      if (method === "POST")
        await pool.query(
          "INSERT INTO saved_rituals VALUES($1,$2) ON CONFLICT DO NOTHING",
          [p.userId, product.id],
        );
      else if (method === "DELETE")
        await pool.query(
          "DELETE FROM saved_rituals WHERE user_id=$1 AND product_id=$2",
          [p.userId, product.id],
        );
      return json({ ok: true });
    }
    if (area === "admin") {
      const kindResult = kindSchema.safeParse(id),
        entityId = action,
        verb = path[3];
      if (id === "redirects") {
        authorize(p, "content.publish");
        if (method === "GET") return json(await redirects());
        const input = await body(
          req,
          z
            .object({
              source: z.string(),
              target: z.string(),
              status: z.union([z.literal(301), z.literal(308)]).default(308),
            })
            .strict(),
        );
        return json(
          await redirectSave(p, input.source, input.target, input.status),
        );
      }
      if (id === "integrations" && method === "GET") {
        authorize(p, "staff.manage");
        return json({
          google: !!(
            process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
          ),
          apple: !!(
            process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
          ),
          email: !!(process.env.MAIL_API_KEY && process.env.MAIL_FROM),
          commerce: !!(
            process.env.RAZORPAY_KEY_ID &&
            process.env.RAZORPAY_KEY_SECRET &&
            process.env.RAZORPAY_WEBHOOK_SECRET
          ),
          scheduling: true,
        });
      }
      if (verb === "schedule" && method === "POST") {
        uuid.parse(entityId);
        const input = await body(
          req,
          z
            .object({
              revisionId: uuid,
              expectedVersion: version,
              publishAt: z.string().datetime(),
            })
            .strict(),
        );
        return json(
          await schedule(
            p,
            entityId,
            input.revisionId,
            input.expectedVersion,
            input.publishAt,
          ),
          201,
        );
      }

      if (kindResult.success) {
        const kind = kindResult.data;
        if (method === "GET" && !entityId)
          return json(
            await content.listAdmin(
              p,
              kind,
              url.searchParams.get("after") || "",
            ),
          );
        if (method === "GET" && entityId) {
          authorize(p, "content.read");
          uuid.parse(entityId);
          return json(
            (
              await pool.query(
                "SELECT r.* FROM content_revisions r JOIN content_entities e ON e.id=r.entity_id WHERE e.id=$1 AND e.kind=$2 ORDER BY r.revision_number DESC LIMIT 50",
                [entityId, kind],
              )
            ).rows,
          );
        }
        if (method === "POST" && (!entityId || verb === "revisions")) {
          const input = await body(
            req,
            z
              .object({
                slug: z.string(),
                expectedVersion: version,
                content: z.unknown(),
                seo: z.unknown(),
              })
              .strict(),
          );
          if (entityId) uuid.parse(entityId);
          return json(
            await content.save(p, kind, { ...input, id: entityId }),
            201,
          );
        }
        if (
          method === "POST" &&
          ["publish", "unpublish", "rollback"].includes(verb)
        ) {
          uuid.parse(entityId);
          const input = await body(
            req,
            z
              .object({ expectedVersion: version, revisionId: uuid.optional() })
              .strict(),
          );
          return json(
            await content.publish(
              p,
              entityId,
              input.expectedVersion,
              input.revisionId,
              verb === "unpublish",
            ),
          );
        }
        if (method === "POST" && verb === "preview-links") {
          uuid.parse(entityId);
          const input = await body(
            req,
            z
              .object({
                revisionId: uuid,
                hours: z.number().int().min(1).max(168).default(72),
                requireLogin: z.boolean().default(false),
              })
              .strict(),
          );
          return json(
            await content.previewLink(
              p,
              entityId,
              input.revisionId,
              input.hours,
              input.requireLogin,
            ),
            201,
          );
        }
      }
      if (id === "preview-links") {
        const actor = authorize(p, "content.preview");
        if (method === "GET")
          return json(
            (
              await pool.query(
                "SELECT id,entity_id,revision_id,expires_at,revoked_at,require_reviewer_login FROM preview_links ORDER BY expires_at DESC LIMIT 50",
              )
            ).rows,
          );
        if (method === "DELETE") {
          uuid.parse(entityId);
          await transaction(async (c) => {
            await c.query(
              "UPDATE preview_links SET revoked_at=now() WHERE id=$1",
              [entityId],
            );
            await content.audit(c, actor.userId, "preview.revoke", entityId);
          });
          return json({ ok: true });
        }
      }
      if (id === "consultations" || id === "inquiries") {
        if (method === "GET" && !entityId)
          return json(
            await operations.listOperations(
              p,
              id,
              url.searchParams.get("after") || "",
            ),
          );
        if (method === "PATCH") {
          uuid.parse(entityId);
          return json(
            await operations.updateOperation(
              p,
              id,
              entityId,
              await body(
                req,
                z
                  .object({
                    status: z.string(),
                    version,
                    assignedTo: uuid.nullable().optional(),
                  })
                  .strict(),
              ),
            ),
          );
        }
        if (verb === "notes" && method === "GET" && id === "consultations") {
          const actor = authorize(p, "operations");
          const row = (
            await pool.query(
              "SELECT n.ciphertext,c.assigned_to FROM consultation_private_notes n JOIN consultation_requests c ON c.id=n.request_id WHERE c.id=$1",
              [uuid.parse(entityId)],
            )
          ).rows[0];
          if (!row || row.assigned_to !== actor.userId)
            throw new AppError(404, "NOT_FOUND", "Notes not found");
          await transaction((c) =>
            content.audit(c, actor.userId, "notes.read", entityId),
          );
          return json({ notes: decrypt(row.ciphertext) });
        }
      }
      if (id === "staff") {
        const actor = authorize(p, "staff.manage");
        if (method === "GET")
          return json(
            (
              await pool.query(
                "SELECT u.id,u.display_name,u.contact_email,r.role FROM staff_roles r JOIN users u ON u.id=r.user_id ORDER BY u.id LIMIT 50",
              )
            ).rows,
          );
        if (method === "POST" && entityId === "invite") {
          const input = await body(
            req,
            z
              .object({
                email: z.string().email(),
                roles: z
                  .array(
                    z.enum([
                      "admin",
                      "editor",
                      "publisher",
                      "concierge",
                      "fulfillment",
                      "finance",
                    ]),
                  )
                  .min(1)
                  .max(6),
              })
              .strict(),
          );
          const raw = token();
          const invitation = await transaction(async (c) => {
            const row = (
              await c.query(
                "INSERT INTO staff_invitations(email,roles,token_hash,expires_at) VALUES($1,$2,$3,now()+interval '3 days') RETURNING id",
                [
                  input.email.toLowerCase(),
                  JSON.stringify(input.roles),
                  hash(raw),
                ],
              )
            ).rows[0];
            await content.audit(c, actor.userId, "staff.invite", row.id);
            return row;
          });
          return json({ ...invitation, token: raw }, 201);
        }
        if (method === "DELETE") {
          uuid.parse(entityId);
          if (entityId === actor.userId)
            throw new AppError(422, "SELF", "Cannot remove your own roles");
          await transaction(async (c) => {
            await c.query(
              "DELETE FROM staff_roles WHERE user_id=$1 AND role<>'owner'",
              [entityId],
            );
            await c.query(
              "UPDATE sessions SET revoked_at=now() WHERE user_id=$1",
              [entityId],
            );
            await content.audit(c, actor.userId, "staff.remove", entityId);
          });
          return json({ ok: true });
        }
      }
      if (id === "jobs" && method === "GET") {
        authorize(p, "staff.manage");
        return json(
          (
            await pool.query(
              "SELECT id,type,state,attempts,available_at,last_error FROM jobs ORDER BY available_at DESC LIMIT 50",
            )
          ).rows,
        );
      }
      throw new AppError(404, "NOT_FOUND", "Unknown admin endpoint");
    }
    if (area === "staff-invitations" && method === "POST") {
      authenticated(p);
      const input = await body(
        req,
        z.object({ token: z.string().min(40).max(100) }).strict(),
      );
      await transaction(async (c) => {
        const invite = (
          await c.query(
            "SELECT * FROM staff_invitations WHERE token_hash=$1 AND expires_at>now() AND revoked_at IS NULL AND accepted_by IS NULL FOR UPDATE",
            [hash(input.token)],
          )
        ).rows[0];
        if (
          !invite ||
          !(
            await c.query(
              "SELECT 1 FROM auth_identities WHERE user_id=$1 AND lower(email)=$2 AND email_verified",
              [p.userId, invite.email],
            )
          ).rowCount
        )
          throw new AppError(403, "INVITATION", "Invalid invitation");
        for (const role of invite.roles)
          await c.query(
            "INSERT INTO staff_roles VALUES($1,$2) ON CONFLICT DO NOTHING",
            [p.userId, role],
          );
        await c.query(
          "UPDATE staff_invitations SET accepted_by=$2 WHERE id=$1",
          [invite.id, p.userId],
        );
        await c.query(
          "UPDATE sessions SET staff_step_up_at=NULL WHERE user_id=$1",
          [p.userId],
        );
        await content.audit(c, p.userId, "staff.accept", invite.id);
      });
      return json({ ok: true });
    }
    if (area === "search" && method === "GET") {
      await limit(req, "search", 60);
      const q = z
        .string()
        .trim()
        .min(2)
        .max(100)
        .parse(url.searchParams.get("q"));
      return json(
        (
          await pool.query(
            `SELECT e.kind,e.slug,r.content->>'title' AS title,r.content->>'subtitle' AS subtitle FROM content_entities e JOIN content_revisions r ON r.id=e.live_revision_id WHERE e.kind IN ('products','journal') AND e.lifecycle='active' AND to_tsvector('english',coalesce(r.content->>'title','')||' '||coalesce(r.content->>'overview',r.content->>'excerpt','')) @@ plainto_tsquery('english',$1) ORDER BY e.id LIMIT 50`,
            [q],
          )
        ).rows,
      );
    }
    if (area === "video-events" && method === "POST") {
      await limit(req, "video-events", 60);
      const events = await body(
        req,
        z
          .array(
            z
              .object({
                eventId: uuid,
                videoId: uuid,
                event: z.enum([
                  "impression",
                  "play_start",
                  "play_complete",
                  "cta_click",
                ]),
              })
              .strict(),
          )
          .max(20),
      );
      await transaction(async (c) => {
        for (const event of events)
          await c.query(
            "INSERT INTO video_events SELECT $1,id,$3,now() FROM content_entities WHERE id=$2 AND kind='videos' AND live_revision_id IS NOT NULL ON CONFLICT DO NOTHING",
            [event.eventId, event.videoId, event.event],
          );
      });
      return json({ ok: true });
    }
    const kind = kindSchema.safeParse(area);
    if (
      method === "GET" &&
      kind.success &&
      ["products", "collections", "journal", "videos", "locations"].includes(
        kind.data,
      )
    ) {
      if (id) {
        const row = await published(kind.data, id);
        if (!row) throw new AppError(404, "NOT_FOUND", "Not found");
        return json(
          { ...row.content, id: row.id, slug: row.slug },
          200,
          "public, s-maxage=60, stale-while-revalidate=300",
        );
      }
      let rows = await listPublished(
        kind.data,
        Number(url.searchParams.get("limit") || 50),
        url.searchParams.get("after") || "",
      );
      if (area === "videos")
        rows = rows.filter(
          (r) =>
            r.content.isActive &&
            (!url.searchParams.get("placement") ||
              r.content.placement === url.searchParams.get("placement")) &&
            (!r.content.campaignStartDate ||
              new Date(r.content.campaignStartDate) <= new Date()) &&
            (!r.content.campaignEndDate ||
              new Date(r.content.campaignEndDate) > new Date()),
        );
      return json(
        rows.map((r) => ({ ...r.content, id: r.id, slug: r.slug })),
        200,
        "public, s-maxage=60, stale-while-revalidate=300",
      );
    }
    throw new AppError(404, "NOT_FOUND", "Endpoint not found");
  });
}
export {
  dispatch as GET,
  dispatch as POST,
  dispatch as PUT,
  dispatch as DELETE,
  dispatch as PATCH,
};
