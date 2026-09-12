/*
  SECURITY FIX

  1. v_member_status was recreated several times after the original
     `security_invoker = true` fix (20260424000000_audit_fixes.sql) without
     repeating that option - CREATE OR REPLACE VIEW / DROP+CREATE VIEW do NOT
     carry options forward, so every rewrite silently re-enabled the RLS
     bypass. Views without security_invoker run with the view OWNER's
     privileges against the underlying tables, not the querying role's, so
     RLS on members/subscriptions/invoices/payments was not being enforced
     through this view at all. Combined with `GRANT SELECT ... TO anon`,
     this meant any unauthenticated request with the public anon key could
     read every gym's members, phone numbers, emails and balances.

  2. create_membership_sale / add_subscription_with_invoice /
     record_payment_with_receipt / get_dashboard_stats are SECURITY DEFINER
     functions that trusted the p_gym_id argument with no check that the
     calling user actually owns that gym. Postgres grants EXECUTE on new
     functions to PUBLIC by default, so any authenticated (and, since it was
     never revoked, effectively any) caller could pass an arbitrary
     p_gym_id and read another gym's dashboard stats or insert fake
     members/subscriptions/payments into another gym's records.

  This migration re-applies security_invoker on the view, restricts it to
  authenticated users only, and adds an ownership check to every RPC that
  takes p_gym_id. All real callers (see app/actions/*.ts, app/(app)/dues,
  app/api/dashboard) already use the user-session client, so auth.uid()
  correctly resolves in every legitimate call path - this only blocks
  callers passing a p_gym_id they don't own.
*/

-- ============================================================
-- 1. Re-secure v_member_status
-- ============================================================
DROP VIEW IF EXISTS v_member_status CASCADE;

