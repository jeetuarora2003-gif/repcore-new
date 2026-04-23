-- Script to add fake test members for the last 30 days
-- Gym ID: 5dfe7b80-875b-4778-9c2b-5eb36baa4a3f
-- Plan ID: 19ce51fa-de5c-4085-944f-4287ec49f84c (Monthly, 1500)

DO $$
DECLARE
    v_gym_id UUID := '5dfe7b80-875b-4778-9c2b-5eb36baa4a3f';
    v_plan_id UUID := '19ce51fa-de5c-4085-944f-4287ec49f84c';
    v_member_id UUID;
    v_sub_id UUID;
    v_invoice_id UUID;
    v_names TEXT[] := ARRAY['Rahul Sharma', 'Anjali Gupta', 'Vikram Singh', 'Priya Patel', 'Amit Verma', 'Sonia Malhotra', 'Karan Johar', 'Neha Dhupia', 'Rajesh Kumar', 'Simran Kaur'];
    v_joining_date DATE;
    v_i INTEGER;
BEGIN
    FOR v_i IN 1..10 LOOP
        v_joining_date := CURRENT_DATE - (v_i * 3); -- Spread over last 30 days
        
        -- 1. Insert Member
        INSERT INTO members (gym_id, full_name, phone, email, joining_date, notes)
        VALUES (v_gym_id, v_names[v_i], '98765' || LPAD(v_i::text, 5, '0'), LOWER(REPLACE(v_names[v_i], ' ', '.')) || '@test.com', v_joining_date, 'Test member generated for demo')
        RETURNING id INTO v_member_id;
        
        -- 2. Insert Subscription
        INSERT INTO subscriptions (gym_id, member_id, plan_id, start_date, end_date)
        VALUES (v_gym_id, v_member_id, v_plan_id, v_joining_date, v_joining_date + INTERVAL '30 days')
        RETURNING id INTO v_sub_id;
        
        -- 3. Insert Invoice
        INSERT INTO invoices (gym_id, member_id, subscription_id, invoice_number, amount)
        VALUES (v_gym_id, v_member_id, v_sub_id, 'INV-' || TO_CHAR(v_joining_date, 'YYYYMMDD') || '-' || LPAD(v_i::text, 3, '0'), 1500)
        RETURNING id INTO v_invoice_id;
        
        -- 4. Insert Payment (Full payment marked as paid)
        INSERT INTO payments (gym_id, member_id, invoice_id, receipt_number, amount, payment_method, notes, paid_at)
        VALUES (v_gym_id, v_member_id, v_invoice_id, 'REC-' || TO_CHAR(v_joining_date, 'YYYYMMDD') || '-' || LPAD(v_i::text, 3, '0'), 1500, 'upi', 'Full payment collected', v_joining_date + INTERVAL '1 hour');
        
    END LOOP;
END $$;
