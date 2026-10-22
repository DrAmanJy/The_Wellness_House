import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
const pg = new EmbeddedPostgres({
  databaseDir: "work/postgres",
  user: "wellness",
  password: "local-development-only",
  port: 55432,
  persistent: true,
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: () => {},
});
if (!existsSync("work/postgres/PG_VERSION")) await pg.initialise();
await pg.start();
const c = pg.getPgClient();
await c.connect();
if (
  !(await c.query("SELECT 1 FROM pg_database WHERE datname='wellness'"))
    .rowCount
)
  await c.query("CREATE DATABASE wellness");
await c.end();
console.log(
  "Local PostgreSQL ready on 127.0.0.1:55432. Keep this process running.",
);
process.on("SIGINT", async () => {
  await pg.stop();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await pg.stop();
  process.exit(0);
});
