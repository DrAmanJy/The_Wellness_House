import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { pool } from "../server/db";
import { assertApiRoute, devAuthEnabled } from "../server/security/routes";
import { session, type Principal } from "../server/security/session";
import { cookieName, readRawBody } from "../server/security/http";
import { token, hash, decrypt } from "../server/security/crypto";
import * as customers from "../server/modules/customers/service";
import * as publicContent from "../server/modules/content/public";
import { verify } from "../server/modules/identity/mfa";
import { webhook } from "../server/modules/commerce/service";
import { cleanupTransient } from "../worker/index";
import { api } from "../lib/api-client";
after(() => pool.end());
async function customer(): Promise<Principal> {
  const user = (
    await pool.query(
      "INSERT INTO users(display_name,contact_email) VALUES('Security fixture','security@example.invalid') RETURNING id",
    )
  ).rows[0];
  return {
    id: randomUUID(),
    userId: user.id,
    name: "Security fixture",
    email: "security@example.invalid",
    roles: [],
    stepUp: null,
    createdAt: new Date(),
  };
}
test("routes reject extra suffixes, unused aliases and unsupported methods", () => {
  for (const [path, method] of [
    ["me/profile/ignored", "GET"],
    ["cart/items/a/ignored", "POST"],
    ["checkout-sessions/a/orders", "POST"],
    ["me/orders/a/confirm-payment", "POST"],
    ["auth/google/unknown", "POST"],
    ["health/fake", "GET"],
  ])
    assert.throws(
      () => assertApiRoute(path.split("/"), method),
      (e: any) => e.status === 404,
    );
  for (const [path, method] of [
    ["cart", "POST"],
    ["me/addresses/a", "POST"],
    ["admin/redirects", "DELETE"],
    ["auth/google/callback", "POST"],
    ["csrf", "DELETE"],
  ])
    assert.throws(
      () => assertApiRoute(path.split("/"), method),
      (e: any) => e.status === 405,
    );
  for (const path of [
    "mfa/register/options",
    "mfa/verify/verify",
    "checkout-sessions/a/payment-attempts",
    "checkout-sessions/a/payment-status",
  ])
    assert.doesNotThrow(() => assertApiRoute(path.split("/"), "POST"));
});
test("both development authentication shortcuts require explicit non-production opt-in", () => {
  const oldNode = (process.env as Record<string, string | undefined>).NODE_ENV,
    oldFlag = process.env.ALLOW_DEV_ADMIN_AUTH;
  try {
    (process.env as Record<string, string | undefined>).NODE_ENV =
      "development";
    delete process.env.ALLOW_DEV_ADMIN_AUTH;
    assert.equal(devAuthEnabled(), false);
    process.env.ALLOW_DEV_ADMIN_AUTH = "true";
    assert.equal(devAuthEnabled(), true);
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    assert.equal(devAuthEnabled(), false);
  } finally {
    if (oldNode === undefined)
      delete (process.env as Record<string, string | undefined>).NODE_ENV;
    else (process.env as Record<string, string | undefined>).NODE_ENV = oldNode;
    if (oldFlag === undefined) delete process.env.ALLOW_DEV_ADMIN_AUTH;
    else process.env.ALLOW_DEV_ADMIN_AUTH = oldFlag;
  }
});
test("session reads retain immediate revocation and fresh roles without writing every request", async () => {
  const p = await customer(),
    raw = token();
  const row = (
    await pool.query(
      "INSERT INTO sessions(token_hash,user_id,expires_at,last_seen_at) VALUES($1,$2,now()+interval '1 hour',now()-interval '1 minute') RETURNING id,last_seen_at",
      [hash(raw), p.userId],
    )
  ).rows[0];
  const req = () =>
    new Request("http://localhost:3000", {
      headers: { cookie: cookieName("session") + "=" + raw },
    });
  assert((await session(req()))?.userId === p.userId);
  assert.equal(
    (
      await pool.query("SELECT last_seen_at FROM sessions WHERE id=$1", [
        row.id,
      ])
    ).rows[0].last_seen_at.getTime(),
    row.last_seen_at.getTime(),
  );
  await pool.query("INSERT INTO staff_roles VALUES($1,'editor')", [p.userId]);
  assert.deepEqual((await session(req()))?.roles, ["editor"]);
  await pool.query(
    "UPDATE sessions SET last_seen_at=now()-interval '6 minutes' WHERE id=$1",
    [row.id],
  );
  assert(await session(req()));
  assert(
    (
      await pool.query(
        "SELECT last_seen_at>now()-interval '1 minute' AS touched FROM sessions WHERE id=$1",
        [row.id],
      )
    ).rows[0].touched,
  );
  await pool.query("UPDATE sessions SET revoked_at=now() WHERE id=$1", [
    row.id,
  ]);
  assert.equal(await session(req()), null);
});
test("account reads create no rows and writes persist explicit defaults", async () => {
  const p = await customer();
  assert.equal((await customers.profile(p)).version, 0);
  assert.equal((await customers.preferences(p)).marketing_email, false);
  assert.equal(
    (
      await pool.query(
        "SELECT count(*) FROM customer_profiles WHERE user_id=$1",
        [p.userId],
      )
    ).rows[0].count,
    "0",
  );
  assert.equal(
    (
      await pool.query(
        "SELECT count(*) FROM customer_preferences WHERE user_id=$1",
        [p.userId],
      )
    ).rows[0].count,
    "0",
  );
  await customers.saveProfile(p, {
    name: p.name,
    email: p.email,
    phone: "",
    version: 0,
  });
  await customers.savePreferences(p, {
    locale: "en-IN",
    reduced_motion: true,
    marketing_email: false,
    version: 0,
  });
  assert.equal((await customers.profile(p)).version, 1);
  assert.equal((await customers.preferences(p)).reduced_motion, true);
});
test("a newer contact-email request invalidates older unused verification tokens", async () => {
  const p = await customer(),
    oldKey = process.env.MAIL_API_KEY;
  process.env.MAIL_API_KEY = "fixture";
  try {
    await customers.saveProfile(p, {
      name: p.name,
      email: "first@example.invalid",
      phone: "",
      version: 0,
    });
    const first = (
      await pool.query(
        "SELECT j.payload FROM jobs j JOIN contact_verifications v ON j.payload->>'id'=v.id::text WHERE v.user_id=$1 AND j.type='contact-verification'",
        [p.userId],
      )
    ).rows[0].payload;
    await customers.saveProfile(p, {
      name: p.name,
      email: "second@example.invalid",
      phone: "",
      version: 1,
    });
    await assert.rejects(
      () => customers.verifyContact(p, decrypt(first.token)),
      /expired or invalid/,
    );
    const latest = (
      await pool.query(
        "SELECT j.payload FROM jobs j JOIN contact_verifications v ON j.payload->>'id'=v.id::text WHERE v.user_id=$1 AND v.consumed_at IS NULL AND j.type='contact-verification'",
        [p.userId],
      )
    ).rows[0].payload;
    await customers.verifyContact(p, decrypt(latest.token));
    assert.equal((await customers.profile(p)).email, "second@example.invalid");
  } finally {
    if (oldKey === undefined) delete process.env.MAIL_API_KEY;
    else process.env.MAIL_API_KEY = oldKey;
  }
});
test("non-staff cannot complete a staff-factor ceremony", async () => {
  const p = await customer();
  await assert.rejects(
    () => verify(p, true, {} as any),
    (e: any) => e.status === 403 && e.code === "STAFF",
  );
});
test("oversized callback bodies and signed null webhooks are rejected", async () => {
  await assert.rejects(
    () =>
      readRawBody(
        new Request("http://localhost", {
          method: "POST",
          body: "x".repeat(262145),
        }),
      ),
    (e: any) => e.status === 413,
  );
  const old = process.env.RAZORPAY_WEBHOOK_SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = "fixture";
  try {
    const raw = "null",
      signature = createHmac("sha256", "fixture").update(raw).digest("hex");
    await assert.rejects(
      () =>
        webhook(
          new Request("http://localhost", {
            method: "POST",
            headers: {
              "x-razorpay-signature": signature,
              "x-razorpay-event-id": "fixture",
            },
            body: raw,
          }),
        ),
      (e: any) => e.status === 400 && e.code === "WEBHOOK_JSON",
    );
  } finally {
    if (old === undefined) delete process.env.RAZORPAY_WEBHOOK_SECRET;
    else process.env.RAZORPAY_WEBHOOK_SECRET = old;
  }
});
test("database failure never republishes a static catalog fallback", async () => {
  const original = pool.query;
  (pool as any).query = async () => {
    throw new Error("DB outage fixture");
  };
  try {
    await assert.rejects(
      () => publicContent.listPublished("products"),
      /DB outage/,
    );
    await assert.rejects(() => publicContent.catalog(), /DB outage/);
    await assert.rejects(() =>
      publicContent.published("products", "metabolic-balance-protocol"),
    );
  } finally {
    pool.query = original;
  }
});
test("transient cleanup removes expired buckets and preserves active ones", async () => {
  const scope = randomUUID();
  await pool.query(
    "INSERT INTO rate_limit_buckets VALUES($1,'expired',now()-interval '3 minutes',1,now()-interval '1 minute'),($1,'active',now(),1,now()+interval '1 minute')",
    [scope],
  );
  await cleanupTransient();
  assert.deepEqual(
    (
      await pool.query(
        "SELECT key_hash FROM rate_limit_buckets WHERE scope=$1",
        [scope],
      )
    ).rows,
    [{ key_hash: "active" }],
  );
});
test("client reuses CSRF tokens and refreshes only after an explicit CSRF rejection", async () => {
  const original = globalThis.fetch;
  let csrfCalls = 0,
    writes = 0,
    rejectCsrf = false,
    rejectPermission = false;
  globalThis.fetch = async (input) => {
    const path = String(input);
    if (path.endsWith("/csrf")) {
      csrfCalls++;
      return Response.json({ token: token() });
    }
    writes++;
    if (rejectPermission)
      return Response.json(
        { code: "PERMISSION", message: "Denied" },
        { status: 403 },
      );
    if (rejectCsrf) {
      rejectCsrf = false;
      return Response.json(
        { code: "CSRF", message: "Refresh" },
        { status: 403 },
      );
    }
    return Response.json({ ok: true });
  };
  try {
    await api("fixture", "POST", {});
    await api("fixture", "POST", {});
    assert.equal(csrfCalls, 1);
    rejectCsrf = true;
    await api("fixture", "POST", {});
    assert.equal(csrfCalls, 2);
    assert.equal(writes, 4);
    rejectPermission = true;
    await assert.rejects(
      () => api("fixture", "POST", {}),
      (e: any) => e.code === "PERMISSION",
    );
    assert.equal(writes, 5);
    assert.equal(csrfCalls, 2);
  } finally {
    globalThis.fetch = original;
  }
});
