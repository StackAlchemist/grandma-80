/**
 * Seed Script: Generate invitations programmatically
 *
 * Usage:
 *   npm run seed
 *
 * This script inserts sample guests into Supabase.
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import * as dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Helper: generate a short human-readable invite code
function generateInviteCode(guestName: string): string {
  const slug = guestName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20)
  const uid = randomUUID().split('-')[0] // 8 hex chars
  return `${slug}-${uid}`
}

const GUESTS = [
  { guest_name: 'Chief Emmanuel Adeyemi',   table_number: 'Table 1 — Head' },
  { guest_name: 'Dr. Ngozi Okonkwo',         table_number: 'Table 2 — Family' },
  { guest_name: 'Pastor & Mrs. Abiodun',     table_number: 'Table 3 — Church' },
  { guest_name: 'Barrister Tunde Fashola',   table_number: 'Table 4 — Friends' },
  { guest_name: 'Prof. Amaka Eze',            table_number: 'Table 5 — Colleagues' },
  { guest_name: 'Ambassador Chidi Okeke',    table_number: 'Table 2 — Family' },
  { guest_name: 'Mrs. Folake Balogun',        table_number: 'Table 6 — Neighbours' },
  { guest_name: 'Mr. & Mrs. Rotimi Okafor',  table_number: 'Table 4 — Friends' },
]

async function seed() {
  console.log('🌱 Seeding invitations...\n')

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  for (const guest of GUESTS) {
    const invite_code = generateInviteCode(guest.guest_name)

    const { data, error } = await supabase
      .from('invitations')
      .insert({ ...guest, invite_code })
      .select()
      .single()

    if (error) {
      console.error(`❌ Failed to insert ${guest.guest_name}:`, error.message)
    } else {
      console.log(`✅ ${data.guest_name}`)
      console.log(`   Table: ${data.table_number}`)
      console.log(`   Invite: ${APP_URL}/invite/${data.invite_code}`)
      console.log()
    }
  }

  console.log('✨ Seeding complete!')
}

seed().catch(console.error)
