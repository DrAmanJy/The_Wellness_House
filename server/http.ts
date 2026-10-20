import { createServer, type ServerResponse } from "node:http";
import { randomBytes } from "node:crypto";
import { contentSecurityPolicy } from "./security/headers";
import next from "next";
import { pool } from "./db";
import { requestContext } from "./request-context";
import { published } from "./modules/content/public";
import { preview } from "./modules/content/service";
import { session } from "./security/session";
import { cookieValue, origin } from "./security/http";
const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT || 3000);
const app = next({ dev, hostname: "localhost", port });
await app.prepare();
const handle = app.getRequestHandler();
function lockCache(reqUrl: string, res: ServerResponse) {
  const hashed = !dev && reqUrl.startsWith("/_next/static/");
  const value = hashed
    ? "public, max-age=31536000, immutable"
    : "no-store, no-cache, must-revalidate, proxy-revalidate";
  const setHeader = res.setHeader.bind(res);
  res.setHeader = ((name: string, headerValue: unknown) => {
    if (String(name).toLowerCase() === "cache-control")
      return setHeader("Cache-Control", value);
    return setHeader(name, headerValue as string);
  }) as ServerResponse["setHeader"];
  const writeHead = res.writeHead.bind(res);
  res.writeHead = ((...args: Parameters<ServerResponse["writeHead"]>) => {
    setHeader("Cache-Control", value);
    if (!hashed) {
      setHeader("Pragma", "no-cache");
      setHeader("Expires", "0");
    }
    for (const arg of args) {
      if (arg && typeof arg === "object" && !Array.isArray(arg)) {
        delete (arg as Record<string, unknown>)["Cache-Control"];
        delete (arg as Record<string, unknown>)["cache-control"];
      }
    }
    return writeHead(...args);
  }) as ServerResponse["writeHead"];
  setHeader("Cache-Control", value);
  if (!hashed) {
    setHeader("Pragma", "no-cache");
    setHeader("Expires", "0");
  }
}
const server = createServer((req, res) => {
  const nonce = randomBytes(16).toString("base64");
  const policy = contentSecurityPolicy(nonce, dev);
  req.headers["x-nonce"] = nonce;
  req.headers["content-security-policy"] = policy;
  // Never trust a browser-supplied internal client address.
  req.headers["x-twh-client-ip"] = req.socket.remoteAddress || "unknown";
  lockCache(req.url || "", res);
  if (
    req.url?.startsWith("/_next/image") &&
    new URL(req.url, "http://localhost").searchParams
      .get("url")
      ?.includes("/api/")
  ) {
    res.writeHead(404);
    res.end();
    return;
  }

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (
    /^\/(preview|admin|account|checkout|search|api)(\/|\?|$)/.test(
      req.url || "",
    )
  ) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  }
  if (req.url?.startsWith("/preview"))
    res.setHeader("Referrer-Policy", "no-referrer");
  if (process.env.NODE_ENV === "production")
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  res.setHeader("Content-Security-Policy", policy);
  requestContext.run({ values: new Map() }, async () => {
    try {
      const pathname = new URL(req.url || "/", origin()).pathname;
      const missing = () => {
        res.setHeader("X-Robots-Tag", "noindex, nofollow");
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          '<!doctype html><html><head><title>Not found</title><meta name="robots" content="noindex,nofollow"></head><body><h1>Page not found</h1><a href="/">Return to the house</a></body></html>',
        );
      };
      // Resolve access/status before Next streams a loading shell (which otherwise
      // turns late notFound() results into HTTP 200). The resolution is shared
      // with metadata and page rendering through this request's ALS snapshot.
      const customerOrderPath = pathname.match(
        /^\/account\/orders\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/,
      );
      if (pathname === "/checkout" || customerOrderPath) {
        const nativeHeaders = new Headers();
        for (const [key, value] of Object.entries(req.headers))
          if (value)
            nativeHeaders.set(
              key,
              Array.isArray(value) ? value.join(",") : value,
            );
        const user = await session(
          new Request(origin() + pathname, { headers: nativeHeaders }),
        );
        if (!user) {
          const returnPath = new URL(req.url || "/checkout", origin());
          const sid = returnPath.searchParams.get("session");
          const next = customerOrderPath
            ? pathname
            : sid && /^[0-9a-f-]{36}$/.test(sid)
              ? "/checkout?session=" + sid
              : "/checkout";
          res.writeHead(303, {
            Location: "/account?returnTo=" + encodeURIComponent(next),
          });
          res.end();
          return;
        }
        if (
          customerOrderPath &&
          !(
            await pool.query(
              "SELECT 1 FROM orders WHERE id=$1 AND user_id=$2 AND confirmed_at IS NOT NULL",
              [customerOrderPath[1], user.userId],
            )
          ).rowCount
        ) {
          missing();
          return;
        }
      }
      const previewPath = pathname.match(/^\/preview\/view\/([^/]+)$/);
      if (previewPath) {
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers))
          if (value)
            headers.set(key, Array.isArray(value) ? value.join(",") : value);
        const request = new Request(origin() + pathname, { headers });
        const grant = await preview(
          cookieValue(request, "preview"),
          await session(request),
        );
        if (!grant || grant.id !== previewPath[1]) {
          missing();
          return;
        }
      }
      if (
        req.method === "GET" &&
        !/^\/(api|admin|preview|account|_next)(\/|$)/.test(req.url || "")
      ) {
        try {
          const path = new URL(req.url || "/", "http://localhost").pathname;
          const redirect = (
            await pool.query(
              "SELECT target_path,status FROM redirects WHERE source_path=$1 AND enabled",
              [path],
            )
          ).rows[0];
          if (redirect) {
            res.writeHead(redirect.status, { Location: redirect.target_path });
            res.end();
            return;
          }
        } catch {
          // Ignore redirect query failure if DB is unavailable
        }
      }
      const entityPath = pathname.match(
        /^\/(rituals|journal|collections)\/([^/]+)$/,
      );
      if (entityPath) {
        try {
          const kind =
            entityPath[1] === "rituals"
              ? "products"
              : (entityPath[1] as "journal" | "collections");
          const entity = await published(kind, entityPath[2]);
          if (!entity && entityPath[1] !== "collections") {
            missing();
            return;
          }
        } catch {
          // Fall back to Next.js route handling
        }
      }
      const fixed = new Set([
        "",
        "rituals",
        "collections",
        "journal",
        "about",
        "science",
        "ingredients",
        "atelier",
        "faq",
        "contact",
        "consultation",
        "privacy-policy",
        "terms-and-conditions",
        "account",
        "admin",
        "search",
        "checkout",
      ]);
      const simplePage = pathname.match(/^\/([a-z0-9-]+)$/)?.[1];
      if (simplePage && !fixed.has(simplePage)) {
        try {
          if (!(await published("pages", simplePage))) {
            missing();
            return;
          }
        } catch {
          // Fall back to Next.js route handling
        }
      }
      await handle(req, res);
    } catch {
      if (!res.headersSent) res.writeHead(503);
      res.end("Service unavailable");
    }
  });
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\n❌ Port ${port} is already in use by another running process.` +
        `\n💡 To free port ${port} on Windows PowerShell, run:` +
        `\n   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${port}).OwningProcess -Force` +
        `\n   or run on another port:` +
        `\n   $env:PORT="3001"; npm run dev\n`,
    );
    process.exit(1);
  }
  throw err;
});

server.listen(port, () =>
  console.log(`Wellness House listening on port ${port}`),
);
