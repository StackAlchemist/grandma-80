import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { performCheckIn, getAdminStats } from '@/lib/invitations'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const auth = await isAuthenticated()
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => null)
    const invite_code = body?.invite_code

    if (!invite_code || typeof invite_code !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Valid invite code required' },
        { status: 400 }
      )
    }

    // Reuses the exact same check-in rules and backend optimistic locking logic
    const result = await performCheckIn(invite_code.trim())
    const stats = await getAdminStats()

    return NextResponse.json({
      ...result,
      stats,
    })
  } catch (err) {
    console.error('Admin manual check-in error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error during check-in' },
      { status: 500 }
    )
  }
}
