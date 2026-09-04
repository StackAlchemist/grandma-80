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
    message: `Welcome, ${data.guest_name}!`,
  }
}

export function maskPhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 4) return null
  const last4 = digits.slice(-4)
  if (digits.length >= 10) {
    const core = digits.slice(-10)
    const prefix = core.slice(0, 3)
    return `0${prefix} •••• ${last4}`
  }
  return `•••• ••• ${last4}`
}

export async function searchInvitations(rawQuery: string): Promise<import('@/types').SearchResult[]> {
  const query = (rawQuery ?? '').trim()
  if (!query || query.length < 2) {
    return []
  }

  const digitsOnly = query.replace(/\D/g, '')
  const isPotentialPhone = digitsOnly.length >= 7

  // If query looks like a phone number, search by phone
  if (isPotentialPhone) {
    let phoneFilter: string
    if (digitsOnly.length >= 10) {
      const core = digitsOnly.slice(-10)
      phoneFilter = `phone_number.eq.${core},phone_number.eq.0${core},phone_number.eq.234${core},phone_number.eq.2340${core},phone_number.ilike.%${core}%`
    } else {
      phoneFilter = `phone_number.ilike.%${digitsOnly}%`
    }

    const { data, error } = await supabase
      .from('invitations')
      .select('invite_code, guest_name, phone_number')
      .or(phoneFilter)
      .limit(10)

    if (!error && data && data.length > 0) {
      return data.map(item => ({
        invite_code: item.invite_code,
        guest_name: item.guest_name,
        masked_phone: maskPhoneNumber(item.phone_number),
      }))
    }
  }

  // Search by guest_name
  // Normalize whitespace and remove symbols that could break ilike
  const cleanName = query.replace(/[%,()]/g, ' ').replace(/\s+/g, ' ').trim()
  if (cleanName.length < 2) {
    return []
  }

  const tokens = cleanName.split(' ').filter(t => t.length > 0)

  let nameQuery = supabase
    .from('invitations')
    .select('invite_code, guest_name, phone_number')

  // Chain ilike for all words so "Jimi Odusoga" matches "Arch. Jimi Odusoga"
  for (const token of tokens) {
    nameQuery = nameQuery.ilike('guest_name', `%${token}%`)
  }

  const { data, error } = await nameQuery.limit(10)

  if (error || !data) {
    // If multi-token query had 0 matches, fallback to broader ilike on the whole string
    const fallback = await supabase
      .from('invitations')
      .select('invite_code, guest_name, phone_number')
      .ilike('guest_name', `%${tokens[0]}%`)
      .limit(10)

    if (!fallback.error && fallback.data) {
      return fallback.data.map(item => ({
        invite_code: item.invite_code,
        guest_name: item.guest_name,
        masked_phone: maskPhoneNumber(item.phone_number),
      }))
    }

    return []
  }

  return data.map(item => ({
    invite_code: item.invite_code,
    guest_name: item.guest_name,
    masked_phone: maskPhoneNumber(item.phone_number),
  }))
}

export async function getAdminStats(): Promise<import('@/types').AdminStats> {
  try {
    const [{ count: total }, { count: checkedIn }] = await Promise.all([
      supabase.from('invitations').select('*', { count: 'exact', head: true }),
      supabase.from('invitations').select('*', { count: 'exact', head: true }).eq('checked_in', true),
    ])

    const tot = total ?? 0
    const checked = checkedIn ?? 0
    const remaining = Math.max(0, tot - checked)
    const percentage = tot > 0 ? Number(((checked / tot) * 100).toFixed(1)) : 0

    return {
      total: tot,
      checkedIn: checked,
      remaining,
      percentage,
    }
  } catch (err) {
    console.error('Error fetching admin stats:', err)
    return { total: 0, checkedIn: 0, remaining: 0, percentage: 0 }
  }
}

