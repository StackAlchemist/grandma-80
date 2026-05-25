import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    '[luxe-invite] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — ' +
    'check your .env.local and restart the dev server.'
  )
}

export const supabase = createClient(
  supabaseUrl ?? '',
  supabasePublishableKey ?? ''
)

export type Database = {
  public: {
    Tables: {
      invitations: {
        Row: {
          id: string
          invite_code: string
          guest_name: string
          phone_number: string | null
          table_number: string | null
          checked_in: boolean
          checked_in_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invite_code: string
          guest_name: string
          phone_number?: string | null
          table_number?: string | null
          checked_in?: boolean
          checked_in_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invite_code?: string
          guest_name?: string
          phone_number?: string | null
          table_number?: string | null
          checked_in?: boolean
          checked_in_at?: string | null
          created_at?: string
        }
      }
    }
  }
}