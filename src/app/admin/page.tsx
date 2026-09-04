import type { Metadata } from 'next'
import { isAuthenticated } from '@/lib/auth'
import { getAdminStats, getRecentCheckIns } from '@/lib/invitations'
import { AdminClientView } from '@/components/admin/AdminClientView'
import type { AdminDashboardData } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Operations Dashboard — Event Check-in Control',
  description: 'Private event-day operations dashboard.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminPage() {
  const auth = await isAuthenticated()

  let initialData: AdminDashboardData | null = null

  if (auth) {
    try {
      const [stats, recentCheckIns] = await Promise.all([
        getAdminStats(),
        getRecentCheckIns(10),
      ])
      initialData = {
        stats,
        recentCheckIns,
        lastUpdated: new Date().toISOString(),
      }
    } catch {
      // Fallback
    }
  }

  return (
    <AdminClientView
      initialAuth={auth}
      initialData={initialData}
    />
  )
}
