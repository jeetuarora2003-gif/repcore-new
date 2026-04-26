const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vznttgjggsnndkkjiazp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bnR0Z2pnZ3NubmRra2ppYXpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzNjIxNSwiZXhwIjoyMDkyNTEyMjE1fQ.0JG8aLSkzMDAF0LBEolH9zEy6b6yugqGBvOyu3W5kG4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const GYM_ID = '5dfe7b80-875b-4778-9c2b-5eb36baa4a3f';
  const TOTAL_MEMBERS = 10000;
  const BATCH_SIZE = 50; // Smaller batch size for stability with RPC calls

  console.log('Step 1: Clearing previous stress test data...');
  await supabase.from('members').delete().eq('notes', 'STRESS_TEST_DATA');

  console.log('Step 2: Ensuring a Monthly Plan exists...');
  let { data: plan } = await supabase.from('plans').select('id').eq('gym_id', GYM_ID).eq('name', 'Monthly Stress Test').maybeSingle();
  if (!plan) {
    const { data: newPlan, error: planError } = await supabase.from('plans').insert({
      gym_id: GYM_ID,
      name: 'Monthly Stress Test',
      duration_days: 30,
      price: 1000
    }).select().single();
    if (planError) throw planError;
    plan = newPlan;
  }
  const planId = plan.id;

  console.log('Step 3: Enrolling 10,000 members...');
  const firstNames = ['Aarav', 'Aditi', 'Arjun', 'Ananya', 'Ishaan', 'Kavya', 'Vihaan', 'Saanvi', 'Rohan', 'Dia'];
  const lastNames = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Kapoor', 'Singh', 'Mehta', 'Joshi', 'Chopra', 'Aggarwal'];

  for (let i = 0; i < TOTAL_MEMBERS; i += BATCH_SIZE) {
    const batch = [];
    for (let j = 0; j < BATCH_SIZE && (i + j) < TOTAL_MEMBERS; j++) {
      const idx = i + j;
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const isPaid = idx < 9500;
      
      batch.push(supabase.rpc('create_membership_sale', {
        p_gym_id: GYM_ID,
        p_full_name: `${firstName} ${lastName} ${idx + 1}`,
        p_phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        p_email: `${firstName.toLowerCase()}${idx + 1}@stress.test`,
        p_photo_url: `https://i.pravatar.cc/150?u=${idx + 1}`,
        p_notes: 'STRESS_TEST_DATA',
        p_device_id: null,
        p_plan_id: planId,
        p_start_date: new Date().toISOString().split('T')[0],
        p_end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        p_plan_fee: 1000,
        p_amount_paid: isPaid ? 1000 : 0,
        p_payment_method: 'cash'
      }));
    }
    const results = await Promise.all(batch);
    const errors = results.filter(r => r.error);
    if (errors.length > 0) console.error('Enrollment error:', errors[0].error);
    
    if (i % 500 === 0) console.log(`Progress: ${i} / 10000 members enrolled.`);
  }

  console.log('Step 4: Checking in all 10,000 members for TODAY (IST)...');
  const { data: allMembers } = await supabase.from('members').select('id').eq('gym_id', GYM_ID).eq('notes', 'STRESS_TEST_DATA');
  
  // Use current time plus 5.5 hours to ensure it falls on the correct day in IST
  const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString();

  for (let i = 0; i < allMembers.length; i += 500) {
    const batch = allMembers.slice(i, i + 500).map(m => ({
      gym_id: GYM_ID,
      member_id: m.id,
      checked_in_at: istDate
    }));
    const { error } = await supabase.from('attendance').insert(batch);
    if (error) console.error('Check-in error:', error);
    console.log(`Progress: ${i + batch.length} / 10000 checked in.`);
  }

  console.log('MASSIVE STRESS TEST COMPLETE!');
}

run().catch(console.error);
