import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.BENCH_ORIGIN || "http://localhost:3100";
const samples = Math.min(
  20,
  Math.max(2, Number(process.env.BENCH_SAMPLES) || 6),
);
const routes = [
  "/api/v1/health/live",
  "/api/v1/bootstrap",
  "/api/v1/cart",
  "/api/v1/variants/metabolic-balance-protocol",
  "/api/v1/products",
  "/api/v1/search?q=botanical",
];
const cookies = new Map<string, string>();
const reports = [];
for (const path of routes) {
  const rows = [];
  for (let i = 0; i < samples; i++) {
    const started = performance.now();
    const r = await fetch(new URL(path, base), {
      headers: { cookie: [...cookies].map(([k, v]) => k + "=" + v).join("; ") },
      signal: AbortSignal.timeout(20000),
    });
    for (const cookie of r.headers.getSetCookie()) {
      const pair = cookie.split(";")[0],
        at = pair.indexOf("=");
      cookies.set(pair.slice(0, at), pair.slice(at + 1));
    }
    const bytes = (await r.arrayBuffer()).byteLength;
    rows.push({
      ms: Number((performance.now() - started).toFixed(2)),
      status: r.status,
      bytes,
      cache: r.headers.get("x-vercel-cache"),
      region: r.headers.get("x-vercel-id"),
      serverTiming: r.headers.get("server-timing"),
    });
  }
  const sorted = rows.map((r) => r.ms).sort((a, b) => a - b);
  reports.push({
    path,
    medianMs: sorted[Math.floor(sorted.length / 2)],
    p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1],
    samples: rows,
  });
}
const report = {
  origin: new URL(base).origin,
  measuredAt: new Date().toISOString(),
  reports,
};
await mkdir("work/performance", { recursive: true });
const filename =
  "work/performance/http-" +
  new URL(base).hostname.replace(/[^a-z0-9.-]/gi, "_") +
  ".json";
await writeFile(filename, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
