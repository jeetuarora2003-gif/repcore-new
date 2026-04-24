import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getGym() {
  const { data, error } = await supabase.from('gyms').select('id, name').limit(1).single()
  if (error) {
    console.error('Error fetching gym:', error.message)
    process.exit(1)
  }
  console.log(`FOUND_GYM_ID: ${data.id}`)
  console.log(`GYM_NAME: ${data.name}`)
}

getGym()
