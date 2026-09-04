'use client'

import { useState } from 'react'
import { AdminPasscodeGate } from './AdminPasscodeGate'
import { AdminDashboard } from './AdminDashboard'
import type { AdminDashboardData } from '@/types'

interface Props {
  initialAuth: boolean
  initialData: AdminDashboardData | null
}

export function AdminClientView({ initialAuth, initialData }: Props) {
  const [authenticated, setAuthenticated] = useState(initialAuth)

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
    } catch {
      // Ignore
    }
    setAuthenticated(false)
  }

  if (!authenticated) {
    return <AdminPasscodeGate onAuthenticated={() => setAuthenticated(true)} />
  }

  return (
    <AdminDashboard
      initialData={initialData}
      onLogout={handleLogout}
    />
  )
}
