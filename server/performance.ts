import { AsyncLocalStorage } from "node:async_hooks";
import type { PoolClient } from "pg";
export interface ApiMetrics {
  started: number;
  dbCalls: number;
  dbMs: number;
}
const root = globalThis as unknown as {
  wellnessApiMetrics?: AsyncLocalStorage<ApiMetrics>;
};
export const apiMetrics = (root.wellnessApiMetrics ??=
  new AsyncLocalStorage<ApiMetrics>());
export function instrumentClient(client: PoolClient) {
  const original = client.query;
  client.query = function (this: PoolClient, ...args: any[]) {
    const stats = apiMetrics.getStore();
    if (!stats) return original.apply(this, args as any);
    stats.dbCalls++;
    const start = performance.now();
    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        stats.dbMs += performance.now() - start;
      }
    };
    const callback = args.at(-1);
    if (typeof callback === "function")
      args[args.length - 1] = function (this: unknown, ...values: any[]) {
        finish();
        return callback.apply(this, values);
      };
    try {
      const result = original.apply(this, args as any) as any;
      if (typeof callback !== "function" && result?.then)
        return result.finally(finish);
      return result;
    } catch (error) {
      finish();
      throw error;
    }
  } as PoolClient["query"];
}
