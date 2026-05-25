'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 font-body">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-md"
      >
        <p className="font-display text-gold-500/30 text-8xl mb-6">404</p>
        <h1 className="font-display text-4xl text-ivory/80 mb-4">
          Invitation Not Found
        </h1>
        <p className="font-body text-ivory/40 text-sm leading-relaxed mb-10">
          This invitation link appears to be invalid or does not exist.
          Please check that you have the correct link.
        </p>
        <Link
          href="/"
          className="font-body text-xs tracking-[0.3em] uppercase border border-gold-500/30 hover:border-gold-500/60 text-gold-400/70 hover:text-gold-300 px-8 py-4 transition-all duration-300"
        >
          Return Home
        </Link>
      </motion.div>
    </div>
  )
}
