import { randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { pool } from "../db";
import { hash } from "./crypto";
export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function origin(req?: Request) {
  if (req) {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    if (host) {
      const proto =
        req.headers.get("x-forwarded-proto") ||
        (req.url?.startsWith("https") ? "https" : "http");
      return `${proto}://${host}`;
    }
  }
  if (process.env.APP_ORIGIN) {
    try {
      return new URL(process.env.APP_ORIGIN).origin;
    } catch {}
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://the-wellness-house.vercel.app";
  }
  return "http://localhost:3000";
}

export function isAllowedOrigin(req: Request): boolean {
  const reqOrigin = req.headers.get("origin");
  if (!reqOrigin) {
    const referer = req.headers.get("referer");
    if (!referer) return true;
    try {
      return matchesOrigin(req, new URL(referer).origin);
    } catch {
      return false;
    }
  }
  return matchesOrigin(req, reqOrigin);
}

function matchesOrigin(req: Request, targetOrigin: string): boolean {
  if (targetOrigin === origin(req)) return true;
  if (process.env.APP_ORIGIN) {
    try {
      if (new URL(process.env.APP_ORIGIN).origin === targetOrigin) return true;
    } catch {}
  }
  try {
    if (new URL(req.url).origin === targetOrigin) return true;
  } catch {}
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (host) {
    const proto =
      req.headers.get("x-forwarded-proto") ||
      (req.url.startsWith("https") ? "https" : "http");
    if (
      targetOrigin === `${proto}://${host}` ||
      targetOrigin === `https://${host}` ||
      targetOrigin === `http://${host}`
    ) {
      return true;
    }
  }
  if (
    process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    targetOrigin === `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  ) {
    return true;
  }
  if (
    process.env.VERCEL_URL &&
    targetOrigin === `https://${process.env.VERCEL_URL}`
  ) {
    return true;
  }
  if (targetOrigin.endsWith(".vercel.app")) {
    return true;
  }
  if (
    process.env.NODE_ENV !== "production" &&
    (targetOrigin.startsWith("http://localhost:") ||
      targetOrigin.startsWith("http://127.0.0.1:"))
  ) {
    return true;
  }
  return false;
}

export function cookieName(name: string) {
  return `${process.env.NODE_ENV === "production" ? "__Host-" : ""}twh_${name}`;
}
export function cookieValue(req: Request, name: string) {
  const cookies = (req.headers.get("cookie") || "")
    .split(";")
    .map((x) => x.trim());
  const prefixes = [
    cookieName(name) + "=",
    `__Host-twh_${name}=`,
    `twh_${name}=`,
  ];
  for (const c of cookies) {
    for (const prefix of prefixes) {
      if (c.startsWith(prefix)) {
        return c.slice(prefix.length);
      }
    }
  }
  return "";
}
export function cookie(
  name: string,
  value: string,
  maxAge = 86400,
  sameSite = "Lax",
) {
  return `${cookieName(name)}=${value}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${maxAge}${process.env.NODE_ENV === "production" || sameSite === "None" ? "; Secure" : ""}`;
}
export function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export async function readRawBody(req: Request, maximum = 262144) {
  const reader = req.body?.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  if (reader)
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maximum) {
        await reader.cancel();
        throw new AppError(413, "BODY_SIZE", "Request too large");
      }
      chunks.push(value);
    }
  return Buffer.concat(chunks);
}
export async function body<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  if (
    req.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    throw new AppError(415, "CONTENT_TYPE", "JSON required");
  const raw = await readRawBody(req);
  try {
    return schema.parse(JSON.parse(raw.toString("utf8")));
  } catch (e) {
    if (e instanceof z.ZodError) throw e;
    throw new AppError(400, "JSON", "Invalid JSON");
  }
}
export function csrf(req: Request) {
  const a = cookieValue(req, "csrf"),
    b = req.headers.get("x-csrf-token") || "";
  if (
    !isAllowedOrigin(req) ||
    !/^[A-Za-z0-9_-]{43}$/.test(a) ||
    !/^[A-Za-z0-9_-]{43}$/.test(b) ||
    a.length !== b.length ||
    !timingSafeEqual(Buffer.from(a), Buffer.from(b))
  )
    throw new AppError(403, "CSRF", "Refresh this page and try again");
}
export async function limit(
  req: Request,
  scope: string,
  max = 30,
  key?: string,
) {
  const identity =
    key ||
    (process.env.TRUST_PROXY === "true"
      ? req.headers.get("x-forwarded-for")?.split(",")[0].trim()
      : null) ||
    req.headers.get("x-twh-client-ip") ||
    "untrusted-network";
  const result = await pool.query(
    `INSERT INTO rate_limit_buckets VALUES($1,$2,date_trunc('minute',now()),1,now()+interval '2 minutes') ON CONFLICT(scope,key_hash,window_start) DO UPDATE SET count=rate_limit_buckets.count+1 RETURNING count`,
    [scope, hash(identity)],
  );
  if (result.rows[0].count > max)
    throw new AppError(429, "RATE_LIMIT", "Please try again in a minute");
}
export async function endpoint(fn: () => Promise<Response>) {
  const requestId = randomUUID();
  try {
    const result = await fn();
    result.headers.set("X-Request-ID", requestId);
    return result;
  } catch (e) {
    const validation = e instanceof z.ZodError;
    const conflict =
      typeof e === "object" && e !== null && "code" in e && e.code === "23505";
    const status = validation
      ? 422
      : e instanceof AppError
        ? e.status
        : conflict
          ? 409
          : 503;
    if (status === 503 && !(e instanceof AppError))
      console.error(
        JSON.stringify({
          requestId,
          code: "INTERNAL",
          errorType: e instanceof Error ? e.name : "unknown",
        }),
      );
    const response = json(
      {
        code: validation
          ? "VALIDATION"
          : e instanceof AppError
            ? e.code
            : conflict
              ? "CONFLICT"
              : "UNAVAILABLE",
        message: validation
          ? "Check the submitted fields"
          : e instanceof AppError
            ? e.message
            : conflict
              ? "This record already exists or its slug is reserved"
              : "Service temporarily unavailable",
        fieldErrors: validation ? e.flatten().fieldErrors : undefined,
        requestId,
      },
      status,
    );
    if (status === 429) response.headers.set("Retry-After", "60");
    return response;
  }
}
