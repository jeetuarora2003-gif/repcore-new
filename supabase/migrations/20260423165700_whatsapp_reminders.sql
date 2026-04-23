-- WhatsApp Reminders Schema (Self-Managed Mode)

-- 1. Add mode and config columns to gyms
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS whatsapp_reminder_mode TEXT 
  DEFAULT 'manual' CHECK (whatsapp_reminder_mode IN ('manual', 'auto'));

ALTER TABLE gyms ADD COLUMN IF NOT EXISTS whatsapp_phone_number TEXT;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS whatsapp_api_key TEXT; -- This will be encrypted

-- 2. Add reminder tracking columns to subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS reminder_5_sent_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS reminder_3_sent_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS reminder_1_sent_at TIMESTAMPTZ;

-- 3. Update View to include reminder timestamps
DROP VIEW IF EXISTS v_member_status;
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
