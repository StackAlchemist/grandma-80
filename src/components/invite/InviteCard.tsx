'use client'

import { motion } from 'framer-motion'
import { QRDisplay } from '@/components/ui/QRDisplay'
import { EVENT_CONFIG } from '@/lib/config'
import type { Invitation } from '@/types'

interface Props {
  invitation: Invitation
  checkInUrl: string
}

const stagger = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  },
  item: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
}

export function InviteCard({ invitation, checkInUrl }: Props) {
  return (
    <div className="relative min-h-screen bg-obsidian overflow-hidden font-body flex flex-col">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold-500/6 blur-[140px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 max-w-lg mx-auto w-full">

        {/* Top ornament */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full flex items-center gap-3 mb-10"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-500/50" />
          <span className="text-gold-400 text-[10px] tracking-[0.5em] uppercase shrink-0">Private Invitation</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-500/50" />
        </motion.div>

        {/* Card */}
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="visible"
          className="w-full glass-dark border border-gold-500/20 p-8 sm:p-10 gold-border-glow"
        >

          {/* Guest name */}
          <motion.div variants={stagger.item} className="text-center mb-8">
            <p className="font-body text-[10px] uppercase tracking-[0.4em] text-ivory/40 mb-3">
              Dear
            </p>
            <p className="font-display text-4xl sm:text-5xl text-ivory/95 leading-tight">
              {invitation.guest_name}
            </p>
            <p className="font-display italic text-gold-400/70 text-lg mt-2">
              You are warmly welcome to the birthday celebration of Mrs. Margaret Olusola Odusoga JP.
            </p>
          </motion.div>

          {/* Table number */}
          {/* {invitation.table_number && (
            <motion.div variants={stagger.item} className="text-center mb-8">
              <div className="inline-flex flex-col items-center gap-1 px-8 py-4 border border-gold-500/30 bg-gold-500/5">
                <span className="text-gold-400/60 text-[10px] uppercase tracking-[0.4em]">Your Table</span>
                <span className="text-gold-300 font-display text-3xl">{invitation.table_number}</span>
              </div>
            </motion.div>
          )} */}

          <motion.div variants={stagger.item} className="ornament my-6 text-gold-500/40 text-xs">✦</motion.div>

          {/* QR Code */}
          <motion.div variants={stagger.item} className="flex flex-col items-center mb-8">
            <p className="font-body text-[10px] uppercase tracking-[0.4em] text-ivory/40 mb-6 text-center">
              Your Entry Pass
            </p>
            <QRDisplay value={checkInUrl} size={220} guestName={invitation.guest_name} />
            <p className="font-body text-[10px] text-ivory/25 mt-6 text-center max-w-xs leading-relaxed">
              Present this QR code at the entrance.
              It is personal and activates once only.
            </p>
          </motion.div>

          <motion.div variants={stagger.item} className="ornament my-6 text-gold-500/40 text-xs">✦</motion.div>

          {/* Directions */}
          <motion.div variants={stagger.item}>
            <a
              href={EVENT_CONFIG.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 border border-gold-500/25 hover:border-gold-500/60 text-gold-400/70 hover:text-gold-300 transition-all duration-300 font-body text-xs tracking-widest uppercase"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              Get Directions to Venue
            </a>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="font-body text-[10px] text-ivory/20 text-center mt-8 tracking-widest uppercase"
        >
          {EVENT_CONFIG.rsvpNote}
        </motion.p>
      </div>
    </div>
  )
}