export async function getRecentCheckIns(limit = 10): Promise<Invitation[]> {
  try {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('checked_in', true)
      .order('checked_in_at', { ascending: false })
      .limit(limit)

    if (error || !data) return []
    return data as Invitation[]
  } catch (err) {
    console.error('Error fetching recent check-ins:', err)
    return []
  }
}

export async function searchAdminGuests(rawQuery: string): Promise<Invitation[]> {
  const query = (rawQuery ?? '').trim()
  if (!query || query.length < 2) {
    return []
  }

  // 1. Check if query is an invite code
  const cleanCode = query.toLowerCase().replace(/[^a-z0-9_-]/g, '')
  if (cleanCode.length >= 4) {
    const { data: byCode } = await supabase
      .from('invitations')
      .select('*')
      .or(`invite_code.eq.${cleanCode},invite_code.ilike.%${cleanCode}%`)
      .limit(10)

    if (byCode && byCode.length > 0) {
      return byCode as Invitation[]
    }
  }

  // 2. Check if query looks like a phone number
  const digitsOnly = query.replace(/\D/g, '')
  if (digitsOnly.length >= 7) {
    let phoneFilter: string
    if (digitsOnly.length >= 10) {
      const core = digitsOnly.slice(-10)
      phoneFilter = `phone_number.eq.${core},phone_number.eq.0${core},phone_number.eq.234${core},phone_number.eq.2340${core},phone_number.ilike.%${core}%`
    } else {
      phoneFilter = `phone_number.ilike.%${digitsOnly}%`
    }

    const { data: byPhone, error } = await supabase
      .from('invitations')
      .select('*')
      .or(phoneFilter)
      .limit(15)

    if (!error && byPhone && byPhone.length > 0) {
      return byPhone as Invitation[]
    }
  }

  // 3. Search by guest name
  const cleanName = query.replace(/[%,()]/g, ' ').replace(/\s+/g, ' ').trim()
  if (cleanName.length < 2) {
    return []
  }

  const tokens = cleanName.split(' ').filter(t => t.length > 0)

  let nameQuery = supabase.from('invitations').select('*')
  for (const token of tokens) {
    nameQuery = nameQuery.ilike('guest_name', `%${token}%`)
  }

  const { data: byName, error } = await nameQuery.limit(15)

  if (error || !byName || byName.length === 0) {
    // Fallback to first token if multi-word query produced 0 results
    if (tokens.length > 1) {
      const { data: fallback } = await supabase
        .from('invitations')
        .select('*')
        .ilike('guest_name', `%${tokens[0]}%`)
        .limit(15)

      if (fallback && fallback.length > 0) {
        return fallback as Invitation[]
      }
    }
    return []
  }

  return byName as Invitation[]
}

export async function getAdminGuestList(options: {
  filter?: 'all' | 'checked_in' | 'pending'
  page?: number
  limit?: number
  search?: string
}): Promise<{ guests: Invitation[]; total: number }> {
  try {
    let q = supabase.from('invitations').select('*', { count: 'exact' })

    if (options.filter === 'checked_in') {
      q = q.eq('checked_in', true)
    } else if (options.filter === 'pending') {
      q = q.eq('checked_in', false)
    }

    if (options.search && options.search.trim().length >= 2) {
      q = q.ilike('guest_name', `%${options.search.trim()}%`)
    }

    // Sort checked-in first by check-in time, or by name
    if (options.filter === 'checked_in') {
      q = q.order('checked_in_at', { ascending: false })
    } else {
      q = q.order('guest_name', { ascending: true })
    }

    const page = Math.max(1, options.page || 1)
    const limit = Math.min(50, Math.max(1, options.limit || 20))
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count, error } = await q.range(from, to)

    if (error || !data) {
      return { guests: [], total: 0 }
    }

    return {
      guests: data as Invitation[],
      total: count ?? data.length,
    }
  } catch (err) {
    console.error('Error fetching admin guest list:', err)
    return { guests: [], total: 0 }
  }
}


