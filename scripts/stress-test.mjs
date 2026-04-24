import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// --- CONFIGURATION ---
const GYM_ID = '5dfe7b80-875b-4778-9c2b-5eb36baa4a3f' // Big Guns
const MEMBER_COUNT = 5000       // How many members to add
const ATTENDANCE_PER_MEMBER = 30 // How many days of attendance per member
// ---------------------

async function stressTest() {
  console.log(`🚀 Starting stress test for Gym: ${GYM_ID}`)
  console.log(`📈 Goal: ${MEMBER_COUNT} members with ${ATTENDANCE_PER_MEMBER} attendance records each.`)

  const CHUNK_SIZE = 100;
  
  for (let i = 0; i < MEMBER_COUNT; i += CHUNK_SIZE) {
    const currentChunkSize = Math.min(CHUNK_SIZE, MEMBER_COUNT - i);
    const members = [];
    const attendanceRecords = [];

    for (let k = 0; k < currentChunkSize; k++) {
      const memberId = crypto.randomUUID();
      const memberIndex = i + k;
      
      members.push({
        id: memberId,
        gym_id: GYM_ID,
        full_name: `Stress Test Member ${memberIndex}`,
        phone: `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        joining_date: new Date().toISOString().split('T')[0]
      });

      for (let j = 0; j < ATTENDANCE_PER_MEMBER; j++) {
        const checkInDate = new Date();
        checkInDate.setDate(checkInDate.getDate() - j);
        attendanceRecords.push({
          gym_id: GYM_ID,
          member_id: memberId,
          checked_in_at: checkInDate.toISOString()
        });
      }
    }

    // Bulk insert members
    const { error: mErr } = await supabase.from('members').insert(members);
    if (mErr) {
      console.error(`Error creating member chunk starting at ${i}:`, mErr.message);
      continue;
    }

    // Bulk insert attendance (in chunks of 1000 to avoid request size limits)
    for (let a = 0; a < attendanceRecords.length; a += 1000) {
        const { error: aErr } = await supabase.from('attendance').insert(attendanceRecords.slice(a, a + 1000));
        if (aErr) console.error(`Error creating attendance chunk at ${a} for member batch ${i}:`, aErr.message);
    }

    console.log(`✅ Processed ${i + currentChunkSize} members...`);
  }

  console.log('🏁 Stress test complete!')
}

stressTest()
