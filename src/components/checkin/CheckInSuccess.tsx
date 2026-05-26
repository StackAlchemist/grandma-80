'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Invitation } from '@/types'

interface Props {
  invitation: Invitation
}

export function CheckInSuccess({ invitation }: Props) {
  const router = useRouter()
  const redirected = useRef(false)

  useEffect(() => {
    if (redirected.current) return
    redirected.current = true
    const t = setTimeout(() => router.push('/scanner'), 2500)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 font-body">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-950/30 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-xs w-full glass-dark border border-emerald-800/40 p-10 text-center">
        <div className="w-20 h-20 rounded-full border-2 border-emerald-400/70 bg-emerald-950/40 flex items-center justify-center mx-auto mb-8">
          <svg className="w-9 h-9 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-emerald-800/50 to-transparent mb-8" />

        <p className="font-body text-[10px] uppercase tracking-[0.5em] text-emerald-400/60 mb-3">
          Checked In
        </p>
        <h1 className="font-display text-4xl text-emerald-300 mb-2">
          {invitation.guest_name}
        </h1>
        {/* <p className="font-body text-sm text-gold-400 mt-3">
          {invitation.table_number}
        </p> */}

        <div className="h-px bg-gradient-to-r from-transparent via-emerald-800/50 to-transparent mt-8 mb-6" />

        <button
          onClick={() => router.push('/scanner')}
          className="w-full py-3 bg-gold-500 text-obsidian font-body text-xs tracking-[0.3em] uppercase font-semibold"
        >
          Scan Next Guest
        </button>
        <p className="font-body text-[10px] text-ivory/20 mt-3 tracking-widest">
          Returning automatically...
        </p>
      </div>
    </div>
  )
}
