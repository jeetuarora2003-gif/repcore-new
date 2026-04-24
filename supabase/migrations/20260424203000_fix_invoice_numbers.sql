/*
  FIX: Invoice/Receipt number generation was using count(*) which breaks
  when previous transactions fail and leave gaps. Now uses MAX of the 
  numeric suffix to always get the next available number.
  
  Run this ENTIRE script in the Supabase SQL Editor.
*/

-- Drop old functions
DROP FUNCTION IF EXISTS create_membership_sale(uuid, text, text, text, text, text, text, uuid, date, date, numeric, numeric, text);
DROP FUNCTION IF EXISTS add_subscription_with_invoice(uuid, uuid, uuid, date, date, numeric);
DROP FUNCTION IF EXISTS record_payment_with_receipt(uuid, uuid, uuid, numeric, text, text);

-- ============================================================
-- FIXED: create_membership_sale - uses MAX instead of COUNT
-- ============================================================
CREATE FUNCTION create_membership_sale(
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
  -- Lock the gym row for sequential number generation
  SELECT invoice_prefix, receipt_prefix
  INTO v_gym_inv_prefix, v_gym_rcp_prefix
  FROM gyms
  WHERE id = p_gym_id
  FOR UPDATE;

  -- Insert Member
  INSERT INTO members (gym_id, full_name, phone, email, photo_url, notes, joining_date)
  VALUES (p_gym_id, p_full_name, p_phone, p_email, p_photo_url, p_notes, v_today_ist)
  RETURNING id INTO v_member_id;

  -- Insert Subscription
  INSERT INTO subscriptions (gym_id, member_id, plan_id, start_date, end_date)
  VALUES (p_gym_id, v_member_id, p_plan_id, p_start_date, p_end_date)
  RETURNING id INTO v_sub_id;

  -- Generate Invoice Number using MAX of existing suffix (not count)
  SELECT COALESCE(MAX(
    NULLIF(regexp_replace(invoice_number, '^.*-(\d+)$', '\1'), invoice_number)::int
  ), 0) + 1
  INTO v_inv_seq
  FROM invoices WHERE gym_id = p_gym_id;

  v_inv_num := v_gym_inv_prefix || '-' || v_year || '-' || lpad(v_inv_seq::text, 4, '0');

  INSERT INTO invoices (gym_id, member_id, subscription_id, invoice_number, amount)
  VALUES (p_gym_id, v_member_id, v_sub_id, v_inv_num, p_plan_fee)
  RETURNING id INTO v_inv_id;

  -- Generate Receipt & Insert Payment (if any amount was paid)
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

-- ============================================================
-- FIXED: add_subscription_with_invoice
-- ============================================================
CREATE FUNCTION add_subscription_with_invoice(
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

-- ============================================================
-- FIXED: record_payment_with_receipt
-- ============================================================
CREATE FUNCTION record_payment_with_receipt(
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
