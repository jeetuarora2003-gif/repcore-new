/*
  Add today_revenue to get_dashboard_stats RPC.
*/

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
  -- Total members
  SELECT count(*) INTO v_total_members FROM members WHERE gym_id = p_gym_id;

  -- New members this month
  SELECT count(*) INTO v_new_members FROM members
  WHERE gym_id = p_gym_id AND joining_date >= v_month_start AND joining_date <= v_today_ist;

  -- Active, expiring, and dues
  SELECT
    count(*) FILTER (WHERE status IN ('active', 'expiring_soon')),
    count(*) FILTER (WHERE days_until_expiry BETWEEN 0 AND 7),
    COALESCE(sum(balance_due), 0)
  INTO v_active_members, v_expiring_members, v_total_dues
  FROM v_member_status WHERE gym_id = p_gym_id;

  -- Today's revenue
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
