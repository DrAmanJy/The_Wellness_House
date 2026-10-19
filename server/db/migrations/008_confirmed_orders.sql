-- Internal provisional records retain immutable snapshots and reservations.
-- Customer orders become visible only after an independently verified capture.
ALTER TABLE orders ADD COLUMN confirmed_at timestamptz;
ALTER TABLE payments ADD COLUMN gateway_status text NOT NULL DEFAULT 'created' CHECK(gateway_status IN ('created','authorized','captured','failed'));
UPDATE orders o SET confirmed_at=coalesce(o.cart_consumed_at,o.created_at)
WHERE o.cart_consumed_at IS NOT NULL AND EXISTS (
 SELECT 1 FROM payments p JOIN payment_captures c ON c.payment_id=p.id
 WHERE p.order_id=o.id AND c.amount_minor=o.total_minor AND c.currency=o.currency
);
CREATE INDEX orders_confirmed_customer ON orders(user_id,id) WHERE confirmed_at IS NOT NULL;
ALTER TABLE checkout_sessions DROP CONSTRAINT checkout_sessions_state_check;
ALTER TABLE checkout_sessions ADD CHECK(state IN ('open','ordered','completed'));
UPDATE checkout_sessions c SET state='completed' WHERE EXISTS(SELECT 1 FROM orders o WHERE o.checkout_id=c.id AND o.confirmed_at IS NOT NULL);
CREATE FUNCTION protect_order_confirmation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='UPDATE' AND OLD.confirmed_at IS NOT NULL AND NEW.confirmed_at IS DISTINCT FROM OLD.confirmed_at THEN
  RAISE EXCEPTION 'Order confirmation is immutable';
 END IF;
 IF (TG_OP='INSERT' OR OLD.confirmed_at IS NULL) AND NEW.confirmed_at IS NOT NULL THEN
  IF NEW.payment_status<>'paid' OR NOT EXISTS (
   SELECT 1 FROM payments p JOIN payment_captures c ON c.payment_id=p.id
   WHERE p.order_id=NEW.id AND c.amount_minor=NEW.total_minor AND c.currency=NEW.currency
  ) THEN RAISE EXCEPTION 'Verified capture required for order confirmation'; END IF;
 END IF;
 IF NEW.payment_status='paid' AND NEW.confirmed_at IS NULL THEN
  RAISE EXCEPTION 'Paid order requires confirmation';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER verified_order_confirmation BEFORE INSERT OR UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION protect_order_confirmation();
