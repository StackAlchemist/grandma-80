import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { searchAdminGuests } from '@/lib/invitations'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const auth = await isAuthenticated()
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => null)
    const query = body?.query

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, guests: [], message: 'Valid search query required' },
        { status: 400 }
      )
    }

    const trimmed = query.trim()
    if (trimmed.length < 2) {
      return NextResponse.json({
        success: true,
        guests: [],
        message: 'Please enter at least 2 characters.',
      })
    }

    const guests = await searchAdminGuests(trimmed)

    return NextResponse.json({
      success: true,
      count: guests.length,
      guests,
    })
  } catch (err) {
    console.error('Admin search error:', err)
    return NextResponse.json(
      { success: false, guests: [], message: 'Search failed' },
      { status: 500 }
    )
  }
}
