import { pool, transaction } from "../../db";
import { authorize, type Principal } from "../../security/session";
import { AppError } from "../../security/http";
import { safePath } from "./schemas";
import { audit } from "./service";
export async function redirectSave(
  p: Principal | null,
  source: string,
  target: string,
  status: 301 | 308,
) {
  const actor = authorize(p, "content.publish");
  safePath.parse(source);
  safePath.parse(target);
  if (source === target)
    throw new AppError(422, "REDIRECT_LOOP", "Source and target must differ");
  return transaction(async (c) => {
    await c.query("SELECT pg_advisory_xact_lock(781208)");
    const edges = new Map<string, string>(
      (
        await c.query(
          "SELECT source_path,target_path FROM redirects WHERE enabled",
        )
      ).rows.map((r) => [r.source_path, r.target_path]),
    );
    edges.set(source, target);
    let next = target;
    const visited = new Set([source]);
    while (edges.has(next)) {
      if (visited.has(next))
        throw new AppError(
          422,
          "REDIRECT_LOOP",
          "Redirect would create a loop",
        );
      visited.add(next);
      next = edges.get(next)!;
    }
    if (visited.has(next))
      throw new AppError(422, "REDIRECT_LOOP", "Redirect would create a loop");
    await c.query(
      "INSERT INTO redirects VALUES($1,$2,$3,true) ON CONFLICT(source_path) DO UPDATE SET target_path=excluded.target_path,status=excluded.status,enabled=true",
      [source, target, status],
    );
    await audit(c, actor.userId, "redirect.save", source, { target, status });
    return { source, target, status };
  });
}
export async function schedule(
  p: Principal | null,
  id: string,
  revisionId: string,
  expectedVersion: number,
  publishAt: string,
) {
  const actor = authorize(p, "content.publish");
  const time = new Date(publishAt);
  if (
    !Number.isFinite(time.getTime()) ||
    time.getTime() <= Date.now() ||
    time.getTime() > Date.now() + 365 * 86400000
  )
    throw new AppError(422, "SCHEDULE", "Choose a future date within one year");
  return transaction(async (c) => {
    const e = (
      await c.query(
        "SELECT version FROM content_entities WHERE id=$1 FOR UPDATE",
        [id],
      )
    ).rows[0];
    if (!e || e.version !== expectedVersion)
      throw new AppError(409, "VERSION", "Content changed");
    const r = (
      await c.query(
        "INSERT INTO scheduled_publications(entity_id,revision_id,expected_version,publish_at,actor_id) VALUES($1,$2,$3,$4,$5) RETURNING id",
        [id, revisionId, expectedVersion, time, actor.userId],
      )
    ).rows[0];
    await c.query(
      "INSERT INTO jobs(type,payload,dedupe_key,available_at) VALUES($1,$2,$3,$4)",
      [
        "publish",
        JSON.stringify({ scheduleId: r.id }),
        "schedule:" + r.id,
        time,
      ],
    );
    await audit(c, actor.userId, "content.schedule", id, { scheduleId: r.id });
    return r;
  });
}
export async function redirects() {
  return (
    await pool.query("SELECT * FROM redirects ORDER BY source_path LIMIT 50")
  ).rows;
}
