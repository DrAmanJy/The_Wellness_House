import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { pool, transaction } from "../server/db";
import {
  save,
  publish,
  previewLink,
  preview,
} from "../server/modules/content/service";
import { published } from "../server/modules/content/public";
import { requestContext } from "../server/request-context";
import { submit } from "../server/modules/operations/service";
import {
  cart,
  setItem,
  cartItems,
  merge,
} from "../server/modules/cart/service";
import { claim, tick } from "../worker/index";
import { redirectSave, schedule } from "../server/modules/content/editorial";
import { authorize, type Principal } from "../server/security/session";
import { token, hash, encrypt, decrypt } from "../server/security/crypto";
import { csrf, cookieName } from "../server/security/http";
import { safePath, validateContent } from "../server/modules/content/schemas";
import { RITUAL_FORMULATIONS } from "../lib/rituals-data";
import { jsonLd } from "../server/modules/content/seo";
after(() => pool.end());
test("slug publication reserves history and rollback keeps redirects acyclic", async () => {
  const p=await actor(), slug='test-slug-'+randomUUID(), nextSlug='test-slug-'+randomUUID();
  const content={...RITUAL_FORMULATIONS[0],slug};
  const first=await save(p,'products',{slug,expectedVersion:0,content,seo:{}});
  const live=await publish(p,first.id,first.version);
  const revision=await save(p,'products',{id:first.id,slug:nextSlug,expectedVersion:live.version,content:{...content,slug:nextSlug},seo:{}});
  await requestContext.run({values:new Map()},async()=>{assert(await published('products',slug));assert.equal(await published('products',nextSlug),null);});
  const changed=await publish(p,first.id,revision.version);
  assert.equal((await pool.query('SELECT target_path FROM redirects WHERE source_path=$1',['/rituals/'+slug])).rows[0].target_path,'/rituals/'+nextSlug);
  await publish(p,first.id,changed.version,first.revisionId);
  assert.equal((await pool.query('SELECT 1 FROM redirects WHERE source_path=$1',['/rituals/'+slug])).rowCount,0);
  assert.equal((await pool.query('SELECT target_path FROM redirects WHERE source_path=$1',['/rituals/'+nextSlug])).rows[0].target_path,'/rituals/'+slug);
  await assert.rejects(()=>redirectSave(p,'/rituals/'+slug,'/rituals/'+nextSlug,308),/loop/);
  await pool.query("UPDATE content_entities SET lifecycle='archived' WHERE id=$1",[first.id]);
});
test("scheduled publication rejects an intervening edit", async()=>{
 const p=await actor(),slug='test-schedule-'+randomUUID();await pool.query("INSERT INTO staff_roles VALUES($1,'publisher')",[p.userId]);
 const first=await save(p,'products',{slug,expectedVersion:0,content:{...RITUAL_FORMULATIONS[0],slug},seo:{}});
 const scheduled=await schedule(p,first.id,first.revisionId,first.version,new Date(Date.now()+60000).toISOString());
 await save(p,'products',{id:first.id,slug,expectedVersion:first.version,content:{...RITUAL_FORMULATIONS[0],slug,title:'Later edit'},seo:{}});
 await pool.query("UPDATE jobs SET available_at='1999-01-01' WHERE payload->>'scheduleId'=$1",[scheduled.id]);await tick();
 assert.equal((await pool.query('SELECT status FROM scheduled_publications WHERE id=$1',[scheduled.id])).rows[0].status,'rejected');
 assert.equal((await pool.query('SELECT live_revision_id FROM content_entities WHERE id=$1',[first.id])).rows[0].live_revision_id,null);
});
async function actor(): Promise<Principal> {
  const user = (
    await pool.query(
      "INSERT INTO users(display_name) VALUES('Integration test') RETURNING id",
    )
  ).rows[0];
  return {
    id: randomUUID(),
    userId: user.id,
    name: "Test",
    email: null,
    roles: ["owner"],
    stepUp: new Date(),
    createdAt: new Date(),
  };
}
test("publication is immutable, optimistic and pinned to each HTTP request", async () => {
  const p = await actor(),
    slug = "test-" + randomUUID();
  const content = {
    ...RITUAL_FORMULATIONS[0],
    slug,
    title: "First live title",
  };
  const draft = await save(p, "products", {
    slug,
    expectedVersion: 0,
    content,
    seo: {},
  });
  await requestContext.run({ values: new Map() }, async () =>
    assert.equal(await published("products", slug), null),
  );
  const live = await publish(p, draft.id, 1);
  await requestContext.run({ values: new Map() }, async () => {
    assert.equal(
      (await published("products", slug))!.content.title,
      "First live title",
    );
    const edit = await save(p, "products", {
      id: draft.id,
      slug,
      expectedVersion: live.version,
      content: { ...content, title: "New private title" },
      seo: {},
    });
    await requestContext.run({ values: new Map() }, async () =>
      assert.equal(
        (await published("products", slug))!.content.title,
        "First live title",
      ),
    );
    const attempts = await Promise.allSettled([
      publish(p, draft.id, edit.version),
      publish(p, draft.id, edit.version),
    ]);
    assert.equal(attempts.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(
      (await published("products", slug))!.content.title,
      "First live title",
    );
  });
  await requestContext.run({ values: new Map() }, async () =>
    assert.equal(
      (await published("products", slug))!.content.title,
      "New private title",
    ),
  );
  await assert.rejects(
    () =>
      pool.query("UPDATE content_revisions SET content='{}' WHERE id=$1", [
        draft.revisionId,
      ]),
    /Append-only/,
  );
  await pool.query(
    "UPDATE content_entities SET lifecycle='archived' WHERE id=$1",
    [draft.id],
  );
});
test("preview grants pin one revision, reject mismatched ownership and honor revocation", async () => {
  const p = await actor(),
    slug = "test-" + randomUUID();
  const content = { ...RITUAL_FORMULATIONS[0], slug };
  const a = await save(p, "products", {
    slug,
    expectedVersion: 0,
    content,
    seo: {},
  });
  const b = await save(p, "products", {
    slug: "test-" + randomUUID(),
    expectedVersion: 0,
    content: { ...content, slug: "placeholder" },
    seo: {},
  }).catch(() => null);
  assert.equal(b, null);
  const link = await previewLink(p, a.id, a.revisionId);
  const raw = link.url.split("/").pop()!;
  const stored = (
    await pool.query("SELECT * FROM preview_links WHERE id=$1", [link.id])
  ).rows[0];
  assert.notEqual(stored.token_hash, raw);
  const sessionToken = token();
  await pool.query("INSERT INTO preview_sessions VALUES($1,$2,$3)", [
    hash(sessionToken),
    link.id,
    stored.expires_at,
  ]);
  await save(p, "products", {
    id: a.id,
    slug,
    expectedVersion: 1,
    content: { ...content, title: "Later private revision" },
    seo: {},
  });
  assert.equal(
    (await preview(sessionToken, null)).content.title,
    content.title,
  );
  assert.equal(await preview(token(), null), null);
  await pool.query("UPDATE preview_links SET revoked_at=now() WHERE id=$1", [
    link.id,
  ]);
  assert.equal(await preview(sessionToken, null), null);
  const otherSlug = "test-other-" + randomUUID();
  const other = await save(p, "products", {
    slug: otherSlug,
    expectedVersion: 0,
    content: { ...content, slug: otherSlug },
    seo: {},
  });
  await assert.rejects(
    () =>
      pool.query(
        "UPDATE content_entities SET live_revision_id=$2 WHERE id=$1",
        [other.id, a.revisionId],
      ),
    /foreign key/,
  );
  await assert.rejects(
    () => previewLink(p, other.id, a.revisionId),
    /foreign key/,
  );
});
test("staff permission, recent MFA, CSRF and safe rendering boundaries", () => {
  const p = {
    userId: randomUUID(),
    roles: ["editor"],
    stepUp: new Date(),
  } as Principal;
  assert.throws(() => authorize(p, "content.publish"));
  assert.throws(() =>
    authorize({ ...p, roles: ["owner"], stepUp: null }, "content.edit"),
  );
  assert.throws(() =>
    csrf(
      new Request("http://localhost:3000", {
        method: "POST",
        headers: { origin: "https://attacker.example" },
      }),
    ),
  );
    assert.throws(() => csrf(new Request("http://localhost:3000", {
      method: "POST", headers: {
        origin: process.env.APP_ORIGIN || "http://localhost:3000",
        cookie: `${cookieName("csrf")}=a`, "x-csrf-token": "é",
      },
    })), (e: any) => e.code === "CSRF");
    const value = token();
  assert.doesNotThrow(() =>
    csrf(
      new Request("http://localhost:3000", {
        method: "POST",
        headers: {
          origin: process.env.APP_ORIGIN || "http://localhost:3000",
          cookie: `${cookieName("csrf")}=${value}`,
          "x-csrf-token": value,
        },
      }),
    ),
  );
  for (const bad of [
    "//evil.example",
    "/api/private",
    "/preview/token",
    "javascript:alert(1)",
    "/\\evil",
  ])
    assert.equal(safePath.safeParse(bad).success, false);
  assert.equal(
    jsonLd({ title: "</script><script>evil()" }).includes("<"),
    false,
  );
  assert.throws(() =>
    validateContent("pages", {
      title: "X",
      sections: [{ type: "script", code: "evil" }],
    }),
  );
  const encrypted = encrypt("Private health notes");
  assert.equal(decrypt(encrypted), "Private health notes");
  assert(!encrypted.includes("Private"));
  const damaged = Buffer.from(encrypted, "base64");
  damaged[30] ^= 1;
  assert.throws(() => decrypt(damaged.toString("base64")));
});
test("simultaneous form retries create one request and two durable jobs without notes", async () => {
  const key = randomUUID();
  const form = {
    fullName: "Test Guest",
    email: "test@example.invalid",
    phone: "1234567890",
    preferredAtelier: "virtual-video",
    preferredDate: "2099-01-01",
    preferredTime: "Morning",
    ritualFocus: "Sleep",
    notes: "Sensitive test notes",
    consent: true,
  };
  const results = await Promise.all([
    submit("consultations", form, null, key),
    submit("consultations", form, null, key),
  ]);
  assert.equal(results[0].id, results[1].id);
  const jobs = (
    await pool.query("SELECT payload FROM jobs WHERE payload->>'id'=$1", [
      results[0].id,
    ])
  ).rows;
  assert.equal(jobs.length, 2);
  assert(!JSON.stringify(jobs).includes("Sensitive"));
  await assert.rejects(
    () => submit("consultations", { ...form, fullName: "Changed" }, null, key),
    /different details/,
  );
  assert.equal(
    (
      await pool.query("SELECT status FROM consultation_requests WHERE id=$1", [
        results[0].id,
      ])
    ).rows[0].status,
    "requested",
  );
  await pool.query(
    "UPDATE jobs SET state='completed' WHERE payload->>'id'=$1",
    [results[0].id],
  );
});
test("guest carts remain separate and merging caps quantities", async () => {
  const guest = token(),
    other = token(),
    p = await actor(),
    a = await cart(null, guest),
    b = await cart(null, other),
    target = await cart(p, guest),
    slug = RITUAL_FORMULATIONS[0].slug;
  await setItem(a, slug, 80);
  await setItem(target, slug, 40);
  assert.equal((await cartItems(b)).length, 0);
  assert.equal((await merge(p, guest))[0].quantity, 99);
  assert.equal((await cartItems(a)).length, 0);
  assert.equal((await merge(p, guest))[0].quantity, 99);
});
test("worker claims are exclusive and expired leases recover", async () => {
  const id = randomUUID();
  await pool.query(
    "INSERT INTO jobs(id,type,payload,available_at) VALUES($1,'test','{}','2000-01-01')",
    [id],
  );
  const claimed = await Promise.all([claim(), claim()]);
  assert.equal(claimed.filter((r) => r?.id === id).length, 1);
  await pool.query(
    "UPDATE jobs SET locked_until=now()-interval '1 minute' WHERE id=$1",
    [id],
  );
  const recovered = await claim();
  assert.equal(recovered.id, id);
  assert.notEqual(recovered.lease, claimed.find((r) => r?.id === id).lease);
  await pool.query("UPDATE jobs SET state='completed' WHERE id=$1", [id]);
});