CREATE VIEW v_member_status
WITH (security_invoker = true) AS
WITH
  today_ist AS (
    SELECT (timezone('Asia/Kolkata', now()))::date AS d
  ),
  member_subs AS (
    SELECT DISTINCT ON (member_id)
      id, member_id, start_date, end_date, plan_id
    FROM subscriptions
    ORDER BY member_id, end_date DESC
  ),
  member_invoices AS (
    SELECT member_id, SUM(amount) AS total_invoiced
    FROM invoices
    GROUP BY member_id
  ),
  member_payments AS (
    SELECT member_id, SUM(amount) AS total_paid
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
  s.id   AS subscription_id,
  s.start_date,
  s.end_date,
  s.plan_id,
  s.reminder_5_sent_at,
  s.reminder_3_sent_at,
  s.reminder_1_sent_at,
  p.name AS plan_name,
  p.duration_days,
  p.price AS plan_price,
  COALESCE(inv.total_invoiced, 0) AS total_invoiced,
  COALESCE(pay.total_paid, 0)     AS total_paid,
  (COALESCE(inv.total_invoiced, 0) - COALESCE(pay.total_paid, 0)) AS balance_due,
  (s.end_date - t.d)              AS days_until_expiry,
  CASE
    WHEN s.end_date IS NULL                       THEN 'no_plan'
    WHEN m.is_frozen                              THEN 'frozen'
    WHEN (s.end_date - t.d) < 0 AND (t.d - s.end_date) > 30 THEN 'lapsed'
    WHEN (s.end_date - t.d) < 0                   THEN 'expired'
    WHEN (s.end_date - t.d) <= 5                   THEN 'expiring_soon'
    ELSE 'active'
  END AS status
FROM members m
CROSS JOIN today_ist t
LEFT JOIN member_subs s    ON s.member_id = m.id
LEFT JOIN plans p          ON p.id = s.plan_id
LEFT JOIN member_invoices inv ON inv.member_id = m.id
LEFT JOIN member_payments pay ON pay.member_id = m.id;

REVOKE ALL ON v_member_status FROM PUBLIC;
REVOKE ALL ON v_member_status FROM anon;
GRANT SELECT ON v_member_status TO authenticated, service_role;

-- ============================================================
-- 2. Ownership checks on SECURITY DEFINER RPCs
-- ============================================================
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
  v_inv_seq int;
  v_rcp_seq int;
  v_inv_num text;
  v_rcp_num text;
  v_today_ist date := timezone('Asia/Kolkata', now())::date;
  v_year int := extract(year from timezone('Asia/Kolkata', now()));
BEGIN
  IF NOT EXISTS (SELECT 1 FROM gyms WHERE id = p_gym_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized for this gym';
  END IF;

  SELECT invoice_prefix, receipt_prefix
  INTO v_gym_inv_prefix, v_gym_rcp_prefix
  FROM gyms
  WHERE id = p_gym_id
  FOR UPDATE;

  INSERT INTO members (gym_id, full_name, phone, email, photo_url, notes, joining_date, device_enrollment_id)
  VALUES (p_gym_id, p_full_name, p_phone, p_email, p_photo_url, p_notes, v_today_ist, p_device_id)
  RETURNING id INTO v_member_id;

  INSERT INTO subscriptions (gym_id, member_id, plan_id, start_date, end_date)
  VALUES (p_gym_id, v_member_id, p_plan_id, p_start_date, p_end_date)
  RETURNING id INTO v_sub_id;

  SELECT COALESCE(MAX(
    NULLIF(regexp_replace(invoice_number, '^.*-(\d+)$', '\1'), invoice_number)::int
  ), 0) + 1
  INTO v_inv_seq
  FROM invoices WHERE gym_id = p_gym_id;

  v_inv_num := v_gym_inv_prefix || '-' || v_year || '-' || lpad(v_inv_seq::text, 4, '0');

  INSERT INTO invoices (gym_id, member_id, subscription_id, invoice_number, amount)
  VALUES (p_gym_id, v_member_id, v_sub_id, v_inv_num, p_plan_fee)
  RETURNING id INTO v_inv_id;

  IF p_amount_paid > 0 THEN
    SELECT COALESCE(MAX(
      NULLIF(regexp_replace(receipt_number, '^.*-(\d+)$', '\1'), receipt_number)::int
    ), 0) + 1
    INTO v_rcp_seq
    FROM payments WHERE gym_id = p_gym_id;

    v_rcp_num := v_gym_rcp_prefix || '-' || v_year || '-' || lpad(v_rcp_seq::text, 4, '0');

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
  v_inv_seq int;
  v_inv_num text;
  v_year int := extract(year from timezone('Asia/Kolkata', now()));
BEGIN
  IF NOT EXISTS (SELECT 1 FROM gyms WHERE id = p_gym_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized for this gym';
  END IF;

  SELECT invoice_prefix INTO v_gym_inv_prefix FROM gyms WHERE id = p_gym_id FOR UPDATE;

  UPDATE subscriptions
  SET end_date = (p_start_date - 1)
  WHERE gym_id = p_gym_id
    AND member_id = p_member_id
    AND start_date < p_start_date
    AND end_date >= p_start_date;

  INSERT INTO subscriptions (gym_id, member_id, plan_id, start_date, end_date)
  VALUES (p_gym_id, p_member_id, p_plan_id, p_start_date, p_end_date)
  RETURNING id INTO v_sub_id;

  SELECT COALESCE(MAX(
    NULLIF(regexp_replace(invoice_number, '^.*-(\d+)$', '\1'), invoice_number)::int
  ), 0) + 1
  INTO v_inv_seq
  FROM invoices WHERE gym_id = p_gym_id;

  v_inv_num := v_gym_inv_prefix || '-' || v_year || '-' || lpad(v_inv_seq::text, 4, '0');

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
  v_rcp_seq int;
  v_rcp_num text;
  v_year int := extract(year from timezone('Asia/Kolkata', now()));
BEGIN
  IF NOT EXISTS (SELECT 1 FROM gyms WHERE id = p_gym_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized for this gym';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be greater than zero';
  END IF;

  SELECT receipt_prefix INTO v_gym_rcp_prefix FROM gyms WHERE id = p_gym_id FOR UPDATE;

  SELECT COALESCE(MAX(
    NULLIF(regexp_replace(receipt_number, '^.*-(\d+)$', '\1'), receipt_number)::int
  ), 0) + 1
  INTO v_rcp_seq
  FROM payments WHERE gym_id = p_gym_id;

  v_rcp_num := v_gym_rcp_prefix || '-' || v_year || '-' || lpad(v_rcp_seq::text, 4, '0');

  INSERT INTO payments (gym_id, member_id, invoice_id, receipt_number, amount, payment_method, notes)
  VALUES (p_gym_id, p_member_id, p_invoice_id, v_rcp_num, p_amount, p_payment_method, p_notes)
  RETURNING id INTO v_payment_id;

  RETURN jsonb_build_object(
    'payment_id', v_payment_id,
    'receipt_number', v_rcp_num
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_dashboard_stats(p_gym_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_total_members bigint;
  v_active_members bigint;
  v_expiring_members bigint;
  v_total_dues numeric;
  v_new_members bigint;
  v_today_revenue numeric;
  v_today_ist date := timezone('Asia/Kolkata', now())::date;
  v_month_start date := date_trunc('month', timezone('Asia/Kolkata', now()))::date;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM gyms WHERE id = p_gym_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized for this gym';
  END IF;

  SELECT count(*) INTO v_total_members FROM members WHERE gym_id = p_gym_id;

  SELECT count(*) INTO v_new_members FROM members
  WHERE gym_id = p_gym_id AND joining_date >= v_month_start AND joining_date <= v_today_ist;

  SELECT
    count(*) FILTER (WHERE status IN ('active', 'expiring_soon')),
    count(*) FILTER (WHERE days_until_expiry BETWEEN 0 AND 7),
    COALESCE(sum(balance_due), 0)
  INTO v_active_members, v_expiring_members, v_total_dues
  FROM v_member_status WHERE gym_id = p_gym_id;

  SELECT COALESCE(sum(amount), 0) INTO v_today_revenue
  FROM payments
  WHERE gym_id = p_gym_id AND (paid_at AT TIME ZONE 'Asia/Kolkata')::date = v_today_ist;

  RETURN jsonb_build_object(
    'total', v_total_members,
    'active', v_active_members,
    'expiring', v_expiring_members,
    'dues', v_total_dues,
    'new_this_month', v_new_members,
    'today_revenue', v_today_revenue
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- clean_old_attendance() has no p_gym_id (it sweeps all gyms by design) and
-- is only ever invoked server-side via the service-role cron - restrict it
-- so no authenticated end user can trigger a mass delete directly.
REVOKE ALL ON FUNCTION clean_old_attendance() FROM PUBLIC;
REVOKE ALL ON FUNCTION clean_old_attendance() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION clean_old_attendance() TO service_role;

REVOKE ALL ON FUNCTION create_membership_sale(uuid, text, text, text, text, text, text, uuid, date, date, numeric, numeric, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION add_subscription_with_invoice(uuid, uuid, uuid, date, date, numeric) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION record_payment_with_receipt(uuid, uuid, uuid, numeric, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION get_dashboard_stats(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION create_membership_sale(uuid, text, text, text, text, text, text, uuid, date, date, numeric, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION add_subscription_with_invoice(uuid, uuid, uuid, date, date, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION record_payment_with_receipt(uuid, uuid, uuid, numeric, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats(uuid) TO authenticated;
