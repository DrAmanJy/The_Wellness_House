import { pool, transaction } from "../../db";
import type { PoolClient } from "pg";
import { AppError } from "../../security/http";
import { hash } from "../../security/crypto";
import type { Principal } from "../../security/session";
export async function cart(p: Principal | null, guest: string) {
  return transaction(async (c) => {
    await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
      p ? "cart:user:" + p.userId : "cart:guest:" + hash(guest),
    ]);
    if (p) {
      const row = (
        await c.query(
          "SELECT id,expires_at FROM carts WHERE user_id=$1 AND state='active' FOR UPDATE",
          [p.userId],
        )
      ).rows[0];
      if (row) {
        await c.query(
          "UPDATE carts SET expires_at=now()+interval '30 days' WHERE id=$1",
          [row.id],
        );
        return row.id as string;
      }
      return (
        await c.query("INSERT INTO carts(user_id) VALUES($1) RETURNING id", [
          p.userId,
        ])
      ).rows[0].id as string;
    }
    const row = (
      await c.query("SELECT * FROM carts WHERE guest_hash=$1 FOR UPDATE", [
        hash(guest),
      ])
    ).rows[0];
    if (row) {
      if (row.state !== "active" || row.expires_at <= new Date())
        throw new AppError(
          409,
          "GUEST_CART_CONSUMED",
          "Your bag changed after sign-in. Refresh and try again.",
        );
      return row.id as string;
    }
    return (
      await c.query("INSERT INTO carts(guest_hash) VALUES($1) RETURNING id", [
        hash(guest),
      ])
    ).rows[0].id as string;
  });
}
export async function assertCart(c: PoolClient, id: string) {
  const row = (
    await c.query("SELECT * FROM carts WHERE id=$1 FOR UPDATE", [id])
  ).rows[0];
  if (!row || row.state !== "active" || row.expires_at <= new Date())
    throw new AppError(409, "CART_INACTIVE", "This bag is no longer active");
  return row;
}
export async function cartItems(id: string) {
  return (
    await pool.query(
      `SELECT v.id AS variant_id,v.title AS variant_title,v.supply_code,v.price_minor,v.currency,i.quantity,i.line_id,i.total_added,e.id AS product_id,e.slug,r.content,(v.active AND e.lifecycle='active' AND e.live_revision_id IS NOT NULL) AS available FROM cart_items i JOIN product_variants v ON v.id=i.variant_id JOIN content_entities e ON e.id=v.product_id LEFT JOIN content_revisions r ON r.id=e.live_revision_id WHERE i.cart_id=$1 ORDER BY v.id`,
      [id],
    )
  ).rows.map((r) => ({
    variantId: r.variant_id,
    lineId: r.line_id,
    totalAdded: r.total_added,
    variantTitle: r.variant_title,
    supplyCode: r.supply_code,
    priceMinor: r.price_minor,
    currency: r.currency,
    quantity: r.quantity,
    available: r.available,
    ritual: {
      ...(r.content || { title: r.variant_title }),
      id: r.product_id,
      slug: r.slug,
    },
  }));
}
export async function snapshot(id: string) {
  const items = await cartItems(id);
  const row = (await pool.query("SELECT version FROM carts WHERE id=$1", [id]))
    .rows[0];
  return { id, version: row.version, items };
}
export async function mutateItem(
  cartId: string,
  variantId: string,
  input: {
    quantity: number;
    expectedVersion?: number;
    operationId?: string;
    increment?: boolean;
  },
) {
  await transaction(async (c) => {
    const row = await assertCart(c, cartId);
    const fingerprint = hash(
      JSON.stringify({
        variantId,
        quantity: input.quantity,
        increment: !!input.increment,
      }),
    );
    if (input.operationId) {
      const prior = (
        await c.query(
          "SELECT * FROM cart_operations WHERE cart_id=$1 AND operation_id=$2",
          [cartId, input.operationId],
        )
      ).rows[0];
      if (prior) {
        if (prior.request_hash !== fingerprint)
          throw new AppError(
            409,
            "OPERATION_REUSED",
            "This action was already used for different items",
          );
        return;
      }
    }
    if (
      input.expectedVersion !== undefined &&
      row.version !== input.expectedVersion
    )
      throw new AppError(
        409,
        "CART_VERSION",
        "Your bag changed in another tab. Refresh and try again.",
      );
    const v = (
      await c.query(
        "SELECT v.id FROM product_variants v JOIN content_entities e ON e.id=v.product_id WHERE v.id=$1 AND v.active AND e.lifecycle='active' AND e.live_revision_id IS NOT NULL",
        [variantId],
      )
    ).rows[0];
    if (!v && input.quantity)
      throw new AppError(404, "PRODUCT", "This supply is unavailable");
    const existing =
      (
        await c.query(
          "SELECT quantity FROM cart_items WHERE cart_id=$1 AND variant_id=$2",
          [cartId, variantId],
        )
      ).rows[0]?.quantity || 0;
    const quantity = input.increment
      ? existing + input.quantity
      : input.quantity;
    if (
      !existing &&
      quantity > 0 &&
      (await c.query("SELECT 1 FROM cart_items WHERE cart_id=$1", [cartId]))
        .rowCount! >= 50
    )
      throw new AppError(
        422,
        "CART_LIMIT",
        "A bag can contain up to 50 different supplies",
      );
    if (quantity > 99 || quantity < 0)
      throw new AppError(422, "QUANTITY", "Choose between 1 and 99 units");
    if (quantity)
      await c.query(
        "INSERT INTO cart_items(cart_id,variant_id,quantity,total_added) VALUES($1,$2,$3::integer,$3::bigint) ON CONFLICT(cart_id,variant_id) DO UPDATE SET total_added=cart_items.total_added+GREATEST(0,excluded.quantity-cart_items.quantity),quantity=excluded.quantity",
        [cartId, variantId, quantity],
      );
    else
      await c.query(
        "DELETE FROM cart_items WHERE cart_id=$1 AND variant_id=$2",
        [cartId, variantId],
      );
    await c.query("UPDATE carts SET version=version+1 WHERE id=$1", [cartId]);
    if (input.operationId)
      await c.query("INSERT INTO cart_operations VALUES($1,$2,$3,$4)", [
        cartId,
        input.operationId,
        fingerprint,
        row.version + 1,
      ]);
  });
  return snapshot(cartId);
}
// Compatibility for non-commerce integrations; the storefront uses variant IDs.
export async function setItem(cartId: string, slug: string, quantity: number) {
  const v = (
    await pool.query(
      "SELECT v.id FROM product_variants v JOIN content_entities e ON e.id=v.product_id WHERE e.slug=$1 AND v.supply_code='standard-30'",
      [slug],
    )
  ).rows[0];
  if (!v) throw new AppError(404, "PRODUCT", "Ritual unavailable");
  await mutateItem(cartId, v.id, { quantity });
  return cartItems(cartId);
}
export async function clear(cartId: string, expectedVersion: number) {
  await transaction(async (c) => {
    const row = await assertCart(c, cartId);
    if (row.version !== expectedVersion)
      throw new AppError(409, "CART_VERSION", "Refresh your bag first");
    await c.query("DELETE FROM cart_items WHERE cart_id=$1", [cartId]);
    await c.query("UPDATE carts SET version=version+1 WHERE id=$1", [cartId]);
  });
  return snapshot(cartId);
}
export async function merge(p: Principal, guest: string) {
  const source = (
    await pool.query("SELECT id FROM carts WHERE guest_hash=$1", [hash(guest)])
  ).rows[0];
  if (!source) return cartItems(await cart(p, ""));
  return mergeSource(p, source.id);
}
export async function mergeSource(p: Principal, sourceId: string) {
  const target = await cart(p, "");
  await transaction(async (c) => {
    const source = (
      await c.query(
        "SELECT id FROM carts WHERE id=$1 AND user_id IS NULL AND guest_hash IS NOT NULL",
        [sourceId],
      )
    ).rows[0];
    if (!source) return;
    await c.query(
      "SELECT id FROM carts WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE",
      [[target, source.id]],
    );
    const prior = (
      await c.query("SELECT * FROM cart_merge_receipts WHERE source_id=$1", [
        source.id,
      ])
    ).rows[0];
    if (prior) {
      if (prior.user_id !== p.userId)
        throw new AppError(
          409,
          "CART_CONSUMED",
          "This guest bag was already claimed",
        );
      return;
    }
    const current = (
      await c.query("SELECT * FROM carts WHERE id=$1", [source.id])
    ).rows[0];
    if (current.state !== "active" || current.expires_at <= new Date()) return;
    await assertCart(c, target);
    await c.query(
      `INSERT INTO cart_items(cart_id,variant_id,quantity,total_added) SELECT $1,i.variant_id,i.quantity,i.quantity FROM cart_items i WHERE i.cart_id=$2 ON CONFLICT(cart_id,variant_id) DO UPDATE SET total_added=cart_items.total_added+LEAST(99-cart_items.quantity,excluded.quantity),quantity=LEAST(99,cart_items.quantity+excluded.quantity)`,
      [target, source.id],
    );
    await c.query(
      "INSERT INTO cart_merge_receipts(source_id,destination_id,user_id) VALUES($1,$2,$3)",
      [source.id, target, p.userId],
    );
    await c.query("DELETE FROM cart_items WHERE cart_id=$1", [source.id]);
    await c.query(
      "UPDATE carts SET state='merged',merged_into=$2,merged_at=now(),version=version+1 WHERE id=$1",
      [source.id, target],
    );
    await c.query("UPDATE carts SET version=version+1 WHERE id=$1", [target]);
  });
  return cartItems(target);
}
