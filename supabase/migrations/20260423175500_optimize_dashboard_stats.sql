-- Create an optimized function to get gym dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_gym_id UUID)
RETURNS JSON AS $$
DECLARE
    v_total_members BIGINT;
    v_active_members BIGINT;
    v_expiring_members BIGINT;
    v_total_dues NUMERIC;
BEGIN
    -- Get total members
    SELECT count(*) INTO v_total_members 
    FROM members 
    WHERE gym_id = p_gym_id;

    -- Get active/expiring soon members and total dues in one pass over the view
    SELECT 
        count(*) FILTER (WHERE status IN ('active', 'expiring_soon')),
        count(*) FILTER (WHERE days_until_expiry <= 7 AND days_until_expiry >= 0),
        COALESCE(sum(balance_due), 0)
    INTO 
        v_active_members,
        v_expiring_members,
        v_total_dues
    FROM v_member_status 
    WHERE gym_id = p_gym_id;

    RETURN json_build_object(
        'total', v_total_members,
        'active', v_active_members,
        'expiring', v_expiring_members,
        'dues', v_total_dues
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refactor v_member_status for much better performance
-- This replaces the slow SUM(DISTINCT) logic with pre-aggregated joins
DROP VIEW IF EXISTS v_member_status CASCADE;

CREATE VIEW v_member_status AS
WITH member_subs AS (
  SELECT DISTINCT ON (member_id) 
    id, member_id, start_date, end_date, plan_id
  FROM subscriptions
  ORDER BY member_id, end_date DESC
),
member_invoices AS (
  SELECT member_id, SUM(amount) as total_invoiced
  FROM invoices
  GROUP BY member_id
),
member_payments AS (
  SELECT member_id, SUM(amount) as total_paid
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
  s.id as subscription_id,
  s.start_date,
  s.end_date,
  s.plan_id,
  p.name as plan_name,
  p.duration_days,
  p.price as plan_price,
  COALESCE(inv.total_invoiced, 0) as total_invoiced,
  COALESCE(pay.total_paid, 0) as total_paid,
  (COALESCE(inv.total_invoiced, 0) - COALESCE(pay.total_paid, 0)) as balance_due,
  (s.end_date - current_date) as days_until_expiry,
  CASE
    WHEN s.end_date IS NULL THEN 'no_plan'
    WHEN m.is_frozen THEN 'frozen'
    WHEN (s.end_date - current_date) < 0 AND (current_date - s.end_date) > 30 THEN 'lapsed'
    WHEN (s.end_date - current_date) < 0 THEN 'expired'
    WHEN (s.end_date - current_date) <= 5 THEN 'expiring_soon'
    ELSE 'active'
  END as status
FROM members m
LEFT JOIN member_subs s ON s.member_id = m.id
LEFT JOIN plans p ON p.id = s.plan_id
LEFT JOIN member_invoices inv ON inv.member_id = m.id
LEFT JOIN member_payments pay ON pay.member_id = m.id;
