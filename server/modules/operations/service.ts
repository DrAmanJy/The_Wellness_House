import { z } from "zod";
import { transaction, pool } from "../../db";
import { encrypt, hash } from "../../security/crypto";
import { AppError } from "../../security/http";
import { authorize, type Principal } from "../../security/session";
import { audit } from "../content/service";
const short = z.string().trim().min(1).max(200);
export const consultationSchema = z
  .object({
    fullName: short,
    email: z.string().email().max(254),
    phone: z.string().min(7).max(30),
    preferredAtelier: z.enum(["new-delhi", "mumbai", "virtual-video"]),
    preferredDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine(
        (v) =>
          !Number.isNaN(Date.parse(v)) &&
          v >= new Date().toISOString().slice(0, 10),
        "Choose a future date",
      ),
    preferredTime: short,
    ritualFocus: short,
    notes: z.string().max(5000).default(""),
    consent: z.literal(true),
  })
  .strict();
export const inquirySchema = z
  .object({
    name: short,
    email: z.string().email().max(254),
    subject: short,
    message: z.string().trim().min(1).max(5000),
    consent: z.literal(true),
  })
  .strict();
export async function submit(
  kind: "consultations" | "inquiries",
  input: unknown,
  p: Principal | null,
  key: string,
) {
  const value =
    kind === "consultations"
      ? consultationSchema.parse(input)
      : inquirySchema.parse(input);
  const requestHash = hash(JSON.stringify(value)),
    scope = `${kind}:${p?.userId || hash(value.email.toLowerCase())}`;
  return transaction(async (c) => {
    await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
      scope + key,
    ]);
    const prior = (
      await c.query(
        "SELECT * FROM idempotency_keys WHERE scope=$1 AND key=$2",
        [scope, key],
      )
    ).rows[0];
    if (prior) {
      if (prior.request_hash !== requestHash)
        throw new AppError(
          409,
          "IDEMPOTENCY",
          "This request key was already used with different details",
        );
      return prior.response_body;
    }
    let id: string;
    if ("fullName" in value) {
      if (
        !(
          await c.query(
            "SELECT 1 FROM content_entities e JOIN content_revisions r ON r.id=e.live_revision_id WHERE e.kind='locations' AND e.slug=$1 AND r.content->>'active'='true'",
            [value.preferredAtelier],
          )
        ).rowCount
      )
        throw new AppError(422, "LOCATION", "Location is unavailable");
      id = (
        await c.query(
          "INSERT INTO consultation_requests(user_id,full_name,email,phone,location,preferred_date,preferred_window,focus_label) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id",
          [
            p?.userId,
            value.fullName,
            value.email,
            value.phone,
            value.preferredAtelier,
            value.preferredDate,
            value.preferredTime,
            value.ritualFocus,
          ],
        )
      ).rows[0].id;
      if (value.notes)
        await c.query(
          "INSERT INTO consultation_private_notes VALUES($1,$2,$3)",
          [id, encrypt(value.notes), process.env.NOTES_KEY_VERSION || "v1"],
        );
    } else
      id = (
        await c.query(
          "INSERT INTO contact_inquiries(user_id,name,email,subject,message) VALUES($1,$2,$3,$4,$5) RETURNING id",
          [p?.userId, value.name, value.email, value.subject, value.message],
        )
      ).rows[0].id;
    await c.query(
      "INSERT INTO consent_events(subject_reference,purpose,policy_version,granted) VALUES($1,$2,$3,true)",
      [id, kind, "2026-10-16"],
    );
    for (const audience of ["customer", "staff"])
      await c.query(
        "INSERT INTO jobs(type,payload,dedupe_key) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
        [
          "notification",
          JSON.stringify({ kind, id, audience }),
          `${kind}:${id}:${audience}`,
        ],
      );
    const result = {
      id,
      status: kind === "consultations" ? "requested" : "new",
    };
    await c.query(
      "INSERT INTO idempotency_keys(scope,key,request_hash,response_body) VALUES($1,$2,$3,$4)",
      [scope, key, requestHash, JSON.stringify(result)],
    );
    return result;
  });
}
export async function listOperations(
  p: Principal | null,
  kind: "consultations" | "inquiries",
  after = "",
) {
  const actor = authorize(p, "operations");
  const table =
    kind === "consultations" ? "consultation_requests" : "contact_inquiries";
  return (
    await pool.query(
      `SELECT * FROM ${table} WHERE id::text>$1 AND ($2::boolean OR assigned_to=$3 OR assigned_to IS NULL) ORDER BY id LIMIT 50`,
      [
        after,
        actor.roles.some((r) => ["owner", "admin"].includes(r)),
        actor.userId,
      ],
    )
  ).rows;
}
export async function updateOperation(
  p: Principal | null,
  kind: "consultations" | "inquiries",
  id: string,
  input: { status: string; version: number; assignedTo?: string | null },
) {
  const actor = authorize(p, "operations");
  const table =
    kind === "consultations" ? "consultation_requests" : "contact_inquiries";
  const allowed =
    kind === "consultations"
      ? ["requested", "scheduled", "cancelled", "completed"]
      : ["new", "in_progress", "resolved"];
  if (!allowed.includes(input.status))
    throw new AppError(422, "STATUS", "Invalid status");
  return transaction(async (c) => {
    const current = (
      await c.query(`SELECT * FROM ${table} WHERE id=$1 FOR UPDATE`, [id])
    ).rows[0];
    if (!current) throw new AppError(404, "NOT_FOUND", "Request not found");
    if (
      current.assigned_to &&
      current.assigned_to !== actor.userId &&
      !actor.roles.some((r) => ["owner", "admin"].includes(r))
    )
      throw new AppError(403, "ASSIGNMENT", "Access denied");
    if (
      input.assignedTo &&
      !actor.roles.some((r) => ["owner", "admin"].includes(r)) &&
      input.assignedTo !== actor.userId
    )
      throw new AppError(
        403,
        "ASSIGNMENT",
        "Cannot assign another staff member",
      );
    const result = await c.query(
      `UPDATE ${table} SET status=$2,assigned_to=COALESCE($4,assigned_to),version=version+1 WHERE id=$1 AND version=$3 RETURNING id,version`,
      [id, input.status, input.version, input.assignedTo],
    );
    if (!result.rowCount) throw new AppError(409, "VERSION", "Request changed");
    await audit(c, actor.userId, "operations.update", id, {
      status: input.status,
    });
    return result.rows[0];
  });
}
