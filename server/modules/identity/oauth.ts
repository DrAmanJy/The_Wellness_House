import { purchaseCookie } from "./purchase-cookies";
import { z } from "zod";
import { body, readRawBody } from "../../security/http";
import { authorizeIntent, resume } from "../checkout/service";
import * as oidc from "openid-client";
import { pool, transaction } from "../../db";
import { token, hash, encrypt, decrypt } from "../../security/crypto";
import {
  AppError,
  cookie,
  cookieValue,
  origin,
  limit,
} from "../../security/http";
import { merge, mergeSource } from "../cart/service";
import { session, authenticated } from "../../security/session";
const providers = {
  google: { issuer: "https://accounts.google.com", prefix: "GOOGLE" },
  apple: { issuer: "https://appleid.apple.com", prefix: "APPLE" },
};
async function config(provider: keyof typeof providers) {
  const p = providers[provider];
  const id = process.env[`${p.prefix}_CLIENT_ID`],
    secret = process.env[`${p.prefix}_CLIENT_SECRET`];
  if (!id || !secret)
    throw new AppError(
      503,
      "PROVIDER_NOT_CONFIGURED",
      `${provider === "google" ? "Google" : "Apple"} sign-in is temporarily unavailable. Please try again later or choose another sign-in method.`,
    );
  const conf = await oidc.discovery(
    new URL(p.issuer),
    id,
    secret,
    oidc.ClientSecretPost(secret),
  );
  oidc.enableNonRepudiationChecks(conf);
  return conf;
}
export async function begin(
  req: Request,
  provider: keyof typeof providers,
  link = false,
) {
  await limit(req, "oauth", 15);
  const p = await session(req);
  if (link) {
    authenticated(p);
    if (Date.now() - p.createdAt.getTime() > 300000)
      throw new AppError(403, "REAUTHENTICATE", "Sign in again before linking");
  }
  const input = await body(
    req,
    z
      .object({
        intentId: z.string().uuid().optional(),
        returnPath: z.string().max(200).optional(),
      })
      .strict(),
  );
  const allowed = [
    "/admin/security",
    "/account",
    "/checkout",
    "/account/profile",
    "/account/security",
    "/account/addresses",
    "/account/preferences",
    "/account/orders",
    "/account/saved",
    "/account/verify-contact",
  ];
  const requested = input.returnPath || "/account";
  const returnPath =
    allowed.includes(requested) ||
    /^\/checkout\?session=[0-9a-f-]{36}$/.test(requested) ||
    /^\/account\/orders\/[0-9a-f-]{36}$/.test(requested)
      ? requested
      : "/account";
  if (input.intentId)
    await authorizeIntent(
      p,
      input.intentId,
      cookieValue(req, purchaseCookie(input.intentId)),
    );
  const sourceGuest = (
    await pool.query(
      "SELECT id FROM carts WHERE guest_hash=$1 AND user_id IS NULL AND state='active' AND expires_at>now()",
      [hash(cookieValue(req, "guest"))],
    )
  ).rows[0];
  const conf = await config(provider),
    state = token(),
    nonce = token(),
    verifier = oidc.randomPKCECodeVerifier(),
    correlation = token();
  await pool.query(
    "INSERT INTO oauth_transactions(state_hash,cookie_hash,provider,nonce,verifier,link_user_id,expires_at,purchase_intent_id,return_path,reauth_user_id,guest_cart_id,source_session_id) VALUES($1,$2,$3,$4,$5,$6,now()+interval '10 minutes',$7,$8,$9,$10,$11)",
    [
      hash(state),
      hash(correlation),
      provider,
      nonce,
      encrypt(verifier),
      link ? p!.userId : null,
      input.intentId || null,
      returnPath,
      p && !input.intentId ? p.userId : null,
      sourceGuest?.id || null,
      p?.id || null,
    ],
  );
  const params: Record<string, string> = {
    redirect_uri: `${origin(req)}/api/v1/auth/${provider}/callback`,
    scope: provider === "apple" ? "openid email name" : "openid email profile",
    state,
    nonce,
    response_type: "code",
  };
  if (provider === "google") {
    params.code_challenge = await oidc.calculatePKCECodeChallenge(verifier);
    params.code_challenge_method = "S256";
    params.prompt = "select_account";
  } else params.response_mode = "form_post";
  return Response.json(
    { url: oidc.buildAuthorizationUrl(conf, params).href },
    {
      headers: {
        "Set-Cookie": cookie(
          "oauth_" + hash(state).slice(0, 16),
          correlation,
          600,
          "None",
        ),
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    },
  );
}
export async function callback(req: Request, provider: keyof typeof providers) {
  await limit(req, "oauth-callback", 30);
  const rawBody = req.method === "POST" ? await readRawBody(req) : undefined;
  const callbackUrl = `${origin(req)}${new URL(req.url).pathname}${new URL(req.url).search}`;
  const grantRequest = new Request(callbackUrl, {
    method: req.method,
    headers: req.headers,
    body: rawBody,
  });
  const posted =
    req.method === "POST"
      ? new URLSearchParams(rawBody!.toString("utf8"))
      : new URL(req.url).searchParams;
  const state = posted.get("state") || "";
  if (!state)
    throw new AppError(
      400,
      "OAUTH_STATE",
      "Sign-in state missing. Start again.",
    );
  const stateHash = hash(state);
  const stateCookieName = "oauth_" + stateHash.slice(0, 16);
  const cookieVal = cookieValue(req, stateCookieName);
  const t = (
    await pool.query(
      "DELETE FROM oauth_transactions WHERE state_hash=$1 AND provider=$2 AND expires_at>now() RETURNING *",
      [stateHash, provider],
    )
  ).rows[0];
  if (!t)
    throw new AppError(
      400,
      "OAUTH_STATE",
      "Sign-in expired or invalid. Start again.",
    );
  if (cookieVal && hash(cookieVal) !== t.cookie_hash) {
    throw new AppError(
      400,
      "OAUTH_STATE",
      "Sign-in correlation mismatch. Start again.",
    );
  }
  const conf = await config(provider);
  const result = await oidc.authorizationCodeGrant(conf, grantRequest, {
    expectedState: state,
    expectedNonce: t.nonce,
    idTokenExpected: true,
    ...(provider === "google" ? { pkceCodeVerifier: decrypt(t.verifier) } : {}),
  });
  const claims = result.claims();
  if (!claims?.sub)
    throw new AppError(400, "OAUTH_IDENTITY", "Invalid identity");
  const existingSession = await session(req);
  if (
    t.link_user_id &&
    existingSession &&
    existingSession.userId !== t.link_user_id
  )
    throw new AppError(403, "LINK_SESSION", "Linking session expired");
  const email = typeof claims.email === "string" ? claims.email : null,
    verified =
      claims.email_verified === true || claims.email_verified === "true";
  let name = typeof claims.name === "string" ? claims.name.slice(0, 200) : "";
  if (provider === "apple" && posted.get("user")) {
    try {
      const profile = JSON.parse(posted.get("user")!);
      name = [profile.name?.firstName, profile.name?.lastName]
        .filter((x) => typeof x === "string")
        .join(" ")
        .slice(0, 200);
    } catch {}
  }
  const raw = token();
  await transaction(async (c) => {
    if (
      t.link_user_id &&
      !(
        await c.query(
          "SELECT id FROM sessions WHERE id=$1 AND user_id=$2 AND revoked_at IS NULL AND expires_at>now() AND last_seen_at>now()-interval '1 day' FOR SHARE",
          [t.source_session_id, t.link_user_id],
        )
      ).rowCount
    )
      throw new AppError(
        403,
        "LINK_SESSION",
        "Linking session expired. Sign in and start again.",
      );
    await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
      `${provider}:${claims.sub}`,
    ]);
    const identity = (
      await c.query(
        "SELECT * FROM auth_identities WHERE provider=$1 AND issuer=$2 AND subject=$3",
        [provider, providers[provider].issuer, claims.sub],
      )
    ).rows[0];
    if (identity && t.link_user_id && identity.user_id !== t.link_user_id)
      throw new AppError(
        409,
        "IDENTITY_LINKED",
        "Identity already belongs to another account",
      );
    let uid = identity?.user_id || t.link_user_id;
    if (t.reauth_user_id && uid !== t.reauth_user_id)
      throw new AppError(
        403,
        "REAUTH_ACCOUNT",
        "Sign in with an identity linked to the current account",
      );
    if (!uid)
      uid = (
        await c.query(
          "INSERT INTO users(display_name,contact_email) VALUES($1,$2) RETURNING id",
          [name, email],
        )
      ).rows[0].id;
    if (
      !(
        await c.query("SELECT 1 FROM users WHERE id=$1 AND status='active'", [
          uid,
        ])
      ).rowCount
    )
      throw new AppError(403, "ACCOUNT_DISABLED", "Account disabled");
    if (!identity)
      await c.query(
        "INSERT INTO auth_identities(user_id,provider,issuer,subject,email,email_verified) VALUES($1,$2,$3,$4,$5,$6)",
        [
          uid,
          provider,
          providers[provider].issuer,
          claims.sub,
          email,
          verified,
        ],
      );
    if (name)
      await c.query(
        "UPDATE users SET display_name=$2 WHERE id=$1 AND display_name=''",
        [uid, name],
      );
    if (existingSession)
      await c.query("UPDATE sessions SET revoked_at=now() WHERE id=$1", [
        existingSession.id,
      ]);
    await c.query(
      "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '7 days')",
      [hash(raw), uid],
    );
  });
  const principal = await session(
    new Request(req.url, {
      headers: { cookie: cookie("session", raw).split(";")[0] },
    }),
  );
  if (principal && t.guest_cart_id) {
    try {
      await mergeSource(principal, t.guest_cart_id);
    } catch (e) {
      if (!(e instanceof AppError && e.code === "CART_CONSUMED")) throw e;
    }
  } else if (principal && cookieValue(req, "guest"))
    await merge(principal, cookieValue(req, "guest"));
  let destination = t.return_path || "/account";
  if (t.purchase_intent_id && principal) {
    try {
      const next = await resume(
        principal,
        t.purchase_intent_id,
        undefined,
        true,
      );
      destination = "/checkout?session=" + next.id;
    } catch {
      destination = "/account?intent=" + t.purchase_intent_id;
    }
  }
  const headers = new Headers({
    Location: destination,
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
  });
  headers.append("Set-Cookie", cookie("session", raw, 604800));
  headers.append(
    "Set-Cookie",
    cookie("oauth_" + hash(state).slice(0, 16), "", 0, "None"),
  );
  headers.append("Set-Cookie", cookie("guest", token(), 2592000));
  return new Response(null, { status: 303, headers });
}
