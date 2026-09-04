'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { SearchResult, FindResponse } from '@/types'

type ViewState = 'search' | 'results'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
}

export function FindForm() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedInvite, setSelectedInvite] = useState<SearchResult | null>(null)
  const [viewState, setViewState] = useState<ViewState>('search')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()

    if (trimmed.length < 2) {
      setErrorMessage('Please enter at least 2 characters to search.')
      return
    }

    setLoading(true)
    setErrorMessage(null)
    setSelectedInvite(null)

    try {
      const response = await fetch('/api/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      })

      const data: FindResponse = await response.json()

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Unable to complete search. Please try again.')
        setResults([])
      } else {
        setResults(data.invitations)
        setHasSearched(true)
        if (data.invitations.length === 1) {
          setSelectedInvite(data.invitations[0])
        }
        setViewState('results')
      }
    } catch {
      setErrorMessage('Network connection error. Please check your internet connection and try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setQuery('')
    setResults([])
    setSelectedInvite(null)
    setErrorMessage(null)
    setHasSearched(false)
    setViewState('search')
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {viewState === 'search' ? (
          <motion.div
            key="search-form"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full glass-dark border border-gold-500/20 p-8 sm:p-10 gold-border-glow text-center"
          >
            {/* Header / Subtitle */}
            <p className="font-body text-[10px] uppercase tracking-[0.5em] text-gold-400/80 mb-3">
              Event Concierge
            </p>
            <h1 className="font-display text-4xl sm:text-5xl text-ivory/95 mb-4 leading-tight">
              Find Your <span className="text-gold-gradient">Invitation</span>
            </h1>
            <p className="font-body text-xs sm:text-sm text-ivory/50 leading-relaxed mb-8 max-w-sm mx-auto">
              Please enter your full name or the phone number associated with your invitation to access your personalized pass.
            </p>

            <form onSubmit={handleSearch} className="space-y-6 text-left" noValidate>
              <div>
                <label
                  htmlFor="search-query"
                  className="block font-body text-[10px] uppercase tracking-[0.3em] text-gold-400/70 mb-2"
                >
                  Your Name or Phone Number
                </label>
                <div className="relative">
                  <input
                    id="search-query"
                    name="query"
                    type="text"
                    required
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      if (errorMessage) setErrorMessage(null)
                    }}
                    placeholder="e.g. Jimi Odusoga or 08012345678"
                    disabled={loading}
                    autoComplete="off"
                    autoFocus
                    className="w-full px-4 py-3.5 bg-obsidian/80 border border-gold-500/30 text-ivory placeholder:text-ivory/20 font-body text-sm rounded-none focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-all duration-300 disabled:opacity-50"
                  />
                  {query && !loading && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      aria-label="Clear input"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory/70 transition-colors p-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-xs text-red-400 font-body"
                    role="alert"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !query.trim()}
                aria-busy={loading}
                className="w-full relative group py-4 px-8 bg-gold-500 text-obsidian font-body text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold-400 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-3 overflow-hidden shadow-lg shadow-gold-500/10"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
                    <span>Searching Records...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Find My Invitation</span>
                    <div className="absolute inset-0 bg-gold-300 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 pointer-events-none" />
                  </>
                )}
              </button>
            </form>

            <div className="ornament my-8 text-gold-500/30 text-xs">✦</div>

            <p className="font-body text-[10px] text-ivory/30 leading-relaxed">
              If you have already received your invitation link on WhatsApp, you may open it directly.
            </p>
          </motion.div>
        ) : (
          /* Results View */
          <motion.div
            key="search-results"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full glass-dark border border-gold-500/20 p-8 sm:p-10 gold-border-glow"
          >
            {hasSearched && results.length === 0 ? (
              /* Case 0: No Matches Found */
              <div className="text-center">
                <div className="w-14 h-14 rounded-full border border-gold-500/30 bg-gold-500/5 flex items-center justify-center mx-auto mb-6">
                  <span className="text-gold-400 text-xl font-display">✕</span>
                </div>
                <p className="font-body text-[10px] uppercase tracking-[0.4em] text-gold-400/80 mb-2">
                  Search Result
                </p>
                <h2 className="font-display text-3xl sm:text-4xl text-ivory/90 mb-4">
                  No Invitation Found
                </h2>
                <p className="font-body text-xs sm:text-sm text-ivory/50 leading-relaxed mb-6 max-w-sm mx-auto">
                  We could not find an invitation matching <span className="text-gold-300 font-medium">&ldquo;{query}&rdquo;</span>.
                </p>
                <div className="p-4 border border-gold-500/15 bg-gold-500/5 mb-8 text-left space-y-2">
                  <p className="font-body text-[11px] text-ivory/70 leading-relaxed">
                    ✦ <span className="text-ivory/90 font-medium">Spelling check:</span> Verify the spelling of your first or last name.
                  </p>
                  <p className="font-body text-[11px] text-ivory/70 leading-relaxed">
                    ✦ <span className="text-ivory/90 font-medium">Try phone number:</span> Search using your phone number (e.g. 08012345678).
                  </p>
                  <p className="font-body text-[11px] text-ivory/70 leading-relaxed">
                    ✦ <span className="text-ivory/90 font-medium">Assistance:</span> Please consult the event reception desk at the entrance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3.5 border border-gold-500/40 hover:border-gold-500 text-gold-400 hover:text-gold-300 font-body text-xs tracking-[0.3em] uppercase transition-all duration-300"
                >
                  Try Another Search
                </button>
              </div>
            ) : selectedInvite ? (
              /* Case 1: Single Match Found (or selected from multiple) */
              <div className="text-center">
                <div className="w-14 h-14 rounded-full border border-gold-400/50 bg-gold-500/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-gold-300 text-2xl font-display">✓</span>
                </div>
                <p className="font-body text-[10px] uppercase tracking-[0.5em] text-gold-400/80 mb-2">
                  Guest Identified
                </p>
                <h2 className="font-display text-3xl sm:text-4xl text-gold-gradient mb-4">
                  Invitation Found
                </h2>
                <div className="py-6 px-4 my-6 border-y border-gold-500/20 bg-gold-500/5">
                  <p className="font-body text-[10px] uppercase tracking-[0.3em] text-ivory/40 mb-2">
                    Welcome
                  </p>
                  <p className="font-display text-2xl sm:text-3xl text-ivory font-medium">
                    {selectedInvite.guest_name}
                  </p>
                  {selectedInvite.masked_phone && (
                    <p className="font-body text-xs text-gold-400/60 mt-2 tracking-wider">
                      Phone: {selectedInvite.masked_phone}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Link
                    href={`/invite/${selectedInvite.invite_code}`}
                    className="block w-full py-4 px-8 bg-gold-500 hover:bg-gold-400 text-obsidian font-body text-xs tracking-[0.3em] uppercase font-semibold transition-all duration-300 shadow-lg shadow-gold-500/10"
                  >
                    View My Invitation →
                  </Link>

                  {results.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSelectedInvite(null)}
                      className="block w-full py-3 text-ivory/40 hover:text-ivory/70 font-body text-[10px] tracking-[0.2em] uppercase transition-colors"
                    >
                      ← Back to All Matches
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleReset}
                    className="block w-full py-3 border border-gold-500/20 hover:border-gold-500/40 text-gold-400/70 hover:text-gold-300 font-body text-[10px] tracking-[0.2em] uppercase transition-all duration-300"
                  >
                    Search Again
                  </button>
                </div>
              </div>
            ) : (
              /* Case 2: Multiple Matches Found */
              <div>
                <div className="text-center mb-6">
                  <p className="font-body text-[10px] uppercase tracking-[0.4em] text-gold-400/80 mb-2">
                    Multiple Records
                  </p>
                  <h2 className="font-display text-3xl text-ivory/95 mb-2">
                    Multiple Matches Found
                  </h2>
                  <p className="font-body text-xs text-ivory/50">
                    More than one invitation matched your query. Please tap your name below to proceed:
                  </p>
                </div>

                <div className="space-y-3 mb-8 max-h-80 overflow-y-auto pr-1">
                  {results.map((inv) => (
                    <button
                      key={inv.invite_code}
                      type="button"
                      onClick={() => setSelectedInvite(inv)}
                      className="w-full text-left p-4 border border-gold-500/20 bg-gold-500/5 hover:border-gold-500/60 hover:bg-gold-500/10 transition-all duration-300 flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-display text-lg sm:text-xl text-ivory/90 group-hover:text-gold-200 transition-colors">
                          {inv.guest_name}
                        </p>
                        {inv.masked_phone && (
                          <p className="font-body text-[11px] text-ivory/40 mt-1 tracking-wider">
                            Phone: {inv.masked_phone}
                          </p>
                        )}
                      </div>
                      <span className="text-gold-400/50 group-hover:text-gold-300 font-body text-xs tracking-widest uppercase pl-4 shrink-0 transition-colors">
                        Select →
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3.5 border border-gold-500/25 hover:border-gold-500/50 text-gold-400/70 hover:text-gold-300 font-body text-xs tracking-[0.3em] uppercase transition-all duration-300"
                >
                  Search Again
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
