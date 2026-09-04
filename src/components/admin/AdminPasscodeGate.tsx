'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onAuthenticated: () => void
}

export function AdminPasscodeGate({ onAuthenticated }: Props) {
  const [passcode, setPasscode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passcode.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        onAuthenticated()
      } else {
        setError(data.message || 'Incorrect passcode. Please try again.')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-obsidian text-ivory font-body flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gold-500/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-md glass-dark border border-gold-500/20 p-8 sm:p-10 gold-border-glow text-center"
      >
        <div className="w-12 h-12 rounded-full border border-gold-500/40 bg-gold-500/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <p className="font-body text-[10px] uppercase tracking-[0.5em] text-gold-400/80 mb-2">
          Private Operations
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-ivory/95 mb-2">
          Admin & Usher Access
        </h1>
        <p className="font-body text-xs text-ivory/40 mb-8">
          Enter event operations passcode to unlock the live dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label
              htmlFor="admin-passcode"
              className="block font-body text-[10px] uppercase tracking-[0.3em] text-gold-400/70 mb-2"
            >
              Operations Passcode
            </label>
            <input
              id="admin-passcode"
              type="password"
              inputMode="numeric"
              required
              autoFocus
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Enter passcode (e.g. 8080)"
              disabled={loading}
              className="w-full px-4 py-3.5 bg-obsidian/90 border border-gold-500/30 text-ivory placeholder:text-ivory/20 font-mono text-center tracking-[0.5em] text-lg rounded-none focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-all disabled:opacity-50"
            />
            {error && (
              <p className="mt-2 text-xs text-red-400 font-body text-center" role="alert">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !passcode.trim()}
            className="w-full relative group py-4 px-6 bg-gold-500 text-obsidian font-body text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold-400 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 overflow-hidden shadow-lg shadow-gold-500/10"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Unlock Dashboard</span>
            )}
          </button>
        </form>

        <p className="font-body text-[10px] text-ivory/20 text-center mt-8 tracking-wider">
          Mrs. Margaret Olusola Odusoga JP. @ 80
        </p>
      </motion.div>
    </div>
  )
}
