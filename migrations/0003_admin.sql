-- Discount codes applied at Pro checkout.
CREATE TABLE offers (
  code TEXT PRIMARY KEY,                   -- stored uppercase
  kind TEXT NOT NULL,                      -- 'percent' | 'flat'
  value INTEGER NOT NULL,                  -- percent 1-100, or paise off
  active INTEGER NOT NULL DEFAULT 1,
  expires_at INTEGER,
  max_redemptions INTEGER,                 -- null = unlimited
  times_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- What a payment actually charged, and why.
ALTER TABLE payments ADD COLUMN offer_code TEXT;
ALTER TABLE payments ADD COLUMN discount_paise INTEGER NOT NULL DEFAULT 0;

-- Contact-form enquiries. user_id is null when the sender wasn't logged in.
CREATE TABLE support_enquiries (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',     -- open | resolved
  admin_note TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  resolved_at INTEGER
);
CREATE INDEX idx_enquiries_status ON support_enquiries(status, created_at DESC);
