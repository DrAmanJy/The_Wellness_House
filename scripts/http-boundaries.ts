import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { pool } from "../server/db";
import { hash } from "../server/security/crypto";
import { RITUAL_FORMULATIONS } from "../lib/rituals-data";
import sharp from "sharp";
const base = "http://localhost:3100";
if (
  !["localhost", "127.0.0.1"].includes(
    new URL(process.env.DATABASE_URL!).hostname,
  )
)
  throw new Error("Local database required");
const raw = randomBytes(32).toString("base64url");
const uid = (
  await pool.query(
    "INSERT INTO users(display_name) VALUES('HTTP boundary fixture') RETURNING id",
  )
).rows[0].id;
const ids: string[] = [];
try {
  await pool.query("INSERT INTO staff_roles VALUES($1,'owner')", [uid]);
  await pool.query(
    "INSERT INTO sessions(token_hash,user_id,expires_at,staff_step_up_at) VALUES($1,$2,now()+interval '5 minutes',now())",
    [hash(raw), uid],
  );
  const csrfResponse = await fetch(base + "/api/v1/csrf");
  const csrf = await csrfResponse.json();
  const cookies = `__Host-twh_session=${raw}; ${csrfResponse.headers.getSetCookie()[0].split(";")[0]}`;
  async function api(path: string, method = "GET", body?: unknown) {
    const r = await fetch(base + "/api/v1/" + path, {
      method,
      headers: {
        cookie: cookies,
        origin: base,
        "x-csrf-token": csrf.token,
        "content-type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await r.json();
    assert(r.ok, `${path}: ${r.status} ${data.message || ""}`);
    return data;
  }
  const slug = "http-check-" + randomUUID();
  const content = {
    ...RITUAL_FORMULATIONS[0],
    slug,
    title: "PRIVATE HTTP FIXTURE " + randomUUID(),
  };
  const record = await api("admin/products", "POST", {
    slug,
    expectedVersion: 0,
    content,
    seo: {},
  });
  ids.push(record.id);
  assert.equal((await fetch(base + "/rituals/" + slug)).status, 404);
  assert.equal((await fetch(base + "/api/v1/products/" + slug)).status, 404);
  const image = await sharp({
    create: { width: 2, height: 2, channels: 3, background: "#30473B" },
  })
    .png()
    .toBuffer();
  const upload = await fetch(base + "/api/v1/media", {
    method: "POST",
    headers: { cookie: cookies, origin: base, "x-csrf-token": csrf.token },
    body: image,
  });
  assert.equal(upload.status, 201);
  const media = await upload.json();
  assert.equal((await fetch(base + media.url)).status, 404);
  const revised = await api(`admin/products/${record.id}/revisions`, "POST", {
    slug,
    expectedVersion: record.version,
    content: { ...content, imageUrl: media.url },
    seo: {},
  });
  const link = await api(`admin/products/${record.id}/preview-links`, "POST", {
    revisionId: revised.revisionId,
  });
  const entry = await fetch(base + link.url, { redirect: "manual" });
  assert.equal(entry.status, 303);
  const previewCookie = entry.headers.getSetCookie()[0].split(";")[0],
    clean = entry.headers.get("location")!;
  const html = await fetch(base + clean, {
    headers: { cookie: previewCookie },
  });
  assert.equal(html.status, 200);
  assert.match(await html.text(), /PRIVATE HTTP FIXTURE/);
  assert.equal(
    (
      await fetch(base + media.url, {
        headers: { cookie: previewCookie, range: "bytes=0-8" },
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await fetch(base + "/preview/view/" + randomUUID(), {
        headers: { cookie: previewCookie },
      })
    ).status,
    404,
  );
  await api("admin/preview-links/" + link.id, "DELETE");
  assert.equal(
    (await fetch(base + clean, { headers: { cookie: previewCookie } })).status,
    404,
  );
  assert.equal(
    (
      await fetch(base + media.url, {
        headers: { cookie: previewCookie, range: "bytes=0-8" },
      })
    ).status,
    404,
  );
  await api(`admin/products/${record.id}/publish`, "POST", {
    expectedVersion: revised.version,
    revisionId: revised.revisionId,
  });
  assert.equal((await fetch(base + "/rituals/" + slug)).status, 200);
  assert.equal((await fetch(base + media.url)).status, 200);
  await api(`admin/products/${record.id}/unpublish`, "POST", {
    expectedVersion: revised.version + 1,
  });
  assert.equal((await fetch(base + "/rituals/" + slug)).status, 404);
  assert.equal((await fetch(base + media.url)).status, 404);
  const key = randomUUID(),
    inquiry = {
      name: "HTTP Test",
      email: "http-test@example.invalid",
      subject: "Integration test",
      message: "Test request",
      consent: true,
    };
  const results = await Promise.all(
    [1, 2].map(() =>
      fetch(base + "/api/v1/contact-inquiries", {
        method: "POST",
        headers: {
          cookie: cookies,
          origin: base,
          "x-csrf-token": csrf.token,
          "content-type": "application/json",
          "idempotency-key": key,
        },
        body: JSON.stringify(inquiry),
      }).then(async (r) => {
        assert.equal(r.status, 201);
        return r.json();
      }),
    ),
  );
  assert.equal(results[0].id, results[1].id);
  await pool.query(
    "UPDATE jobs SET state='completed' WHERE payload->>'id'=$1",
    [results[0].id],
  );
  console.log(
    "HTTP boundary checks passed: draft isolation, private media, scoped preview, revocation, publication and duplicate forms.",
  );
} finally {
  await pool.query(
    "UPDATE content_entities SET lifecycle='archived',live_revision_id=NULL WHERE id=ANY($1::uuid[])",
    [ids],
  );
  await pool.query("DELETE FROM staff_roles WHERE user_id=$1", [uid]);
  await pool.query("UPDATE sessions SET revoked_at=now() WHERE user_id=$1", [
    uid,
  ]);
  await pool.end();
}
