/*
  # RepCore Gym Management Schema

  ## Tables Created
  1. gyms — Gym profile owned by a user
  2. members — Gym members
  3. plans — Membership plans offered by the gym
  4. subscriptions — Member plan subscriptions
  5. invoices — Invoices linked to subscriptions
  6. payments — Payment receipts linked to invoices
  7. attendance — Check-in records
  8. reminders — WhatsApp reminder records

  ## Views Created
  - v_member_status — Aggregated member status with subscription, billing totals, and expiry info

  ## Security
  - RLS enabled on all tables
  - Each table has 4 policies (SELECT/INSERT/UPDATE/DELETE)
  - All policies check gym ownership via auth.uid()
*/

-- GYMS
CREATE TABLE IF NOT EXISTS gyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT '',
  address text DEFAULT '',
  phone text DEFAULT '',
  logo_url text DEFAULT '',
  whatsapp_api_key text DEFAULT '',
  whatsapp_credits int DEFAULT 0,
  receipt_prefix text DEFAULT 'RCP',
  invoice_prefix text DEFAULT 'INV',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gym owner can select own gym"
  ON gyms FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Gym owner can insert own gym"
  ON gyms FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Gym owner can update own gym"
  ON gyms FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Gym owner can delete own gym"
  ON gyms FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- MEMBERS
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  joining_date date DEFAULT CURRENT_DATE,
  photo_url text DEFAULT '',
  notes text DEFAULT '',
  is_frozen bool DEFAULT false,
  frozen_since date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members select via gym ownership"
  ON members FOR SELECT TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Members insert via gym ownership"
  ON members FOR INSERT TO authenticated
  WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Members update via gym ownership"
  ON members FOR UPDATE TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
  WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Members delete via gym ownership"
  ON members FOR DELETE TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- PLANS
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT '',
  duration_days int NOT NULL DEFAULT 30,
  price numeric NOT NULL DEFAULT 0,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans select via gym ownership"
  ON plans FOR SELECT TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Plans insert via gym ownership"
  ON plans FOR INSERT TO authenticated
  WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Plans update via gym ownership"
  ON plans FOR UPDATE TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
  WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Plans delete via gym ownership"
  ON plans FOR DELETE TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES plans(id) ON DELETE SET NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  frozen_days_used int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscriptions select via gym ownership"
  ON subscriptions FOR SELECT TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Subscriptions insert via gym ownership"
  ON subscriptions FOR INSERT TO authenticated
  WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Subscriptions update via gym ownership"
  ON subscriptions FOR UPDATE TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
  WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Subscriptions delete via gym ownership"
  ON subscriptions FOR DELETE TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  invoice_number text UNIQUE NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invoices select via gym ownership"
  ON invoices FOR SELECT TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Invoices insert via gym ownership"
  ON invoices FOR INSERT TO authenticated
  WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Invoices update via gym ownership"
  ON invoices FOR UPDATE TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
  WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Invoices delete via gym ownership"
  ON invoices FOR DELETE TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  receipt_number text UNIQUE NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'cash',
  notes text DEFAULT '',
  paid_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payments select via gym ownership"
  ON payments FOR SELECT TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Payments insert via gym ownership"
  ON payments FOR INSERT TO authenticated
  WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Payments update via gym ownership"
  ON payments FOR UPDATE TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
  WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Payments delete via gym ownership"
  ON payments FOR DELETE TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  checked_in_at timestamptz DEFAULT now()
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendance select via gym ownership"
  ON attendance FOR SELECT TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Attendance insert via gym ownership"
  ON attendance FOR INSERT TO authenticated
  WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Attendance update via gym ownership"
  ON attendance FOR UPDATE TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
  WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Attendance delete via gym ownership"
  ON attendance FOR DELETE TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- REMINDERS
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  stage int NOT NULL DEFAULT 1,
  sent_at timestamptz DEFAULT now(),
  method text DEFAULT 'manual_whatsapp'
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reminders select via gym ownership"
  ON reminders FOR SELECT TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Reminders insert via gym ownership"
  ON reminders FOR INSERT TO authenticated
  WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Reminders update via gym ownership"
  ON reminders FOR UPDATE TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()))
  WITH CHECK (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Reminders delete via gym ownership"
  ON reminders FOR DELETE TO authenticated
  USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_members_gym_id ON members(gym_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_member_id ON subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_gym_id ON subscriptions(gym_id);
CREATE INDEX IF NOT EXISTS idx_invoices_member_id ON invoices(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_gym_id ON attendance(gym_id);

-- VIEW: v_member_status
CREATE OR REPLACE VIEW v_member_status AS
SELECT
  m.id,
  m.gym_id,
  m.full_name,
  m.phone,
  m.email,
  m.joining_date,
  m.is_frozen,
  m.photo_url,
  m.notes,
  s.id as subscription_id,
  s.start_date,
  s.end_date,
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
  s.id, s.start_date, s.end_date, p.name, p.price;
