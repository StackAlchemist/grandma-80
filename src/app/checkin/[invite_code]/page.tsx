'use client'

import { useEffect, useState, use } from 'react'
import { CheckInSuccess } from '@/components/checkin/CheckInSuccess'
import { CheckInError } from '@/components/checkin/CheckInError'
import type { CheckInResult } from '@/types'

interface Props {
  params: Promise<{ invite_code: string }>
}

export default function CheckInPage({ params }: Props) {
  const { invite_code } = use(params)
  const [result, setResult] = useState<CheckInResult | null>(null)

  useEffect(() => {
    fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code }),
    })
      .then(res => res.json())
      .then(data => setResult(data))
      .catch(() =>
        setResult({
          success: false,
          error: 'server_error',
          message: 'Connection failed. Please try again.',
        })
      )
  }, [invite_code])

  // Loading
  if (!result) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 font-body">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold-500/5 blur-[120px]" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-8" />
          <p className="font-body text-[10px] uppercase tracking-[0.5em] text-ivory/30">
            Verifying invitation...
          </p>
        </div>
      </div>
    )
  }

  if (result.success && result.invitation) {
    return <CheckInSuccess invitation={result.invitation} />
  }

  return <CheckInError result={result} />
}