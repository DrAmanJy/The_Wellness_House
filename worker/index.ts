import {
  initiate,
  processCapture,
  refund,
  reconcile,
} from "../server/modules/commerce/service";
import { customerMail } from "./customer-jobs";
import { randomUUID } from "node:crypto";
import { publish } from "../server/modules/content/service";
import { pool, transaction } from "../server/db";
export async function claim() {
  return transaction(async (c) => {
    const row = (
      await c.query(
        `SELECT * FROM jobs WHERE (state='queued' AND available_at<=now()) OR (state='running' AND locked_until<now()) ORDER BY available_at,id FOR UPDATE SKIP LOCKED LIMIT 1`,
      )
    ).rows[0];
    if (!row) return null;
    const lease = randomUUID();
    await c.query(
      "UPDATE jobs SET state='running',attempts=attempts+1,locked_until=now()+interval '2 minutes',lease_token=$2 WHERE id=$1",
      [row.id, lease],
    );
    return { ...row, lease, attempts: row.attempts + 1 };
  });
}
async function notification(job: any) {
  const { kind, id, audience } = job.payload;
  const table =
    kind === "consultations" ? "consultation_requests" : "contact_inquiries";
  const row = (
    await pool.query(
      `SELECT email,${kind === "consultations" ? "full_name" : "name"} AS name FROM ${table} WHERE id=$1`,
      [id],
    )
  ).rows[0];
  if (!row) return;
  if (
    !process.env.MAIL_API_KEY ||
    !process.env.MAIL_FROM ||
    !process.env.STAFF_NOTIFICATION_EMAIL
  )
    throw new Error("MAIL_NOT_CONFIGURED");
  const to =
    audience === "staff" ? process.env.STAFF_NOTIFICATION_EMAIL : row.email;
  const template = (
    await pool.query(
      "SELECT r.content FROM content_entities e JOIN content_revisions r ON r.id=e.live_revision_id WHERE e.kind='email-templates' AND e.slug=$1",
      [`${kind}-${audience}`],
    )
  ).rows[0]?.content;
  const variables: Record<string, string> = {
    name: row.name,
    reference: id,
    status: kind === "consultations" ? "requested" : "received",
  };
  const render = (value: string) =>
    value.replace(
      /\{\{(name|reference|status)\}\}/g,
      (_, key) => variables[key],
    );
  const subject = template
    ? render(template.subject)
    : "The Wellness House — request received";
  const text = template
    ? render(template.body)
    : `Your request reference is ${id}. Our team will follow up. A consultation time is confirmed separately.`;
  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MAIL_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": job.dedupe_key,
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: [to],
      subject,
      text,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!result.ok) throw new Error(`MAIL_HTTP_${result.status}`);
}
async function scheduled(job: any) {
  const scheduled = (
    await pool.query(
      "SELECT s.*,u.status AS user_status FROM scheduled_publications s JOIN users u ON u.id=s.actor_id WHERE s.id=$1",
      [job.payload.scheduleId],
    )
  ).rows[0];
  if (!scheduled || scheduled.status !== "queued") return;
  const roles = (
    await pool.query("SELECT role FROM staff_roles WHERE user_id=$1", [
      scheduled.actor_id,
    ])
  ).rows.map((r) => r.role);
  if (
    scheduled.user_status !== "active" ||
    !roles.some((r) => ["owner", "publisher"].includes(r))
  ) {
    await pool.query(
      "UPDATE scheduled_publications SET status='rejected' WHERE id=$1",
      [scheduled.id],
    );
    return;
  }
  try {
    await publish(
      {
        id: "scheduled",
        userId: scheduled.actor_id,
        name: "",
        email: null,
        roles,
        stepUp: new Date(),
        createdAt: new Date(),
      },
      scheduled.entity_id,
      scheduled.expected_version,
      scheduled.revision_id,
    );
    await pool.query(
      "UPDATE scheduled_publications SET status='completed' WHERE id=$1",
      [scheduled.id],
    );
  } catch (e) {
    if (
      e instanceof Error &&
      "status" in e &&
      [409, 422].includes(Number(e.status))
    ) {
      await pool.query(
        "UPDATE scheduled_publications SET status='rejected' WHERE id=$1",
        [scheduled.id],
      );
      return;
    }
    throw e;
  }
}
export async function tick() {
  const job = await claim();
  if (!job) return false;
  try {
    if (job.type === "notification") await notification(job);
    else if (job.type === "payment-initiate")
      await initiate(job.payload.orderId);
    else if (job.type === "payment-captured")
      await processCapture(job.payload.paymentId, job.payload.eventId);
    else if (job.type === "payment-refund") await refund(job.payload.refundId);
    else if (["contact-verification", "order-receipt"].includes(job.type))
      await customerMail(job);
    else if (job.type === "publish") await scheduled(job);
    else throw new Error("UNKNOWN_JOB_TYPE");
    await pool.query(
      "UPDATE jobs SET state='completed',completed_at=now(),locked_until=NULL WHERE id=$1 AND lease_token=$2",
      [job.id, job.lease],
    );
  } catch {
    await pool.query(
      "UPDATE jobs SET state=$3,available_at=now()+$4*interval '1 second',locked_until=NULL,last_error='DELIVERY_FAILED' WHERE id=$1 AND lease_token=$2",
      [
        job.id,
        job.lease,
        job.attempts >= 8 ? "failed" : "queued",
        Math.min(3600, 2 ** job.attempts * 10),
      ],
    );
  }
  return true;
}
export async function cleanupTransient() {
  // Bounded batches remove only disposable security/rate-limit state, never audit or financial records.
  for (const table of [
    "rate_limit_buckets",
    "oauth_transactions",
    "staff_challenges",
  ])
    await pool.query(
      `DELETE FROM ${table} WHERE ctid IN (SELECT ctid FROM ${table} WHERE expires_at<now() LIMIT 1000)`,
    );
}
if (process.argv[1]?.replace(/\\/g, "/").endsWith("worker/index.ts")) {
  let stop = false;
  process.on("SIGINT", () => {
    stop = true;
  });
  process.on("SIGTERM", () => {
    stop = true;
  });
  let lastReconcile = 0;
  while (!stop) {
    if (Date.now() - lastReconcile > 60000) {
      lastReconcile = Date.now();
      try {
        await cleanupTransient();
        await reconcile();
      } catch {
        console.error(
          JSON.stringify({ code: "COMMERCE_RECONCILIATION_FAILED" }),
        );
      }
    }
    if (!(await tick())) await new Promise((r) => setTimeout(r, 1000));
  }
  await pool.end();
}
