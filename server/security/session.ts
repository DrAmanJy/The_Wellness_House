import { pool } from "../db";
import { cookieValue, AppError } from "./http";
import { hash } from "./crypto";
export interface Principal {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  roles: string[];
  stepUp: Date | null;
  createdAt: Date;
}
export async function session(req: Request): Promise<Principal | null> {
  const raw = cookieValue(req, "session");
  if (!/^[A-Za-z0-9_-]{43}$/.test(raw)) return null;
  const { rows } = await pool.query(
    `WITH live AS (
      SELECT s.id,s.user_id,u.display_name,u.contact_email,s.staff_step_up_at,s.created_at,s.last_seen_at
      FROM sessions s JOIN users u ON u.id=s.user_id
      WHERE s.token_hash=$1 AND u.status='active' AND s.revoked_at IS NULL AND s.expires_at>now() AND s.last_seen_at>now()-interval '1 day'
    ), touched AS (
      UPDATE sessions s SET last_seen_at=now() FROM live l WHERE s.id=l.id AND l.last_seen_at<now()-interval '5 minutes'
    ) SELECT live.*,ARRAY(SELECT role FROM staff_roles WHERE user_id=live.user_id) AS roles FROM live`,
    [hash(raw)],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.display_name,
    email: row.contact_email,
    roles: row.roles,
    stepUp: row.staff_step_up_at,
    createdAt: row.created_at,
  };
}
export function authenticated(p: Principal | null): asserts p is Principal {
  if (!p) throw new AppError(401, "AUTH_REQUIRED", "Sign in to continue");
}
const grants: Record<string, string[]> = {
  owner: ["*"],
  admin: ["content.read", "content.edit", "settings.edit", "operations"],
  editor: ["content.read", "content.edit"],
  publisher: ["content.read", "content.publish", "content.preview"],
  concierge: ["operations"],
  fulfillment: [],
  finance: [],
};
export function authorize(p: Principal | null, permission: string) {
  authenticated(p);
  if (
    !p.roles.some((r) => grants[r]?.some((g) => g === "*" || g === permission))
  )
    throw new AppError(403, "PERMISSION", "Access denied");
  if (!p.stepUp || Date.now() - new Date(p.stepUp).getTime() > 15 * 60 * 1000)
    throw new AppError(
      403,
      "MFA_REQUIRED",
      "Verify your staff security key to continue",
    );
  return p;
}
