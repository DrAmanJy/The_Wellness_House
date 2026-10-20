import { pool, transaction } from "../../db";
const userId = process.argv[2];
if (!userId)
  throw new Error("Usage: npm run owner:bootstrap -- <verified-user-uuid>");
await transaction(async (c) => {
  await c.query("SELECT pg_advisory_xact_lock(781205)");
  if ((await c.query("SELECT 1 FROM bootstrap_state")).rowCount)
    throw new Error("Owner bootstrap has already been used");
  if (
    !(
      await c.query(
        "SELECT 1 FROM auth_identities WHERE user_id=$1 AND email_verified",
        [userId],
      )
    ).rowCount
  )
    throw new Error("A verified Google/Apple identity is required");
  await c.query("INSERT INTO staff_roles VALUES($1,'owner')", [userId]);
  await c.query("INSERT INTO bootstrap_state DEFAULT VALUES");
  await c.query("UPDATE sessions SET revoked_at=now() WHERE user_id=$1", [
    userId,
  ]);
  await c.query(
    "INSERT INTO audit_logs(actor_id,action,entity_id) VALUES($1,'owner.bootstrap',$1)",
    [userId],
  );
});
console.log("Owner created. Sign in again and enroll a security key.");
await pool.end();
