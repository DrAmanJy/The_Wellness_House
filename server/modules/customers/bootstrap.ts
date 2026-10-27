import { pool } from "../../db";
import type { Principal } from "../../security/session";
import { readSnapshot } from "../cart/service";
export async function bootstrap(p: Principal | null, guest: string) {
  if (!p)
    return {
      user: null,
      cart: await readSnapshot(null, guest),
      savedRituals: [],
    };
  const row = (
    await pool.query(
      `SELECT
    coalesce((SELECT cart_snapshot(id) FROM carts WHERE user_id=$1 AND state='active'),'{}'::jsonb) AS cart,
    coalesce((SELECT jsonb_agg(jsonb_build_object('provider',provider)) FROM auth_identities WHERE user_id=$1),'[]'::jsonb) AS identities,
    (SELECT jsonb_build_object('locale',locale,'reduced_motion',reduced_motion,'marketing_email',marketing_email,'version',version) FROM customer_preferences WHERE user_id=$1) AS preferences,
    ARRAY(SELECT e.slug FROM saved_rituals s JOIN content_entities e ON e.id=s.product_id WHERE s.user_id=$1 AND e.live_revision_id IS NOT NULL AND e.lifecycle='active') AS saved
  `,
      [p.userId],
    )
  ).rows[0];
  return {
    user: {
      userId: p.userId,
      name: p.name,
      email: p.email,
      roles: p.roles,
      stepUp: p.stepUp,
      identities: row.identities,
      preferences: row.preferences || {
        locale: "en-IN",
        reduced_motion: false,
        marketing_email: false,
        version: 0,
      },
    },
    cart: row.cart.id ? row.cart : { id: "", version: 0, items: [] },
    savedRituals: row.saved,
  };
}
