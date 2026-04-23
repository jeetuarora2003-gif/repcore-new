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
  v_gym_inv_prefix text;
  v_gym_rcp_prefix text;
  v_inv_count int;
  v_rcp_count int;
  v_inv_num text;
  v_rcp_num text;
  v_year int := extract(year from current_date);
BEGIN
  -- 1. Lock the gym row to safely generate sequential invoice/receipt numbers
  SELECT invoice_prefix, receipt_prefix INTO v_gym_inv_prefix, v_gym_rcp_prefix
  FROM gyms WHERE id = p_gym_id FOR UPDATE;

  -- 2. Insert Member
  INSERT INTO members (gym_id, full_name, phone, email, photo_url, notes, joining_date)
  VALUES (p_gym_id, p_full_name, p_phone, p_email, p_photo_url, p_notes, current_date)
  RETURNING id INTO v_member_id;

  -- 3. Insert Subscription
  INSERT INTO subscriptions (gym_id, member_id, plan_id, start_date, end_date)
  VALUES (p_gym_id, v_member_id, p_plan_id, p_start_date, p_end_date)
  RETURNING id INTO v_sub_id;

  -- 4. Generate Invoice Number & Insert Invoice
  SELECT count(*) INTO v_inv_count FROM invoices WHERE gym_id = p_gym_id;
  v_inv_num := v_gym_inv_prefix || '-' || v_year || '-' || lpad((v_inv_count + 1)::text, 4, '0');
  
  INSERT INTO invoices (gym_id, member_id, subscription_id, invoice_number, amount)
  VALUES (p_gym_id, v_member_id, v_sub_id, v_inv_num, p_plan_fee)
  RETURNING id INTO v_inv_id;

  -- 5. Generate Receipt & Insert Payment (if any amount was paid)
  IF p_amount_paid > 0 THEN
    SELECT count(*) INTO v_rcp_count FROM payments WHERE gym_id = p_gym_id;
    v_rcp_num := v_gym_rcp_prefix || '-' || v_year || '-' || lpad((v_rcp_count + 1)::text, 4, '0');

    INSERT INTO payments (gym_id, member_id, invoice_id, receipt_number, amount, payment_method)
    VALUES (p_gym_id, v_member_id, v_inv_id, v_rcp_num, p_amount_paid, p_payment_method);
  END IF;

  RETURN jsonb_build_object(
    'member_id', v_member_id,
    'subscription_id', v_sub_id,
    'invoice_id', v_inv_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
