import { NextRequest, NextResponse } from 'next/server'
import { performCheckIn } from '@/lib/invitations'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { invite_code } = await request.json()

    if (!invite_code) {
      return NextResponse.json({ error: 'not_found', message: 'No invite code provided.' }, { status: 400 })
    }

    const result = await performCheckIn(invite_code)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Check-in API error:', err)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}