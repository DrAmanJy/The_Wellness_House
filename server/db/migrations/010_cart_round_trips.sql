-- Consistent cart contents and version in one database statement.
CREATE FUNCTION cart_snapshot(p_id uuid) RETURNS jsonb LANGUAGE sql STABLE AS $$
 SELECT jsonb_build_object('id',c.id,'version',c.version,'items',coalesce((
  SELECT jsonb_agg(jsonb_build_object(
   'variantId',v.id,'lineId',i.line_id,'totalAdded',i.total_added::text,
   'variantTitle',v.title,'supplyCode',v.supply_code,'priceMinor',v.price_minor::text,
   'currency',v.currency,'quantity',i.quantity,
   'available',(v.active AND e.lifecycle='active' AND e.live_revision_id IS NOT NULL),
   'ritual',coalesce(r.content,jsonb_build_object('title',v.title))||jsonb_build_object('id',e.id,'slug',e.slug)
  ) ORDER BY v.id)
  FROM cart_items i JOIN product_variants v ON v.id=i.variant_id
  JOIN content_entities e ON e.id=v.product_id LEFT JOIN content_revisions r ON r.id=e.live_revision_id
  WHERE i.cart_id=c.id
 ),'[]'::jsonb)) FROM carts c WHERE c.id=p_id
$$;

-- All locks, checks, replay protection, updates and the response execute on
-- PostgreSQL, avoiding a transcontinental round trip for every statement.
CREATE FUNCTION mutate_owned_cart(
 p_user uuid,p_guest text,p_cart uuid,p_variant uuid,p_quantity integer,
 p_increment boolean,p_version integer,p_operation uuid,p_fingerprint text
) RETURNS jsonb LANGUAGE plpgsql SET lock_timeout='3s' AS $$
DECLARE bag carts%ROWTYPE; prior cart_operations%ROWTYPE; existing integer; quantity integer;
BEGIN
 IF p_quantity<0 OR p_quantity>99 THEN RAISE EXCEPTION 'QUANTITY'; END IF;
 IF p_user IS NULL AND (p_guest IS NULL OR p_guest='') THEN RAISE EXCEPTION 'CART_OWNER_CHANGED'; END IF;
 IF p_cart IS NULL THEN
  PERFORM pg_advisory_xact_lock(hashtextextended(CASE WHEN p_user IS NOT NULL THEN 'cart:user:'||p_user::text ELSE 'cart:guest:'||p_guest END,0));
  IF p_user IS NOT NULL THEN
   SELECT * INTO bag FROM carts WHERE user_id=p_user AND state='active' FOR UPDATE;
  ELSE
   SELECT * INTO bag FROM carts WHERE guest_hash=p_guest FOR UPDATE;
  END IF;
  IF NOT FOUND THEN
   INSERT INTO carts(user_id,guest_hash) VALUES(p_user,CASE WHEN p_user IS NULL THEN p_guest ELSE NULL END) RETURNING * INTO bag;
  END IF;
 ELSE
  SELECT * INTO bag FROM carts WHERE id=p_cart AND (
   (p_user IS NOT NULL AND user_id=p_user) OR
   (p_user IS NULL AND user_id IS NULL AND guest_hash=p_guest)
  ) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'CART_OWNER_CHANGED'; END IF;
 END IF;
 IF bag.state<>'active' THEN RAISE EXCEPTION 'CART_INACTIVE'; END IF;
 IF p_user IS NULL AND bag.expires_at<=now() THEN RAISE EXCEPTION 'GUEST_CART_CONSUMED'; END IF;
 IF p_user IS NOT NULL AND bag.expires_at<now()+interval '29 days' THEN
  UPDATE carts SET expires_at=now()+interval '30 days' WHERE id=bag.id;
 END IF;
 SELECT * INTO prior FROM cart_operations WHERE cart_id=bag.id AND operation_id=p_operation;
 IF FOUND THEN
  IF prior.request_hash<>p_fingerprint THEN RAISE EXCEPTION 'OPERATION_REUSED'; END IF;
  RETURN cart_snapshot(bag.id);
 END IF;
 IF p_version IS NOT NULL AND p_version<>bag.version THEN RAISE EXCEPTION 'CART_VERSION'; END IF;
 IF p_quantity>0 AND NOT EXISTS(
  SELECT 1 FROM product_variants v JOIN content_entities e ON e.id=v.product_id
  WHERE v.id=p_variant AND v.active AND e.lifecycle='active' AND e.live_revision_id IS NOT NULL
 ) THEN RAISE EXCEPTION 'PRODUCT_UNAVAILABLE'; END IF;
 SELECT coalesce((SELECT i.quantity FROM cart_items i WHERE cart_id=bag.id AND variant_id=p_variant),0) INTO existing;
 quantity=CASE WHEN p_increment THEN existing+p_quantity ELSE p_quantity END;
 IF quantity>99 OR quantity<0 THEN RAISE EXCEPTION 'QUANTITY'; END IF;
 IF existing=0 AND quantity>0 AND (SELECT count(*) FROM cart_items WHERE cart_id=bag.id)>=50 THEN RAISE EXCEPTION 'CART_LIMIT'; END IF;
 IF quantity=0 THEN
  DELETE FROM cart_items WHERE cart_id=bag.id AND variant_id=p_variant;
 ELSE
  INSERT INTO cart_items(cart_id,variant_id,quantity,total_added) VALUES(bag.id,p_variant,quantity,quantity)
  ON CONFLICT(cart_id,variant_id) DO UPDATE SET
   total_added=cart_items.total_added+GREATEST(0,excluded.quantity-cart_items.quantity),quantity=excluded.quantity;
 END IF;
 UPDATE carts SET version=version+1 WHERE id=bag.id;
 INSERT INTO cart_operations(cart_id,operation_id,request_hash,result_version) VALUES(bag.id,p_operation,p_fingerprint,bag.version+1);
 RETURN cart_snapshot(bag.id);
END $$;

CREATE FUNCTION clear_owned_cart(p_user uuid,p_guest text,p_cart uuid,p_version integer)
RETURNS jsonb LANGUAGE plpgsql SET lock_timeout='3s' AS $$
DECLARE bag carts%ROWTYPE;
BEGIN
 SELECT * INTO bag FROM carts WHERE id=p_cart AND (
  (p_user IS NOT NULL AND user_id=p_user) OR
  (p_user IS NULL AND user_id IS NULL AND guest_hash=p_guest)
 ) FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'CART_OWNER_CHANGED'; END IF;
 IF bag.state<>'active' OR (p_user IS NULL AND bag.expires_at<=now()) THEN RAISE EXCEPTION 'CART_INACTIVE'; END IF;
 IF p_version<>bag.version THEN RAISE EXCEPTION 'CART_VERSION'; END IF;
 DELETE FROM cart_items WHERE cart_id=bag.id;
 UPDATE carts SET version=version+1,expires_at=CASE WHEN p_user IS NOT NULL THEN now()+interval '30 days' ELSE expires_at END WHERE id=bag.id;
 RETURN cart_snapshot(bag.id);
END $$;
