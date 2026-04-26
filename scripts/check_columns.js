const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('Checking v_member_status columns...');
  const { data, error } = await supabase
    .from('v_member_status')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching view:', error);
    return;
  }

  const columns = Object.keys(data[0] || {});
  console.log('Columns found in v_member_status:', columns.join(', '));
  
  const reminders = ['reminder_5_sent_at', 'reminder_3_sent_at', 'reminder_1_sent_at'];
  reminders.forEach(col => {
    if (columns.includes(col)) {
      console.log(`[OK] Column ${col} exists.`);
    } else {
      console.log(`[MISSING] Column ${col} is MISSING!`);
    }
  });
}

check();
