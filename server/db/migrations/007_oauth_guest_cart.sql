ALTER TABLE oauth_transactions ADD COLUMN guest_cart_id uuid REFERENCES carts(id);
