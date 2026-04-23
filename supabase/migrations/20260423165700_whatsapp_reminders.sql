CREATE TABLE IF NOT EXISTS whatsapp_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE UNIQUE,
  balance_paise INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'topup' | 'debit'
  amount_paise INTEGER NOT NULL,
  description TEXT, -- e.g. "Reminder sent · Rahul Sharma"
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gyms ADD COLUMN IF NOT EXISTS whatsapp_reminder_mode TEXT 
  DEFAULT 'manual' CHECK (whatsapp_reminder_mode IN ('manual', 'auto'));

ALTER TABLE gyms ADD COLUMN IF NOT EXISTS whatsapp_phone_number TEXT;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS whatsapp_api_key TEXT; -- This will be encrypted

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS reminder_5_sent_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS reminder_3_sent_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS reminder_1_sent_at TIMESTAMPTZ;

-- Update View to include reminder timestamps
CREATE OR REPLACE VIEW v_member_status AS
SELECT
  m.id,
  m.gym_id,
  m.full_name,
  m.phone,
  m.email,
  m.joining_date,
  m.is_frozen,
  m.notes,
  s.id as subscription_id,
  s.start_date,
  s.end_date,
  s.reminder_5_sent_at,
  s.reminder_3_sent_at,
  s.reminder_1_sent_at,
  p.name as plan_name,
  p.price as plan_price,
  COALESCE(SUM(DISTINCT inv.amount),0) as total_invoiced,
  COALESCE(SUM(DISTINCT pay.amount),0) as total_paid,
  COALESCE(SUM(DISTINCT inv.amount),0) - COALESCE(SUM(DISTINCT pay.amount),0) as balance_due,
  (s.end_date - current_date) as days_until_expiry,
  CASE
    WHEN s.id IS NULL THEN 'no_plan'
    WHEN m.is_frozen THEN 'frozen'
    WHEN (current_date - s.end_date) > 30 THEN 'lapsed'
    WHEN s.end_date < current_date THEN 'expired'
    WHEN (s.end_date - current_date) <= 5 THEN 'expiring_soon'
    ELSE 'active'
  END as status
FROM members m
LEFT JOIN subscriptions s ON s.id = (
  SELECT id FROM subscriptions WHERE member_id = m.id ORDER BY end_date DESC LIMIT 1
)
LEFT JOIN plans p ON p.id = s.plan_id
LEFT JOIN invoices inv ON inv.member_id = m.id
LEFT JOIN payments pay ON pay.member_id = m.id
GROUP BY
  m.id, m.gym_id, m.full_name, m.phone, m.email, m.joining_date, m.is_frozen, m.notes,
  s.id, s.start_date, s.end_date, s.reminder_5_sent_at, s.reminder_3_sent_at, s.reminder_1_sent_at, p.name, p.price;

-- RPC for deducting credits and logging transaction
CREATE OR REPLACE FUNCTION deduct_whatsapp_credits(
  p_gym_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_member_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Deduct from balance
  UPDATE whatsapp_credits 
  SET balance_paise = balance_paise - p_amount,
      updated_at = NOW()
  WHERE gym_id = p_gym_id;

  -- Insert transaction
  INSERT INTO whatsapp_credit_transactions (gym_id, type, amount_paise, description, member_id)
  VALUES (p_gym_id, 'debit', p_amount, p_description, p_member_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC for adding credits (Top-up)
CREATE OR REPLACE FUNCTION add_whatsapp_credits(
  p_gym_id UUID,
  p_amount INTEGER,
  p_order_id TEXT,
  p_payment_id TEXT,
  p_description TEXT
) RETURNS VOID AS $$
BEGIN
  -- Upsert balance
  INSERT INTO whatsapp_credits (gym_id, balance_paise)
  VALUES (p_gym_id, p_amount)
  ON CONFLICT (gym_id) DO UPDATE
  SET balance_paise = whatsapp_credits.balance_paise + p_amount,
      updated_at = NOW();

  -- Insert transaction
  INSERT INTO whatsapp_credit_transactions (gym_id, type, amount_paise, description, razorpay_order_id, razorpay_payment_id)
  VALUES (p_gym_id, 'topup', p_amount, p_description, p_order_id, p_payment_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE INDEX IF NOT EXISTS idx_whatsapp_credits_gym 
  ON whatsapp_credits(gym_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_txns_gym 
  ON whatsapp_credit_transactions(gym_id, created_at DESC);

-- Enable RLS
ALTER TABLE whatsapp_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for whatsapp_credits
CREATE POLICY "Gym owner can view their credits"
  ON whatsapp_credits FOR SELECT TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- Policies for whatsapp_credit_transactions
CREATE POLICY "Gym owner can view their transactions"
  ON whatsapp_credit_transactions FOR SELECT TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));
