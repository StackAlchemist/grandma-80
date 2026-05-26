'use client'

import { motion } from 'framer-motion'
import { QRDisplay } from '@/components/ui/QRDisplay'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
  },
}

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    day: d.toLocaleDateString('en-NG', { weekday: 'long' }),
    date: d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }),
    time: d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
  }
}

export function InviteCard({ invitation, checkInUrl }: Props) {
  const eventDate = formatEventDate(EVENT_CONFIG.date)

  return (
    <div className="relative min-h-screen bg-obsidian overflow-hidden font-body flex flex-col">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gold-500/6 blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-gold-700/4 blur-[80px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 pt-12 pb-16 max-w-lg mx-auto w-full">
        {/* Header ornament */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full flex items-center gap-3 mb-10"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-500/50" />
          <span className="text-gold-400 text-[10px] tracking-[0.5em] uppercase shrink-0">
            Private Invitation
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-500/50" />
        </motion.div>

        {/* Main card */}
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="visible"
          className="w-full glass-dark rounded-none border border-gold-500/20 p-8 sm:p-10 gold-border-glow"
        >
          {/* Event name */}
          <motion.div variants={stagger.item} className="text-center mb-8">
            <p className="font-body text-[10px] tracking-[0.6em] uppercase text-gold-400/60 mb-3">
              You Are Cordially Invited To
            </p>
            <h1 className="font-display text-4xl sm:text-5xl text-gold-gradient leading-tight">
              {EVENT_CONFIG.name}
            </h1>
          </motion.div>

          {/* Divider */}
          <motion.div variants={stagger.item} className="ornament my-6 text-gold-500/40 text-xs">
            ✦
          </motion.div>

          {/* Celebrant */}
          <motion.div variants={stagger.item} className="text-center mb-8">
            <p className="font-body text-[10px] uppercase tracking-[0.4em] text-ivory/40 mb-1">
              In Honour of
            </p>
            <p className="font-display text-3xl italic text-gold-300">{EVENT_CONFIG.celebrantName}</p>
            <p className="font-body text-[10px] tracking-widest uppercase text-ivory/30 mt-1">
              80th Birthday Celebration
            </p>
          </motion.div>

          {/* Divider */}
          <motion.div variants={stagger.item} className="ornament my-6 text-gold-500/40 text-xs">
            ✦
          </motion.div>

          {/* Guest info */}
          <motion.div variants={stagger.item} className="text-center mb-8">
            <p className="font-body text-[10px] uppercase tracking-[0.4em] text-ivory/40 mb-2">
              Dear
            </p>
            <p className="font-display text-3xl sm:text-4xl text-ivory/95">{invitation.guest_name}</p>
            {/* <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 border border-gold-500/30 bg-gold-500/5">
              <span className="text-gold-400/60 text-[10px] uppercase tracking-widest">Table</span>
              <span className="text-gold-400 font-display text-lg">{invitation.table_number}</span>
            </div> */}
          </motion.div>

          {/* Event details */}
          <motion.div
            variants={stagger.item}
            className="bg-gold-500/5 border border-gold-500/15 p-5 space-y-4 mb-8"
          >
            <div className="flex items-start gap-4">
              <span className="text-gold-500/50 text-lg shrink-0 mt-0.5">◷</span>
              <div>
                <p className="font-body text-[10px] uppercase tracking-widest text-ivory/40 mb-0.5">
                  Date & Time
                </p>
                <p className="font-display text-lg text-ivory/90">{eventDate.day}, {eventDate.date}</p>
                <p className="font-body text-sm text-gold-400">{eventDate.time} prompt</p>
              </div>
            </div>

            <div className="h-px bg-gold-500/10" />

            <div className="flex items-start gap-4">
              <span className="text-gold-500/50 text-lg shrink-0 mt-0.5">◎</span>
              <div>
                <p className="font-body text-[10px] uppercase tracking-widest text-ivory/40 mb-0.5">
                  Venue
                </p>
                <p className="font-display text-lg text-ivory/90">{EVENT_CONFIG.venue}</p>
                <p className="font-body text-xs text-ivory/40 mt-0.5">{EVENT_CONFIG.address}</p>
              </div>
            </div>

            <div className="h-px bg-gold-500/10" />

            <div className="flex items-start gap-4">
              <span className="text-gold-500/50 text-lg shrink-0 mt-0.5">✦</span>
              <div>
                <p className="font-body text-[10px] uppercase tracking-widest text-ivory/40 mb-0.5">
                  Dress Code
                </p>
                <p className="font-body text-sm text-ivory/70">{EVENT_CONFIG.dressCode}</p>
              </div>
            </div>
          </motion.div>

          {/* Countdown */}
          <motion.div variants={stagger.item} className="mb-8 text-center">
            <p className="font-body text-[10px] uppercase tracking-widest text-ivory/30 mb-4">
              The Celebration Begins In
            </p>
            <CountdownTimer targetDate={EVENT_CONFIG.date} />
          </motion.div>

          {/* QR Code */}
          <motion.div variants={stagger.item} className="flex flex-col items-center mb-8">
            <div className="ornament text-gold-500/40 text-xs mb-8">✦</div>
            <p className="font-body text-[10px] uppercase tracking-[0.4em] text-ivory/40 mb-6 text-center">
              Your Entry Pass
            </p>
            <QRDisplay value={checkInUrl} size={200} />
            <p className="font-body text-[10px] text-ivory/25 mt-6 text-center max-w-xs leading-relaxed">
              This QR code is personal and non-transferable.
              It will be scanned once at the entrance.
            </p>
          </motion.div>

          {/* Google Maps */}
          {/* <motion.div variants={stagger.item}>
            <a
              href={EVENT_CONFIG.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 w-full py-4 border border-gold-500/25 hover:border-gold-500/60 text-gold-400/70 hover:text-gold-300 transition-all duration-300 font-body text-xs tracking-widest uppercase"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              Get Directions
            </a>
          </motion.div> */}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="font-body text-[10px] text-ivory/20 text-center mt-8 tracking-widest uppercase"
        >
          {EVENT_CONFIG.rsvpNote}
        </motion.p>
      </div>
    </div>
  )
}
