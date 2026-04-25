/*
  Fix v_member_status to use IST (Asia/Kolkata) for date calculations
  instead of Postgres current_date (which uses server timezone = UTC).
  
  This ensures expiry/status transitions happen at 12:00 AM IST,
  not 12:00 AM UTC (which is 5:30 AM IST).
*/

DROP VIEW IF EXISTS v_member_status CASCADE;

CREATE VIEW v_member_status AS
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
