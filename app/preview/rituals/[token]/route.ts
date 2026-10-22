import { pool } from "@/server/db";
import { hash, token } from "@/server/security/crypto";
import { cookie, endpoint, AppError, limit } from "@/server/security/http";
import { session } from "@/server/security/session";
export const dynamic = "force-dynamic";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  return endpoint(async () => {
    await limit(req, "preview", 30);
    const raw = (await params).token;
    const p = await session(req);
    const link = (
      await pool.query(
        "SELECT * FROM preview_links WHERE token_hash=$1 AND expires_at>now() AND revoked_at IS NULL AND (NOT require_reviewer_login OR $2::boolean)",
        [hash(raw), !!p],
      )
    ).rows[0];
    if (!link) throw new AppError(404, "NOT_FOUND", "Not found");
    const grant = token();
    await pool.query("INSERT INTO preview_sessions VALUES($1,$2,$3)", [
      hash(grant),
      link.id,
      link.expires_at,
    ]);
    return new Response(null, {
      status: 303,
      headers: {
        Location: `/preview/view/${link.entity_id}`,
        "Set-Cookie": cookie(
          "preview",
          grant,
          Math.max(
            0,
            Math.floor((link.expires_at.getTime() - Date.now()) / 1000),
          ),
        ),
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
        "Referrer-Policy": "no-referrer",
      },
    });
  });
}
