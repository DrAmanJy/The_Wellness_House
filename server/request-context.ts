import { AsyncLocalStorage } from "node:async_hooks";
type Context = { values: Map<string, Promise<unknown>> };
// Shared ALS handle across the custom server and Next's bundled server modules.
// Each map belongs to exactly one HTTP request and is released with that request.
const root = globalThis as unknown as {
  wellnessRequestContext?: AsyncLocalStorage<Context>;
};
export const requestContext = (root.wellnessRequestContext ??=
  new AsyncLocalStorage<Context>());
export function requestSnapshot<T>(
  key: string,
  read: () => Promise<T>,
): Promise<T> {
  const context = requestContext.getStore();
  if (!context)
    throw new Error(
      "Use npm run dev/start: request context is required for consistent metadata",
    );
  let value = context.values.get(key);
  if (!value) {
    value = read();
    context.values.set(key, value);
  }
  return value as Promise<T>;
}
