import assert from "node:assert/strict";
const base = process.env.SMOKE_ORIGIN || "http://localhost:3100";
const nonces: string[] = [];
for (let i = 0; i < 2; i++) {
  const response = await fetch(base + "/", {
    headers: { "x-nonce": "attacker-controlled" },
  });
  assert.equal(response.status, 200);
  const policy = response.headers.get("content-security-policy") || "";
  const scripts =
    policy.split(";").find((s) => s.trim().startsWith("script-src")) || "";
  assert(!scripts.includes("unsafe-inline"));
  assert(!scripts.includes("unsafe-eval"));
  const nonce = /nonce-([^']+)/.exec(scripts)?.[1];
  assert(nonce && nonce !== "attacker-controlled");
  nonces.push(nonce);
  const html = await response.text();
  let count = 0;
  for (const tag of html.matchAll(/<script\b([^>]*)>/g)) {
    assert(
      tag[1].includes(`nonce="${nonce}"`),
      "All rendered scripts must carry this request's nonce",
    );
    count++;
  }
  assert(count > 0);
}
assert.notEqual(nonces[0], nonces[1]);
for (const [path, method, status] of [
  ["me/profile/suffix", "GET", 404],
  ["csrf/suffix", "GET", 404],
  ["health/unknown", "GET", 404],
  ["auth/google/link/suffix", "POST", 404],
  ["cart", "POST", 405],
  ["admin/redirects", "DELETE", 405],
  ["auth/google/callback", "POST", 405],
  ["me/addresses/a", "POST", 405],
] as const) {
  const res = await fetch(base + "/api/v1/" + path, { method });
  assert.equal(res.status, status, `${method} ${path}`);
  assert.match(res.headers.get("cache-control") || "", /no-store/);
}
console.log(
  "Security HTTP checks passed: unique server-generated nonces, nonce-bearing HTML scripts, strict production script policy, unknown aliases/suffixes denied, unsupported methods denied.",
);
