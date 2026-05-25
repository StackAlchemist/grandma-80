'use client'

import { motion } from 'framer-motion'
import type { CheckInResult } from '@/types'

interface Props {
  result: CheckInResult
}

export function CheckInError({ result }: Props) {
  const isAlreadyUsed = result.error === 'already_used'
  const isNotFound = result.error === 'not_found'

  const config = {
    already_used: {
      icon: '⊗',
      title: 'Already Used',
      subtitle: 'This invitation is no longer valid',
      accentColor: 'border-red-800/40',
      glowColor: 'bg-red-950/20',
      iconColor: 'border-red-500/50 text-red-400',
      titleColor: 'text-red-300',
      dividerColor: 'via-red-900/40',
    },
    not_found: {
      icon: '?',
      title: 'Not Found',
      subtitle: 'This invitation does not exist',
      accentColor: 'border-amber-800/40',
      glowColor: 'bg-amber-950/10',
      iconColor: 'border-amber-500/50 text-amber-400',
      titleColor: 'text-amber-300',
      dividerColor: 'via-amber-900/40',
    },
    server_error: {
      icon: '!',
      title: 'Error',
      subtitle: 'A server error occurred',
      accentColor: 'border-red-800/40',
      glowColor: 'bg-red-950/10',
      iconColor: 'border-red-500/50 text-red-400',
      titleColor: 'text-red-300',
      dividerColor: 'via-red-900/40',
    },
  }

  const c = config[result.error ?? 'server_error']

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 font-body">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full ${c.glowColor} blur-[100px]`} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 max-w-sm w-full"
      >
        <div className={`glass-dark border ${c.accentColor} p-10 text-center`}>
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto mb-8 ${c.iconColor}`}
          >
            <span className="text-2xl font-display">{c.icon}</span>
          </motion.div>

          <div className={`h-px bg-gradient-to-r from-transparent ${c.dividerColor} to-transparent mb-8`} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="font-body text-[10px] uppercase tracking-[0.5em] text-ivory/40 mb-3">
              Access Denied
            </p>
            <h1 className={`font-display text-4xl mb-2 ${c.titleColor}`}>{c.title}</h1>
            <p className="font-body text-sm text-ivory/40 mb-8">{c.subtitle}</p>

            {result.message && (
              <div className="bg-white/3 border border-white/8 px-6 py-4 mb-8">
                <p className="font-body text-sm text-ivory/60 leading-relaxed">
                  {result.message}
                </p>
              </div>
            )}

            {/* Checkin time for already used */}
            {isAlreadyUsed && result.invitation?.checked_in_at && (
              <div className="mb-6">
                <p className="font-body text-[10px] uppercase tracking-widest text-ivory/30 mb-2">
                  Used by
                </p>
                <p className="font-display text-xl text-ivory/60">
                  {result.invitation.guest_name}
                </p>
              </div>
            )}

            {isNotFound && (
              <p className="font-body text-xs text-ivory/25 leading-relaxed">
                Please check that your invitation link is correct or contact event staff.
              </p>
            )}

            <div className={`h-px bg-gradient-to-r from-transparent ${c.dividerColor} to-transparent mt-8`} />

            <p className="font-body text-[10px] text-ivory/20 mt-6 tracking-widest uppercase">
              Contact staff if you believe this is an error
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
