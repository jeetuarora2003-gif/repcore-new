/*
  Audit Fix Migration

  Fixes:
  - C1/C6: Authoritative v_member_status with pre-aggregated totals, IST date math,
    reminder fields, and credit handling
  - C3/C4/H3: Atomic membership sale, renewal, and payment RPCs
  - H1: Unique member phone per gym
  - H2: Unique attendance per IST day
  - P1: Add attendance index for recent check-in queries
*/

-- ============================================================
-- Authoritative RPCs for billing and dashboard
-- ============================================================
DROP FUNCTION IF EXISTS create_membership_sale(uuid, text, text, text, text, text, text, uuid, date, date, numeric, numeric, text);
DROP FUNCTION IF EXISTS add_subscription_with_invoice(uuid, uuid, uuid, date, date, numeric);
DROP FUNCTION IF EXISTS record_payment_with_receipt(uuid, uuid, uuid, numeric, text, text);
DROP FUNCTION IF EXISTS get_dashboard_stats(uuid);

CREATE OR REPLACE FUNCTION create_membership_sale(
  p_gym_id uuid,
  p_full_name text,
  p_phone text,
  p_email text,
  p_photo_url text,
  p_notes text,
  p_device_id text,
  p_plan_id uuid,
  p_start_date date,
  p_end_date date,
  p_plan_fee numeric,
  p_amount_paid numeric,
  p_payment_method text
) RETURNS jsonb AS $$
DECLARE
  v_member_id uuid;
  v_sub_id uuid;
  v_inv_id uuid;
  v_payment_id uuid;
  v_gym_inv_prefix text;
  v_gym_rcp_prefix text;
  v_inv_count int;
  v_rcp_count int;
  v_inv_num text;
  v_rcp_num text;
  v_today_ist date := timezone('Asia/Kolkata', now())::date;
  v_year int := extract(year from timezone('Asia/Kolkata', now()));
