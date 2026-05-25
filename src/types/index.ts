export interface Invitation {
  id: string
  invite_code: string
  guest_name: string
  phone_number: string | null
  table_number: string | null
  checked_in: boolean
  checked_in_at: string | null
  created_at: string
}

export interface CheckInResult {
  success: boolean
  invitation?: Invitation
  error?: 'not_found' | 'already_used' | 'server_error'
  message?: string
}

export type InviteStatus = 'valid' | 'used' | 'not_found'
