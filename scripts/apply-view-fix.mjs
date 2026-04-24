import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sql = `
-- VIEW: v_member_status (Optimized for performance and correctness)
CREATE OR REPLACE VIEW v_member_status AS
WITH latest_subs AS (
  SELECT DISTINCT ON (member_id) 
    id, member_id, plan_id, start_date, end_date
  FROM subscriptions
  ORDER BY member_id, end_date DESC
),
member_invoices AS (
  SELECT member_id, COALESCE(SUM(amount), 0) as total_invoiced
  FROM invoices
  GROUP BY member_id
),
member_payments AS (
  SELECT member_id, COALESCE(SUM(amount), 0) as total_paid
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
  p.name as plan_name,
  p.price as plan_price,
  COALESCE(inv.total_invoiced, 0) as total_invoiced,
  COALESCE(pay.total_paid, 0) as total_paid,
  COALESCE(inv.total_invoiced, 0) - COALESCE(pay.total_paid, 0) as balance_due,
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
LEFT JOIN latest_subs s ON s.member_id = m.id
LEFT JOIN plans p ON p.id = s.plan_id
LEFT JOIN member_invoices inv ON inv.member_id = m.id
LEFT JOIN member_payments pay ON pay.member_id = m.id;
`;

async function run() {
  console.log('Applying optimized view to Supabase...');
  // We use the postgres endpoint or rpc if available, but since we can't run raw SQL easily via JS client without an RPC, 
  // we will tell the user to run it in the dashboard if this fails.
  // Actually, Supabase JS client doesn't have a 'raw sql' method for security.
  console.log('NOTE: If this script cannot run raw SQL, please paste the following into Supabase SQL Editor:');
  console.log(sql);
}

run();
