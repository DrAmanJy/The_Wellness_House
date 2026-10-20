import { pool, transaction } from "../../db";
import { type Principal, authenticated } from "../../security/session";
import { AppError } from "../../security/http";
import { token, hash, encrypt } from "../../security/crypto";
import { addressSchema, profileSchema, preferenceSchema } from "./schemas";
export function recent(p: Principal | null) {
  authenticated(p);
  if (Date.now() - p.createdAt.getTime() > 5 * 60000)
    throw new AppError(
      403,
      "REAUTHENTICATE",
      "Please sign in again to confirm this change",
    );
  return p;
}
export async function profile(p: Principal) {
  return (
    await pool.query(
      "SELECT u.display_name AS name,u.contact_email AS email,coalesce(p.phone,'') AS phone,p.contact_email_verified_at,p.phone_verified_at,coalesce(p.version,0) AS version FROM users u LEFT JOIN customer_profiles p ON p.user_id=u.id WHERE u.id=$1",
      [p.userId],
    )
  ).rows[0];
}
export async function saveProfile(p: Principal, input: unknown) {
  const v = profileSchema.parse(input);
  const old = await profile(p);
  if (v.email !== old.email) recent(p);
  return transaction(async (c) => {
    await c.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [p.userId]);
    await c.query(
      "INSERT INTO customer_profiles(user_id) VALUES($1) ON CONFLICT DO NOTHING",
      [p.userId],
    );
    const changed = await c.query(
      "UPDATE customer_profiles SET phone=$2,phone_verified_at=CASE WHEN phone=$2 THEN phone_verified_at ELSE NULL END,contact_email_verified_at=CASE WHEN $4 THEN NULL ELSE contact_email_verified_at END,version=version+1,updated_at=now() WHERE user_id=$1 AND version=$3 RETURNING version",
      [p.userId, v.phone, v.version, v.email !== old.email],
    );
    if (!changed.rowCount)
      throw new AppError(
        409,
        "VERSION",
        "Your profile changed. Reload and try again",
      );
    await c.query("UPDATE users SET display_name=$2 WHERE id=$1", [
      p.userId,
      v.name,
    ]);
    if (v.email !== old.email) {
      if (!process.env.MAIL_API_KEY)
        throw new AppError(
          503,
          "EMAIL_UNAVAILABLE",
          "Email verification is not configured. Your contact email has not changed.",
        );
      const raw = token();
      await c.query(
        "UPDATE contact_verifications SET consumed_at=now() WHERE user_id=$1 AND consumed_at IS NULL",
        [p.userId],
      );
      const verification = (
        await c.query(
          "INSERT INTO contact_verifications(user_id,email,token_hash,expires_at) VALUES($1,$2,$3,now()+interval '30 minutes') RETURNING id",
          [p.userId, v.email, hash(raw)],
        )
      ).rows[0];
      await c.query(
        "INSERT INTO jobs(type,payload,dedupe_key) VALUES($1,$2,$3)",
        [
          "contact-verification",
          JSON.stringify({ id: verification.id, token: encrypt(raw) }),
          `contact:${verification.id}`,
        ],
      );
    }
    return { saved: true, emailVerificationPending: v.email !== old.email };
  });
}
export async function verifyContact(p: Principal, raw: string) {
  return transaction(async (c) => {
    await c.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [p.userId]);
    const v = (
      await c.query(
        "UPDATE contact_verifications SET consumed_at=now() WHERE token_hash=$1 AND user_id=$2 AND consumed_at IS NULL AND expires_at>now() RETURNING email",
        [hash(raw), p.userId],
      )
    ).rows[0];
    if (!v)
      throw new AppError(
        422,
        "VERIFICATION",
        "Verification expired or invalid",
      );
    await c.query("UPDATE users SET contact_email=$2 WHERE id=$1", [
      p.userId,
      v.email,
    ]);
    await c.query(
      "UPDATE customer_profiles SET contact_email_verified_at=now(),version=version+1 WHERE user_id=$1",
      [p.userId],
    );
    return { verified: true };
  });
}
export async function preferences(p: Principal) {
  return (
    (
      await pool.query(
        "SELECT locale,reduced_motion,marketing_email,version FROM customer_preferences WHERE user_id=$1",
        [p.userId],
      )
    ).rows[0] || {
      locale: "en-IN",
      reduced_motion: false,
      marketing_email: false,
      version: 0,
    }
  );
}
export async function savePreferences(p: Principal, input: unknown) {
  const v = preferenceSchema.parse(input);
  return transaction(async (c) => {
    await c.query(
      "INSERT INTO customer_preferences(user_id) VALUES($1) ON CONFLICT DO NOTHING",
      [p.userId],
    );
    const prior = (
      await c.query(
        "SELECT marketing_email FROM customer_preferences WHERE user_id=$1 FOR UPDATE",
        [p.userId],
      )
    ).rows[0];
    const row = (
      await c.query(
        "UPDATE customer_preferences SET reduced_motion=$2,marketing_email=$3,version=version+1,updated_at=now() WHERE user_id=$1 AND version=$4 RETURNING *",
        [p.userId, v.reduced_motion, v.marketing_email, v.version],
      )
    ).rows[0];
    if (!row)
      throw new AppError(409, "VERSION", "Preferences changed. Reload first");
    if (prior.marketing_email !== v.marketing_email)
      await c.query(
        "INSERT INTO consent_events(subject_reference,purpose,policy_version,granted) VALUES($1,'marketing-email','2026-10-17',$2)",
        [p.userId, v.marketing_email],
      );
    return row;
  });
}
export async function addresses(p: Principal) {
  return {
    items: (
      await pool.query(
        "SELECT * FROM addresses WHERE user_id=$1 AND archived_at IS NULL ORDER BY created_at,id",
        [p.userId],
      )
    ).rows,
    defaults: (
      await pool.query(
        "SELECT shipping_address_id,billing_address_id FROM customer_defaults WHERE user_id=$1",
        [p.userId],
      )
    ).rows[0] || { shipping_address_id: null, billing_address_id: null },
  };
}
export async function saveAddress(
  p: Principal,
  input: unknown,
  id?: string,
  version?: number,
  makeDefault = false,
) {
  const v = addressSchema.parse(input);
  return transaction(async (c) => {
    await c.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [p.userId]);
    const values = [
      p.userId,
      v.label,
      v.recipient,
      v.phone,
      v.line1,
      v.line2,
      v.landmark,
      v.city,
      v.region,
      v.postal_code,
      v.country_code,
    ];
    let row;
    if (id) {
      const existing = (
        await c.query(
          "SELECT version FROM addresses WHERE user_id=$1 AND id=$2 AND archived_at IS NULL",
          [p.userId, id],
        )
      ).rows[0];
      if (!existing) throw new AppError(404, "ADDRESS", "Address not found");
      if (existing.version !== version)
        throw new AppError(409, "VERSION", "Address changed. Reload first");
      row = (
        await c.query(
          "UPDATE addresses SET label=$2,recipient=$3,phone=$4,line1=$5,line2=$6,landmark=$7,city=$8,region=$9,postal_code=$10,country_code=$11,version=version+1 WHERE user_id=$1 AND id=$12 RETURNING *",
          [...values, id],
        )
      ).rows[0];
    } else {
      if (
        (
          await c.query(
            "SELECT 1 FROM addresses WHERE user_id=$1 AND archived_at IS NULL",
            [p.userId],
          )
        ).rowCount! >= 10
      )
        throw new AppError(
          422,
          "ADDRESS_LIMIT",
          "You can save up to ten addresses",
        );
      row = (
        await c.query(
          "INSERT INTO addresses(user_id,label,recipient,phone,line1,line2,landmark,city,region,postal_code,country_code) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *",
          values,
        )
      ).rows[0];
    }
    if (makeDefault)
      await c.query(
        "INSERT INTO customer_defaults(user_id,shipping_address_id) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET shipping_address_id=excluded.shipping_address_id",
        [p.userId, row.id],
      );
    return row;
  });
}
export async function defaultAddress(p: Principal, id: string) {
  await transaction(async (c) => {
    await c.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [p.userId]);
    if (
      !(
        await c.query(
          "SELECT 1 FROM addresses WHERE id=$1 AND user_id=$2 AND archived_at IS NULL",
          [id, p.userId],
        )
      ).rowCount
    )
      throw new AppError(404, "ADDRESS", "Address not found");
    await c.query(
      "INSERT INTO customer_defaults(user_id,shipping_address_id) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET shipping_address_id=excluded.shipping_address_id",
      [p.userId, id],
    );
  });
  return { saved: true };
}
export async function deleteAddress(p: Principal, id: string) {
  await transaction(async (c) => {
    await c.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [p.userId]);
    if (
      !(
        await c.query(
          "UPDATE addresses SET archived_at=now(),version=version+1 WHERE id=$1 AND user_id=$2 AND archived_at IS NULL",
          [id, p.userId],
        )
      ).rowCount
    )
      throw new AppError(404, "ADDRESS", "Address not found");
    await c.query(
      "UPDATE customer_defaults SET shipping_address_id=CASE WHEN shipping_address_id=$2 THEN NULL ELSE shipping_address_id END,billing_address_id=CASE WHEN billing_address_id=$2 THEN NULL ELSE billing_address_id END WHERE user_id=$1",
      [p.userId, id],
    );
  });
  return { deleted: true };
}
