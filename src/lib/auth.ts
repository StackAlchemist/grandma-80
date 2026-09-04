import { cookies } from 'next/headers'
import crypto from 'crypto'

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || '8080'
const COOKIE_NAME = 'admin_session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'luxe-invite-admin-secret-key-2026'

// Hash of the current passcode with a salt
function getExpectedToken(): string {
  return crypto
    .createHash('sha256')
    .update(`${ADMIN_PASSCODE}:${SESSION_SECRET}`)
    .digest('hex')
}

export function verifyPasscode(inputPasscode: string): boolean {
  if (!inputPasscode || typeof inputPasscode !== 'string') return false
  return inputPasscode.trim() === ADMIN_PASSCODE.trim()
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(COOKIE_NAME)
    if (!sessionCookie || !sessionCookie.value) return false
    return sessionCookie.value === getExpectedToken()
  } catch {
    return false
  }
}

export function getSessionCookieConfig() {
  return {
    name: COOKIE_NAME,
    value: getExpectedToken(),
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours (event day)
    },
  }
}
