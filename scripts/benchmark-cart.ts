import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { pool } from "../server/db";
import { apiMetrics } from "../server/performance";
import * as carts from "../server/modules/cart/service";
import type { Principal } from "../server/security/session";
const url = new URL(process.env.DATABASE_URL!);
if (
  !["localhost", "127.0.0.1"].includes(url.hostname) ||
  url.pathname !== "/wellness_test"
)
  throw new Error(
    "Benchmark requires the isolated loopback wellness_test database",
  );
async function customer(): Promise<Principal> {
  const user = (
    await pool.query(
      "INSERT INTO users(display_name,contact_email) VALUES('Cart benchmark','benchmark@example.invalid') RETURNING id",
    )
  ).rows[0];
  return {
    id: randomUUID(),
    userId: user.id,
    name: "Benchmark",
    email: null,
    roles: [],
    stepUp: null,
    createdAt: new Date(),
  };
}
async function measure(fn: () => Promise<unknown>) {
  const metrics = { started: performance.now(), dbCalls: 0, dbMs: 0 };
  await apiMetrics.run(metrics, fn);
  return { ms: performance.now() - metrics.started, dbCalls: metrics.dbCalls };
}
function summarize(rows: { ms: number; dbCalls: number }[]) {
  const sorted = rows.map((r) => r.ms).sort((a, b) => a - b);
  return {
    samples: rows.length,
    medianMs: Number(sorted[Math.floor(sorted.length / 2)].toFixed(2)),
    p95Ms: Number(sorted[Math.ceil(sorted.length * 0.95) - 1].toFixed(2)),
    dbCalls: rows[0].dbCalls,
  };
}
try {
  const variant = (
    await pool.query(
      "SELECT v.id FROM product_variants v JOIN content_entities e ON e.id=v.product_id WHERE e.slug='metabolic-balance-protocol' AND v.supply_code='standard-30'",
    )
  ).rows[0].id;
  const before = await customer(),
    after = await customer();
  const beforeId = await carts.cart(before, ""),
    afterId = await carts.cart(after, "");
  const legacy = () =>
    carts
      .cart(before, "")
      .then(() =>
        carts.mutateItem(beforeId, variant, {
          quantity: 1,
          operationId: randomUUID(),
          increment: true,
        }),
      );
  const optimized = () =>
    carts.mutateOwnedCart(after, "", variant, {
      cartId: afterId,
      quantity: 1,
      operationId: randomUUID(),
      increment: true,
    });
  for (let i = 0; i < 3; i++) {
    await legacy();
    await optimized();
  }
  const oldRows = [],
    newRows = [];
  for (let i = 0; i < 20; i++) {
    oldRows.push(await measure(legacy));
    newRows.push(await measure(optimized));
  }
  const report = {
    environment:
      "Local PostgreSQL; warm connections; no injected latency. Common HTTP/auth/rate-limit work excluded from both measurements.",
    legacy: summarize(oldRows),
    optimized: summarize(newRows),
  };
  await mkdir("work/performance", { recursive: true });
  await writeFile(
    "work/performance/cart-benchmark.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
} finally {
  await pool.end();
}
