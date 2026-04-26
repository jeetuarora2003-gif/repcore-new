const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vznttgjggsnndkkjiazp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bnR0Z2pnZ3NubmRra2ppYXpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzNjIxNSwiZXhwIjoyMDkyNTEyMjE1fQ.0JG8aLSkzMDAF0LBEolH9zEy6b6yugqGBvOyu3W5kG4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const GYM_ID = '5dfe7b80-875b-4778-9c2b-5eb36baa4a3f'; // Big Guns
const TOTAL_MEMBERS = 5000;
const BATCH_SIZE = 50;

const firstNames = ['Aarav', 'Aditi', 'Arjun', 'Ananya', 'Ishaan', 'Kavya', 'Vihaan', 'Saanvi', 'Rohan', 'Dia', 'Kabir', 'Myra', 'Aryan', 'Zara', 'Reyansh', 'Kyra', 'Atharv', 'Anika', 'Aaryan', 'Ira'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Kapoor', 'Singh', 'Mehta', 'Joshi', 'Chopra', 'Aggarwal', 'Bansal', 'Goel', 'Trivedi', 'Pandey', 'Iyer', 'Nair', 'Reddy', 'Patel', 'Shah', 'Khan'];

function generateMember(index) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = `${firstName} ${lastName} ${index + 1}`;
  const phone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index + 1}@example.com`;
  const photoUrl = `https://i.pravatar.cc/150?u=${index + 1}`;
  
  return {
    p_gym_id: GYM_ID,
    p_full_name: fullName,
    p_phone: phone,
    p_email: email,
    p_photo_url: photoUrl,
    p_notes: 'STRESS_TEST_DATA',
    p_device_id: `DEVICE_${index + 1}`,
    p_plan_id: null,
    p_start_date: new Date().toISOString().split('T')[0],
    p_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    p_plan_fee: 1000,
    p_amount_paid: 1000,
    p_payment_method: 'cash'
  };
}

async function run() {
  console.log(`Starting stress test seed for BIG GUNS (${TOTAL_MEMBERS} members)...`);

  let { data: plans } = await supabase.from('plans').select('id').eq('gym_id', GYM_ID).limit(1);
  let planId;
  
  if (!plans || plans.length === 0) {
    console.log('No plan found. Creating "Standard Monthly" plan...');
    const { data: newPlan, error: planError } = await supabase.from('plans').insert({
      gym_id: GYM_ID,
      name: 'Standard Monthly',
      duration_months: 1,
      amount: 1000,
      description: 'Test Plan'
    }).select().single();
    
    if (planError) {
      console.error('Error creating plan:', planError);
      return;
    }
    planId = newPlan.id;
  } else {
    planId = plans[0].id;
  }
  
  console.log(`Using Plan ID: ${planId}`);

  for (let i = 0; i < TOTAL_MEMBERS; i += BATCH_SIZE) {
    const batch = [];
    for (let j = 0; j < BATCH_SIZE && (i + j) < TOTAL_MEMBERS; j++) {
      const memberData = generateMember(i + j);
      memberData.p_plan_id = planId;
      batch.push(supabase.rpc('create_membership_sale', memberData));
    }
    
    const results = await Promise.all(batch);
    const errors = results.filter(r => r.error);
    
    if (errors.length > 0) {
      console.error(`Batch starting at ${i} had ${errors.length} errors. Sample:`, errors[0].error);
    }
    
    console.log(`Progress: ${Math.min(i + BATCH_SIZE, TOTAL_MEMBERS)} / ${TOTAL_MEMBERS} members enrolled.`);
  }

  console.log('Stress test seeding for BIG GUNS completed successfully!');
}

run().catch(console.error);
