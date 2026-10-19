ALTER TABLE cart_items ADD COLUMN line_id uuid NOT NULL DEFAULT gen_random_uuid(),ADD COLUMN total_added bigint NOT NULL DEFAULT 0;
UPDATE cart_items SET total_added=quantity;
