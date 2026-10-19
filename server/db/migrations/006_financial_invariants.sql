CREATE FUNCTION protect_order_snapshot() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF ROW(NEW.user_id,NEW.checkout_id,NEW.public_reference,NEW.email_snapshot,NEW.shipping_address,NEW.billing_address,NEW.currency,NEW.subtotal_minor,NEW.shipping_minor,NEW.tax_minor,NEW.total_minor,NEW.created_at)
 IS DISTINCT FROM ROW(OLD.user_id,OLD.checkout_id,OLD.public_reference,OLD.email_snapshot,OLD.shipping_address,OLD.billing_address,OLD.currency,OLD.subtotal_minor,OLD.shipping_minor,OLD.tax_minor,OLD.total_minor,OLD.created_at)
 THEN RAISE EXCEPTION 'Order snapshots are immutable'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER immutable_order_snapshot BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION protect_order_snapshot();
ALTER TABLE refunds ALTER COLUMN provider_payment_id SET NOT NULL;
CREATE FUNCTION bound_refund_total() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE captured bigint; committed bigint;
BEGIN
 SELECT amount_minor INTO captured FROM payment_captures WHERE provider_payment_id=NEW.provider_payment_id AND payment_id=NEW.payment_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Captured payment required'; END IF;
 SELECT coalesce(sum(amount_minor),0) INTO committed FROM refunds WHERE provider_payment_id=NEW.provider_payment_id AND id<>NEW.id;
 IF NEW.amount_minor+committed>captured THEN RAISE EXCEPTION 'Refund exceeds captured amount'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER refund_bound BEFORE INSERT ON refunds FOR EACH ROW EXECUTE FUNCTION bound_refund_total();
