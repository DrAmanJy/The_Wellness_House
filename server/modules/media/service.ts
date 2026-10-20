import { mkdir, writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { pool, transaction } from "../../db";
import { authorize, type Principal } from "../../security/session";
import { cookieValue, json, AppError } from "../../security/http";
import { hash } from "../../security/crypto";
import { z } from "zod";
export async function media(
  req: Request,
  id: string | undefined,
  p: Principal | null,
) {
  const directory = resolve(
    process.env.MEDIA_DIRECTORY || "work/private-media",
  );
  if (req.method === "POST" && !id) {
    const actor = authorize(p, "content.edit");
    const size = Number(req.headers.get("content-length"));
    if (!size || size > 10 * 1024 * 1024)
      throw new AppError(
        413,
        "UPLOAD_SIZE",
        "Image upload must be under 10 MB",
      );
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    const reader = req.body!.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > 10 * 1024 * 1024) {
        await reader.cancel();
        throw new AppError(413, "UPLOAD_SIZE", "Image is too large");
      }
      chunks.push(value);
    }
    const input = Buffer.concat(chunks);
    const metadata = await sharp(input, {
      limitInputPixels: 40000000,
    }).metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format || ""))
      throw new AppError(422, "MEDIA_TYPE", "Upload a JPEG, PNG or WebP image");
    const clean = await sharp(input, { limitInputPixels: 40000000 })
      .rotate()
      .webp({ quality: 90 })
      .toBuffer();
    const key = crypto.randomUUID() + ".webp";
    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, key), clean, { flag: "wx" });
    const row = await transaction(async (c) => {
      const asset = (
        await c.query(
          "INSERT INTO media_assets(storage_key,mime_type,bytes,status,uploaded_by) VALUES($1,'image/webp',$2,'ready',$3) RETURNING id,status",
          [key, clean.length, actor.userId],
        )
      ).rows[0];
      await c.query(
        "INSERT INTO audit_logs(actor_id,action,entity_id) VALUES($1,'media.upload',$2)",
        [actor.userId, asset.id],
      );
      return asset;
    });
    return json({ ...row, url: `/api/v1/media/${row.id}` }, 201);
  }
  if (req.method === "GET" && id) {
    z.string().uuid().parse(id);
    const row = (
      await pool.query(
        "SELECT * FROM media_assets WHERE id=$1 AND status='ready'",
        [id],
      )
    ).rows[0];
    if (!row) throw new AppError(404, "NOT_FOUND", "Media not found");
    const live = (
      await pool.query(
        "SELECT 1 FROM revision_media rm JOIN content_entities e ON e.live_revision_id=rm.revision_id WHERE rm.media_id=$1 AND e.lifecycle='active'",
        [id],
      )
    ).rowCount;
    if (!live) {
      let staff = false;
      try {
        authorize(p, "content.read");
        staff = true;
      } catch {}
      if (!staff) {
        const allowed = (
          await pool.query(
            `SELECT 1 FROM preview_sessions s JOIN preview_links l ON l.id=s.link_id JOIN revision_media rm ON rm.revision_id=l.revision_id WHERE s.token_hash=$1 AND s.expires_at>now() AND l.expires_at>now() AND l.revoked_at IS NULL AND rm.media_id=$2 AND (NOT l.require_reviewer_login OR $3::boolean)`,
            [hash(cookieValue(req, "preview")), id, !!p],
          )
        ).rowCount;
        if (!allowed) throw new AppError(404, "NOT_FOUND", "Media not found");
      }
    }
    if (!/^[0-9a-f-]{36}\.webp$/i.test(row.storage_key))
      throw new AppError(404, "NOT_FOUND", "Media not found");
    const file = resolve(directory, row.storage_key);
    if (!file.startsWith(directory))
      throw new AppError(404, "NOT_FOUND", "Media not found");
    const data = await readFile(file);
    return new Response(data, {
      headers: {
        "Content-Type": row.mime_type,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
        "Referrer-Policy": "no-referrer",
      },
    });
  }
  throw new AppError(405, "METHOD", "Unsupported media action");
}
