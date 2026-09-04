import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyPasscode, getSessionCookieConfig, isAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const authenticated = await isAuthenticated()
  return NextResponse.json({ authenticated })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const passcode = body?.passcode

    if (!passcode || !verifyPasscode(passcode)) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin passcode. Please try again.' },
        { status: 401 }
      )
    }

    const cookieStore = await cookies()
    const config = getSessionCookieConfig()

    cookieStore.set(config.name, config.value, config.options)

    return NextResponse.json({
      success: true,
      message: 'Authenticated successfully',
    })
  } catch (err) {
    console.error('Admin auth error:', err)
    return NextResponse.json(
      { success: false, message: 'Authentication error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    const config = getSessionCookieConfig()
    cookieStore.delete(config.name)
    return NextResponse.json({ success: true, message: 'Logged out' })
  } catch (err) {
    console.error('Admin logout error:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
