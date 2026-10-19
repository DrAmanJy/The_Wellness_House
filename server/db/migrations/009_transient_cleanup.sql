CREATE INDEX rate_limit_expiry ON rate_limit_buckets(expires_at);
CREATE INDEX oauth_transaction_expiry ON oauth_transactions(expires_at);
CREATE INDEX staff_challenge_expiry ON staff_challenges(expires_at);
ALTER TABLE oauth_transactions ADD COLUMN source_session_id uuid REFERENCES sessions(id);
