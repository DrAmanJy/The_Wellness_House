import { Pool, type PoolClient } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const globalDb = globalThis as unknown as { wellnessPool?: Pool };
export const pool =
  globalDb.wellnessPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_SIZE || 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 10000,
  });
globalDb.wellnessPool = pool;
export const db = drizzle(pool);
export async function transaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL lock_timeout = '3s'");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
