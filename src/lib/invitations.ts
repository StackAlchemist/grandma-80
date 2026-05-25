import { supabase } from './supabase'
import type { Invitation, CheckInResult } from '@/types'

export async function getInvitationByCode(inviteCode: string): Promise<Invitation | null> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('invite_code', inviteCode)
    .single()

  if (error || !data) return null
  return data as Invitation
}

export async function performCheckIn(inviteCode: string): Promise<CheckInResult> {
  // 1. Fetch the invitation
  const invitation = await getInvitationByCode(inviteCode)

  if (!invitation) {
    return {
      success: false,
      error: 'not_found',
      message: 'This invitation does not exist.',
    }
  }

  // 2. Check if already used
  if (invitation.checked_in) {
    return {
      success: false,
      invitation,
      error: 'already_used',
      message: `This invitation was already used on ${
        invitation.checked_in_at
          ? new Date(invitation.checked_in_at).toLocaleString('en-NG', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : 'an earlier time'
      }.`,
    }
  }

  // 3. Mark as checked in
  const { data, error } = await supabase
    .from('invitations')
    .update({
      checked_in: true,
      // Postgres `timestamp` (no timezone) — strip the trailing Z
      checked_in_at: new Date().toISOString().replace('Z', ''),
    })
    .eq('invite_code', inviteCode)
    .eq('checked_in', false) // Optimistic locking: only update if still false
    .select()
    .single()

  if (error || !data) {
    // Race condition: someone else checked in simultaneously
    const refetch = await getInvitationByCode(inviteCode)
    if (refetch?.checked_in) {
      return {
        success: false,
        invitation: refetch,
        error: 'already_used',
        message: 'This invitation was just used moments ago.',
      }
    }
    return {
      success: false,
      error: 'server_error',
      message: 'A server error occurred. Please try again.',
    }
  }

  return {
    success: true,
    invitation: data as Invitation,
    message: `Welcome, ${data.guest_name}! Your table is ready.`,
  }
}
