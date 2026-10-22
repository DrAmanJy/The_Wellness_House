import assert from "node:assert/strict";
const base = process.env.SMOKE_ORIGIN || "http://localhost:3100";
for (const [path, status] of [
  ["/", 200],
  ["/rituals/metabolic-balance-protocol", 200],
  ["/collections", 200],
  ["/journal", 200],
  ["/api/v1/products", 200],
  ["/api/v1/admin/products", 401],
  ["/api/v1/health/ready", 200],
  ["/sitemap.xml", 200],
  ["/preview/view/00000000-0000-4000-8000-000000000000", 404],
  ["/rituals/not-published", 404],
] as const) {
  const response = await fetch(base + path);
  const text = await response.text();
  console.log(
    JSON.stringify({
      path,
      status: response.status,
      cache: response.headers.get("cache-control"),
      robots: response.headers.get("x-robots-tag"),
      bytes: text.length,
    }),
  );
  assert.equal(response.status, status, path);
  assert.match(response.headers.get("cache-control") || "", /no-store/, path);
  if (path.includes("/rituals/metabolic")) {
    assert.match(text, /The Daily Metabolic/);
    assert.match(text, /rel="canonical"/);
    assert.match(text, /application\/ld\+json/);
  }
  if (path === "/sitemap.xml") {
    assert.match(text, /\/collections\/weight-management/);
    assert(!text.includes("/preview/"));
  }
}
const rejected = await fetch(base + "/api/v1/contact-inquiries", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    origin: "https://attacker.invalid",
  },
  body: "{}",
});
assert.equal(rejected.status, 403);
console.log("HTTP smoke checks passed");
