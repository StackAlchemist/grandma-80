import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getAdminStats, getRecentCheckIns } from '@/lib/invitations'
import type { AdminDashboardData } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await isAuthenticated()
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [stats, recentCheckIns] = await Promise.all([
      getAdminStats(),
      getRecentCheckIns(10),
    ])

    const responseData: AdminDashboardData = {
      stats,
      recentCheckIns,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      ...responseData,
    })
  } catch (err) {
    console.error('Admin data fetch error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve dashboard data' },
      { status: 500 }
    )
  }
}
