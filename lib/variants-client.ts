"use client";
import { api } from "./api-client";
import type { SupplyVariant } from "./commerce";
// Only public SKU data is shared briefly within this tab. Orders always reprice on the server.
const variants = new Map<
  string,
  { expires: number; value: Promise<SupplyVariant[]> }
>();
export function getVariants(slug: string) {
  const cached = variants.get(slug);
  if (cached && cached.expires > Date.now()) return cached.value;
  if (variants.size >= 50) variants.delete(variants.keys().next().value!);
  const value = api<SupplyVariant[]>("variants/" + slug).catch((error) => {
    variants.delete(slug);
    throw error;
  });
  variants.set(slug, { expires: Date.now() + 30000, value });
  return value;
}
