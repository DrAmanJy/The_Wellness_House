import { z } from "zod";
const line = z.string().trim().min(1).max(200);
export const addressSchema = z
  .object({
    label: z.string().trim().min(1).max(40),
    recipient: line,
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9 ()-]{7,20}$/),
    line1: line,
    line2: z.string().trim().max(200).default(""),
    landmark: z.string().trim().max(200).default(""),
    city: line,
    region: line,
    postal_code: z
      .string()
      .regex(/^[1-9][0-9]{5}$/, "Enter a valid six-digit Indian PIN"),
    country_code: z.literal("IN").default("IN"),
  })
  .strict();
export type Address = z.infer<typeof addressSchema>;
export const profileSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().email().max(254),
    phone: z.string().max(20),
    version: z.number().int().nonnegative(),
  })
  .strict();
export const preferenceSchema = z
  .object({
    locale: z.literal("en-IN"),
    reduced_motion: z.boolean(),
    marketing_email: z.boolean(),
    version: z.number().int().nonnegative(),
  })
  .strict();
