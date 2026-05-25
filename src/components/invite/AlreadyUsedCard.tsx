'use client'

import { motion } from 'framer-motion'
import type { Invitation } from '@/types'

interface Props {
  invitation: Invitation
}

export function AlreadyUsedCard({ invitation }: Props) {
  const usedAt = invitation.checked_in_at
    ? new Date(invitation.checked_in_at).toLocaleString('en-NG', {
        dateStyle: 'full',
        timeStyle: 'short',
      })
    : 'previously'

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 font-body">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-950/20 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="glass-dark border border-red-900/40 p-10 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-full border-2 border-red-500/50 flex items-center justify-center mx-auto mb-8"
          >
            <span className="text-red-400 text-2xl">✕</span>
          </motion.div>

          <div className="h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent mb-8" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="font-body text-[10px] uppercase tracking-[0.5em] text-red-400/60 mb-3">
              Invitation Status
            </p>
            <h1 className="font-display text-4xl text-red-300 mb-2">
              Already Used
            </h1>
            <p className="font-display italic text-2xl text-ivory/50 mb-8">
              {invitation.guest_name}
            </p>

            <p className="font-body text-sm text-ivory/40 leading-relaxed mb-6">
              This invitation was activated on
            </p>

            <div className="bg-red-950/20 border border-red-900/30 px-6 py-4 mb-8">
              <p className="font-display text-gold-400/70 text-lg">{usedAt}</p>
            </div>

            <p className="font-body text-xs text-ivory/25 leading-relaxed">
              Each invitation may only be used once for entry.
              If you believe this is an error, please contact event staff.
            </p>
          </motion.div>

          <div className="h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent mt-8" />
        </div>
      </motion.div>
    </div>
  )
}
