CREATE TABLE payment_captures(provider_payment_id text PRIMARY KEY,payment_id uuid NOT NULL REFERENCES payments(id),amount_minor bigint NOT NULL CHECK(amount_minor>0),currency text NOT NULL CHECK(currency='INR'),created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE refunds ADD COLUMN provider_payment_id text REFERENCES payment_captures(provider_payment_id);
