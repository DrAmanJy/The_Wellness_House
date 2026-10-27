import { spawnSync } from "node:child_process";
import pg from "pg";
const base = new URL(
  process.env.DATABASE_URL ||
    "postgresql://wellness:local-development-only@127.0.0.1:55432/wellness",
);
if (!["localhost", "127.0.0.1"].includes(base.hostname))
  throw new Error("Integration tests require a local PostgreSQL host");
const database = "wellness_test";
const admin = new pg.Client({ connectionString: base.href });
await admin.connect();
if (
  !(await admin.query("SELECT 1 FROM pg_database WHERE datname=$1", [database]))
    .rowCount
)
  await admin.query("CREATE DATABASE wellness_test");
await admin.end();
base.pathname = "/" + database;
const env = { ...process.env, DATABASE_URL: base.href };
for (const args of [
  ["--import", "tsx", "server/db/migrate.ts"],
  ["--import", "tsx", "server/db/seed.ts"],
  [
    "--import",
    "tsx",
    "--test",
    "--test-concurrency=1",
    "tests/backend.test.ts",
    "tests/customer-checkout.test.ts",
    "tests/payment-modal.test.ts",
    "tests/security-audit.test.ts",
    "tests/cart-performance.test.ts",
  ],
]) {
  if (args.includes("--test")) {
    const testDb = new pg.Client({ connectionString: base.href });
    await testDb.connect();
    await testDb.query(
      "UPDATE jobs SET state='completed' WHERE state IN ('queued','running')",
    );
    await testDb.end();
  }
  const result = spawnSync(process.execPath, args, { env, stdio: "inherit" });
  if (result.status) process.exit(result.status);
}
