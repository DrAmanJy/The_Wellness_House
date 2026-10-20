import { pool } from "../../db";
import { cookie, cookieName } from "../../security/http";
import { hash } from "../../security/crypto";
export const purchaseCookie = (id: string) =>
  "purchase_" + id.replaceAll("-", "");
export async function clearPurchaseCookies(req: Request, response: Response) {
  const prefix = cookieName("purchase_");
  const hashes: string[] = [];
  for (const part of (req.headers.get("cookie") || "").split(";")) {
    const [name, value] = part.trim().split("=");
    if (
      name.startsWith(prefix) &&
      /^[a-f0-9]{32}$/.test(name.slice(prefix.length))
    ) {
      response.headers.append(
        "Set-Cookie",
        cookie(name.slice(cookieName("").length), "", 0),
      );
      if (value) hashes.push(hash(value));
    }
  }
  if (hashes.length)
    await pool.query(
      "UPDATE purchase_intents SET expires_at=now() WHERE capability_hash=ANY($1::text[])",
      [hashes],
    );
}
