'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EVENT_CONFIG } from '@/lib/config'
import type { Invitation } from '@/types'

interface Props {
  invitation: Invitation
}

const AUTO_REDIRECT_SECONDS = 5

export function CheckInSuccess({ invitation }: Props) {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)
  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SECONDS)

  useEffect(() => {
    const confettiTimer = setTimeout(() => setShowConfetti(true), 300)
    return () => clearTimeout(confettiTimer)
  }, [])

  // Countdown then auto-redirect to scanner
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/scanner')
      return
    }
    const id = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [countdown, router])

  const checkedInAt = invitation.checked_in_at
    ? new Date(invitation.checked_in_at).toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 font-body overflow-hidden">
      {/* Green ambient glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-950/30 blur-[120px]" />
      </div>

      {/* Gold particles */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: `${Math.random() * 100}vw`,
                y: -20,
                rotate: Math.random() * 360,
                opacity: 1,
              }}
              animate={{
                y: '110vh',
                rotate: Math.random() * 720,
                opacity: 0,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 1.5,
                ease: 'easeIn',
              }}
              className="absolute w-1.5 h-4"
              style={{
                background: `hsl(${42 + Math.random() * 20}, ${60 + Math.random() * 30}%, ${50 + Math.random() * 20}%)`,
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 max-w-sm w-full"
      >
        <div className="glass-dark border border-emerald-800/40 p-10 text-center">
          {/* Checkmark circle */}
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full border-2 border-emerald-400/70 flex items-center justify-center mx-auto mb-8 bg-emerald-950/40"
          >
            <motion.svg
              className="w-8 h-8 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
              />
            </motion.svg>
          </motion.div>

          <div className="h-px bg-gradient-to-r from-transparent via-emerald-800/50 to-transparent mb-8" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <p className="font-body text-[10px] uppercase tracking-[0.5em] text-emerald-400/60 mb-3">
              Welcome
            </p>
            <h1 className="font-display text-5xl text-emerald-300 mb-2">
              {invitation.guest_name}
            </h1>
            <p className="font-body text-xs uppercase tracking-widest text-ivory/40 mb-8">
              Check-in Successful
            </p>

            {/* Table assignment */}
            <div className="bg-emerald-950/30 border border-emerald-800/30 px-6 py-5 mb-6">
              <p className="font-body text-[10px] uppercase tracking-widest text-ivory/40 mb-2">
                Your Table
              </p>
              <p className="font-display text-5xl text-gold-gradient">{invitation.table_number}</p>
            </div>

            {/* Event info */}
            <div className="space-y-2 mb-8">
              <p className="font-display italic text-2xl text-gold-400/80">
                {EVENT_CONFIG.name}
              </p>
              <p className="font-body text-xs text-ivory/30 tracking-wider">
                In honour of {EVENT_CONFIG.celebrantName}
              </p>
            </div>

            {checkedInAt && (
              <p className="font-body text-[10px] text-ivory/25 tracking-widest uppercase">
                Checked in at {checkedInAt}
              </p>
            )}
          </motion.div>

          <div className="h-px bg-gradient-to-r from-transparent via-emerald-800/50 to-transparent mt-8 mb-6" />

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="space-y-3"
          >
            {/* Scan next — primary */}
            <button
              onClick={() => router.push('/scanner')}
              className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-obsidian font-body text-xs tracking-[0.3em] uppercase font-semibold transition-colors duration-300"
            >
              Scan Next Guest
            </button>

            {/* Auto-redirect countdown */}
            <p className="font-body text-[10px] text-ivory/25 tracking-widest">
              Returning to scanner in {countdown}s
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}