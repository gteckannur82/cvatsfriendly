-- Cashfree replaces Stripe. Pro is sold as a one-time payment that grants a
-- fixed period, so there is no customer/subscription object to mirror — only
-- payment rows, reconciled against Cashfree.

CREATE TABLE payments (
  id TEXT PRIMARY KEY,                     -- our link_id, sent to Cashfree as link_id
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_paise INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created',  -- created | paid
  cf_link_id TEXT,
  created_at INTEGER NOT NULL,
  paid_at INTEGER
);
CREATE INDEX idx_payments_user ON payments(user_id, created_at DESC);

-- Cashfree requires a customer phone number on every payment link.
ALTER TABLE users ADD COLUMN phone TEXT;

DROP INDEX idx_users_stripe_customer;
ALTER TABLE users DROP COLUMN stripe_customer_id;
ALTER TABLE users DROP COLUMN stripe_subscription_id;