BEGIN
  SELECT invoice_prefix, receipt_prefix
  INTO v_gym_inv_prefix, v_gym_rcp_prefix
  FROM gyms
  WHERE id = p_gym_id
  FOR UPDATE;

  INSERT INTO members (gym_id, full_name, phone, email, photo_url, notes, joining_date)
  VALUES (p_gym_id, p_full_name, p_phone, p_email, p_photo_url, p_notes, v_today_ist)
  RETURNING id INTO v_member_id;

  INSERT INTO subscriptions (gym_id, member_id, plan_id, start_date, end_date)
  VALUES (p_gym_id, v_member_id, p_plan_id, p_start_date, p_end_date)
  RETURNING id INTO v_sub_id;

  SELECT count(*) INTO v_inv_count FROM invoices WHERE gym_id = p_gym_id;
  v_inv_num := v_gym_inv_prefix || '-' || v_year || '-' || lpad((v_inv_count + 1)::text, 4, '0');

  INSERT INTO invoices (gym_id, member_id, subscription_id, invoice_number, amount)
  VALUES (p_gym_id, v_member_id, v_sub_id, v_inv_num, p_plan_fee)
  RETURNING id INTO v_inv_id;

  IF p_amount_paid > 0 THEN
    SELECT count(*) INTO v_rcp_count FROM payments WHERE gym_id = p_gym_id;
    v_rcp_num := v_gym_rcp_prefix || '-' || v_year || '-' || lpad((v_rcp_count + 1)::text, 4, '0');

    INSERT INTO payments (gym_id, member_id, invoice_id, receipt_number, amount, payment_method)
    VALUES (p_gym_id, v_member_id, v_inv_id, v_rcp_num, p_amount_paid, p_payment_method)
    RETURNING id INTO v_payment_id;
  END IF;

  RETURN jsonb_build_object(
    'member_id', v_member_id,
    'subscription_id', v_sub_id,
    'invoice_id', v_inv_id,
    'payment_id', v_payment_id,
    'invoice_number', v_inv_num,
    'receipt_number', v_rcp_num
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_subscription_with_invoice(
  p_gym_id uuid,
  p_member_id uuid,
  p_plan_id uuid,
  p_start_date date,
  p_end_date date,
  p_plan_price numeric
) RETURNS jsonb AS $$
DECLARE
  v_sub_id uuid;
  v_inv_id uuid;
  v_gym_inv_prefix text;
  v_inv_count int;
  v_inv_num text;
  v_year int := extract(year from timezone('Asia/Kolkata', now()));
BEGIN
  SELECT invoice_prefix
  INTO v_gym_inv_prefix
  FROM gyms
  WHERE id = p_gym_id
  FOR UPDATE;

  UPDATE subscriptions
  SET end_date = (p_start_date - 1)
  WHERE gym_id = p_gym_id
    AND member_id = p_member_id
    AND start_date < p_start_date
    AND end_date >= p_start_date;

  INSERT INTO subscriptions (gym_id, member_id, plan_id, start_date, end_date)
  VALUES (p_gym_id, p_member_id, p_plan_id, p_start_date, p_end_date)
  RETURNING id INTO v_sub_id;

  SELECT count(*) INTO v_inv_count FROM invoices WHERE gym_id = p_gym_id;
  v_inv_num := v_gym_inv_prefix || '-' || v_year || '-' || lpad((v_inv_count + 1)::text, 4, '0');

  INSERT INTO invoices (gym_id, member_id, subscription_id, invoice_number, amount)
  VALUES (p_gym_id, p_member_id, v_sub_id, v_inv_num, p_plan_price)
  RETURNING id INTO v_inv_id;

  RETURN jsonb_build_object(
    'subscription_id', v_sub_id,
    'invoice_id', v_inv_id,
    'invoice_number', v_inv_num
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION record_payment_with_receipt(
  p_gym_id uuid,
  p_member_id uuid,
  p_invoice_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_notes text DEFAULT ''
) RETURNS jsonb AS $$
DECLARE
  v_payment_id uuid;
  v_gym_rcp_prefix text;
  v_rcp_count int;
  v_rcp_num text;
  v_year int := extract(year from timezone('Asia/Kolkata', now()));
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be greater than zero';
  END IF;

  SELECT receipt_prefix
  INTO v_gym_rcp_prefix
  FROM gyms
  WHERE id = p_gym_id
  FOR UPDATE;

  SELECT count(*) INTO v_rcp_count FROM payments WHERE gym_id = p_gym_id;
  v_rcp_num := v_gym_rcp_prefix || '-' || v_year || '-' || lpad((v_rcp_count + 1)::text, 4, '0');

  INSERT INTO payments (gym_id, member_id, invoice_id, receipt_number, amount, payment_method, notes)
  VALUES (p_gym_id, p_member_id, p_invoice_id, v_rcp_num, p_amount, p_payment_method, p_notes)
  RETURNING id INTO v_payment_id;

  RETURN jsonb_build_object(
    'payment_id', v_payment_id,
    'receipt_number', v_rcp_num
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Authoritative member status view
-- ============================================================
DROP VIEW IF EXISTS v_member_status CASCADE;

CREATE OR REPLACE VIEW v_member_status 
WITH (security_invoker = true)
AS
WITH ist_today AS (
  SELECT timezone('Asia/Kolkata', now())::date AS today
),
member_subs AS (
  SELECT DISTINCT ON (member_id)
    id,
    member_id,
    start_date,
    end_date,
    plan_id,
    reminder_5_sent_at,
    reminder_3_sent_at,
    reminder_1_sent_at
  FROM subscriptions
  ORDER BY member_id, end_date DESC, created_at DESC
),
member_invoices AS (
  SELECT member_id, COALESCE(sum(amount), 0) AS total_invoiced
  FROM invoices
  GROUP BY member_id
),
member_payments AS (
  SELECT member_id, COALESCE(sum(amount), 0) AS total_paid
  FROM payments
  GROUP BY member_id
)
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
  s.id AS subscription_id,
  s.start_date,
  s.end_date,
  s.plan_id,
  s.reminder_5_sent_at,
  s.reminder_3_sent_at,
  s.reminder_1_sent_at,
  p.name AS plan_name,
  p.duration_days,
  p.price AS plan_price,
  COALESCE(inv.total_invoiced, 0)::numeric AS total_invoiced,
  COALESCE(pay.total_paid, 0)::numeric AS total_paid,
  GREATEST(COALESCE(inv.total_invoiced, 0) - COALESCE(pay.total_paid, 0), 0)::numeric AS balance_due,
  GREATEST(COALESCE(pay.total_paid, 0) - COALESCE(inv.total_invoiced, 0), 0)::numeric AS credit_balance,
  CASE
    WHEN s.end_date IS NULL THEN NULL
    ELSE (s.end_date - ist_today.today)
  END AS days_until_expiry,
  CASE
    WHEN s.end_date IS NULL THEN 'no_plan'
    WHEN m.is_frozen THEN 'frozen'
    WHEN (s.end_date - ist_today.today) < 0 AND (ist_today.today - s.end_date) > 30 THEN 'lapsed'
    WHEN (s.end_date - ist_today.today) < 0 THEN 'expired'
    WHEN (s.end_date - ist_today.today) <= 5 THEN 'expiring_soon'
    ELSE 'active'
  END AS status
FROM members m
CROSS JOIN ist_today
LEFT JOIN member_subs s ON s.member_id = m.id
LEFT JOIN plans p ON p.id = s.plan_id
LEFT JOIN member_invoices inv ON inv.member_id = m.id
LEFT JOIN member_payments pay ON pay.member_id = m.id;

-- Ensure roles can access the new view
GRANT SELECT ON v_member_status TO authenticated;
GRANT SELECT ON v_member_status TO anon;
GRANT SELECT ON v_member_status TO service_role;

CREATE OR REPLACE FUNCTION get_dashboard_stats(p_gym_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_total_members bigint;
  v_active_members bigint;
  v_expiring_members bigint;
  v_total_dues numeric;
  v_new_members bigint;
  v_today_ist date := timezone('Asia/Kolkata', now())::date;
  v_month_start date := date_trunc('month', timezone('Asia/Kolkata', now()))::date;
BEGIN
  SELECT count(*)
  INTO v_total_members
  FROM members
  WHERE gym_id = p_gym_id;

  SELECT count(*)
  INTO v_new_members
  FROM members
  WHERE gym_id = p_gym_id
    AND joining_date >= v_month_start
    AND joining_date <= v_today_ist;

  SELECT
    count(*) FILTER (WHERE status IN ('active', 'expiring_soon')),
    count(*) FILTER (WHERE days_until_expiry BETWEEN 0 AND 7),
    COALESCE(sum(balance_due), 0)
  INTO
    v_active_members,
    v_expiring_members,
    v_total_dues
  FROM v_member_status
  WHERE gym_id = p_gym_id;

  RETURN jsonb_build_object(
    'total', v_total_members,
    'active', v_active_members,
    'expiring', v_expiring_members,
    'dues', v_total_dues,
    'new_this_month', v_new_members
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Data integrity constraints
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'members_gym_phone_unique'
  ) THEN
    DELETE FROM members a
    USING members b
    WHERE a.gym_id = b.gym_id
      AND a.phone = b.phone
      AND a.phone <> ''
      AND a.created_at < b.created_at;

    ALTER TABLE members
      ADD CONSTRAINT members_gym_phone_unique UNIQUE (gym_id, phone);
  END IF;
END $$;

DROP INDEX IF EXISTS idx_attendance_unique_daily;
DROP INDEX IF EXISTS idx_attendance_unique_daily_ist;

CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique_daily_ist
  ON attendance (member_id, ((timezone('Asia/Kolkata', checked_in_at))::date));

CREATE INDEX IF NOT EXISTS idx_attendance_gym_checked_in_at
  ON attendance (gym_id, checked_in_at DESC);
