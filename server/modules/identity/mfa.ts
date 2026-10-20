import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { pool, transaction } from "../../db";
import { AppError, origin } from "../../security/http";
import { authenticated, type Principal } from "../../security/session";
const rpID = () => new URL(origin()).hostname;
export async function options(p: Principal | null, register: boolean) {
  authenticated(p);
  if (!p.roles.length)
    throw new AppError(403, "STAFF", "Staff invitation required");
  const factors = (
    await pool.query("SELECT * FROM staff_factors WHERE user_id=$1", [p.userId])
  ).rows;
  if (
    register &&
    factors.length &&
    (!p.stepUp || Date.now() - p.stepUp.getTime() > 900000)
  )
    throw new AppError(
      403,
      "MFA_REQUIRED",
      "Verify an existing security key first",
    );
  if (register && Date.now() - p.createdAt.getTime() > 300000)
    throw new AppError(403, "REAUTHENTICATE", "Sign in again before enrolling");
  const value = register
    ? await generateRegistrationOptions({
        rpName: "The Wellness House",
        rpID: rpID(),
        userID: new TextEncoder().encode(p.userId),
        userName: p.email || p.userId,
        attestationType: "none",
        excludeCredentials: factors.map((f) => ({ id: f.id })),
        authenticatorSelection: {
          userVerification: "required",
          residentKey: "preferred",
        },
      })
    : await generateAuthenticationOptions({
        rpID: rpID(),
        allowCredentials: factors.map((f) => ({ id: f.id })),
        userVerification: "required",
      });
  await pool.query(
    "INSERT INTO staff_challenges VALUES($1,$2,$3,now()+interval '5 minutes') ON CONFLICT(session_id) DO UPDATE SET challenge=excluded.challenge,purpose=excluded.purpose,expires_at=excluded.expires_at",
    [p.id, value.challenge, register ? "register" : "verify"],
  );
  return value;
}
export async function verify(
  p: Principal | null,
  register: boolean,
  response: RegistrationResponseJSON | AuthenticationResponseJSON,
) {
  authenticated(p);
  if (!p.roles.length)
    throw new AppError(403, "STAFF", "Staff invitation required");
  return transaction(async (c) => {
    if (register) {
      await c.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [p.userId]);
      if (Date.now() - p.createdAt.getTime() > 300000)
        throw new AppError(
          403,
          "REAUTHENTICATE",
          "Sign in again before enrolling",
        );
      const factors = await c.query(
        "SELECT 1 FROM staff_factors WHERE user_id=$1 LIMIT 1",
        [p.userId],
      );
      if (
        factors.rowCount &&
        (!p.stepUp || Date.now() - p.stepUp.getTime() > 900000)
      )
        throw new AppError(
          403,
          "MFA_REQUIRED",
          "Verify an existing security key first",
        );
    }
    const challenge = (
      await c.query(
        "DELETE FROM staff_challenges WHERE session_id=$1 AND purpose=$2 AND expires_at>now() RETURNING challenge",
        [p.id, register ? "register" : "verify"],
      )
    ).rows[0];
    if (!challenge)
      throw new AppError(400, "CHALLENGE", "Security key challenge expired");
    if (register) {
      const result = await verifyRegistrationResponse({
        response: response as RegistrationResponseJSON,
        expectedChallenge: challenge.challenge,
        expectedOrigin: origin(),
        expectedRPID: rpID(),
        requireUserVerification: true,
      });
      if (!result.verified || !result.registrationInfo)
        throw new AppError(403, "MFA", "Security key verification failed");
      const f = result.registrationInfo.credential;
      await c.query("INSERT INTO staff_factors VALUES($1,$2,$3,$4,$5)", [
        f.id,
        p.userId,
        Buffer.from(f.publicKey),
        f.counter,
        JSON.stringify(f.transports || []),
      ]);
    } else {
      const f = (
        await c.query(
          "SELECT * FROM staff_factors WHERE id=$1 AND user_id=$2 FOR UPDATE",
          [response.id, p.userId],
        )
      ).rows[0];
      if (!f) throw new AppError(403, "MFA", "Unknown security key");
      const result = await verifyAuthenticationResponse({
        response: response as AuthenticationResponseJSON,
        expectedChallenge: challenge.challenge,
        expectedOrigin: origin(),
        expectedRPID: rpID(),
        credential: {
          id: f.id,
          publicKey: f.public_key,
          counter: Number(f.counter),
          transports: f.transports,
        },
        requireUserVerification: true,
      });
      if (!result.verified)
        throw new AppError(403, "MFA", "Security key verification failed");
      await c.query("UPDATE staff_factors SET counter=$2 WHERE id=$1", [
        f.id,
        result.authenticationInfo.newCounter,
      ]);
    }
    await c.query("UPDATE sessions SET staff_step_up_at=now() WHERE id=$1", [
      p.id,
    ]);
    return { verified: true };
  });
}
