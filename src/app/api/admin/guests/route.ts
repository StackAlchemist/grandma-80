import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getAdminGuestList } from '@/lib/invitations'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await isAuthenticated()
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const filter = (searchParams.get('filter') || 'all') as 'all' | 'checked_in' | 'pending'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const search = searchParams.get('search') || undefined

    const { guests, total } = await getAdminGuestList({
      filter,
      page,
      limit,
      search,
    })

    return NextResponse.json({
      success: true,
      guests,
      total,
      page,
      limit,
    })
  } catch (err) {
    console.error('Admin guests list error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch guests list' },
      { status: 500 }
    )
  }
}
