'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { Invitation, AdminStats, AdminDashboardData } from '@/types'

interface Props {
  initialData?: AdminDashboardData | null
  onLogout: () => void
}

export function AdminDashboard({ initialData, onLogout }: Props) {
  // Stats & live feed
  const [stats, setStats] = useState<AdminStats>(
    initialData?.stats || { total: 0, checkedIn: 0, remaining: 0, percentage: 0 }
  )
  const [recentCheckIns, setRecentCheckIns] = useState<Invitation[]>(
    initialData?.recentCheckIns || []
  )
  const [lastUpdated, setLastUpdated] = useState<string>(
    initialData?.lastUpdated ? new Date(initialData.lastUpdated).toLocaleTimeString() : 'Just now'
  )
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Primary Search
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Invitation[] | null>(null)
  const [selectedGuest, setSelectedGuest] = useState<Invitation | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Checking in action
  const [checkingInCode, setCheckingInCode] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Directory / Guest list
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'checked_in' | 'pending'>('all')
  const [directorySearch, setDirectorySearch] = useState('')
  const [directoryGuests, setDirectoryGuests] = useState<Invitation[]>([])
  const [directoryTotal, setDirectoryTotal] = useState(0)
  const [directoryPage, setDirectoryPage] = useState(1)
  const [directoryLoading, setDirectoryLoading] = useState(false)
  const [showDirectory, setShowDirectory] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Refresh dashboard metrics & recent check-ins
  const refreshData = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true)
    try {
      const res = await fetch('/api/admin/data')
      if (res.status === 401) {
        onLogout()
        return
      }
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
        setRecentCheckIns(data.recentCheckIns || [])
        setLastUpdated(new Date().toLocaleTimeString())
      }
    } catch (err) {
      console.error('Refresh error:', err)
    } finally {
      if (!quiet) setIsRefreshing(false)
    }
  }, [onLogout])

  // Periodic lightweight polling (every 20s)
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      refreshData(true)
    }, 20000)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshData])

  // Execute Search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const q = searchQuery.trim()
    if (!q) {
      setSearchResults(null)
      setSelectedGuest(null)
      setSearchError(null)
      return
    }

    if (q.length < 2) {
      setSearchError('Please enter at least 2 characters.')
      return
    }

    setSearching(true)
    setSearchError(null)
    setActionMessage(null)

    try {
      const res = await fetch('/api/admin/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })

      if (res.status === 401) {
        onLogout()
        return
      }

      const data = await res.json()
      if (data.success) {
        setSearchResults(data.guests)
        if (data.guests.length === 1) {
          setSelectedGuest(data.guests[0])
        } else {
          setSelectedGuest(null)
        }
      } else {
        setSearchError(data.message || 'Search failed')
        setSearchResults([])
        setSelectedGuest(null)
      }
    } catch {
      setSearchError('Network error while searching.')
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  // Check In a Guest (Reuses backend performCheckIn)
  const handleCheckIn = async (inviteCode: string) => {
    if (!inviteCode || checkingInCode) return

    setCheckingInCode(inviteCode)
    setActionMessage(null)

    try {
      const res = await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: inviteCode }),
      })

      if (res.status === 401) {
        onLogout()
        return
      }

      const data = await res.json()

      if (data.success && data.invitation) {
        const updated = data.invitation as Invitation
        setActionMessage({
          type: 'success',
          text: `✓ Checked in ${updated.guest_name} successfully!`,
        })

        // Update selected guest card state
        if (selectedGuest?.invite_code === inviteCode) {
          setSelectedGuest(updated)
        }

        // Update search results list if open
        if (searchResults) {
          setSearchResults(prev =>
            prev ? prev.map(g => (g.invite_code === inviteCode ? updated : g)) : null
          )
        }

        // Update directory list if open
        setDirectoryGuests(prev =>
          prev.map(g => (g.invite_code === inviteCode ? updated : g))
        )

        // Prepend to recent check-ins
        setRecentCheckIns(prev => [updated, ...prev.filter(g => g.invite_code !== inviteCode)].slice(0, 10))

        // Update stats
        if (data.stats) {
          setStats(data.stats)
        } else {
          refreshData(true)
        }
      } else if (data.error === 'already_used') {
        setActionMessage({
          type: 'error',
          text: `Notice: ${data.message || 'This invitation was already checked in.'}`,
        })
        if (data.invitation) {
          setSelectedGuest(data.invitation)
        }
        refreshData(true)
      } else {
        setActionMessage({
          type: 'error',
          text: data.message || 'Check-in failed. Please try again.',
        })
      }
    } catch {
      setActionMessage({
        type: 'error',
        text: 'Network error during check-in. Please retry.',
      })
    } finally {
      setCheckingInCode(null)
    }
  }

  // Load Directory page
  const fetchDirectory = useCallback(async () => {
    setDirectoryLoading(true)
    try {
      const params = new URLSearchParams({
        filter: directoryFilter,
        page: directoryPage.toString(),
        limit: '20',
      })
      if (directorySearch.trim().length >= 2) {
        params.set('search', directorySearch.trim())
      }

      const res = await fetch(`/api/admin/guests?${params.toString()}`)
      if (res.status === 401) {
        onLogout()
        return
      }

      const data = await res.json()
      if (data.success) {
        setDirectoryGuests(data.guests || [])
        setDirectoryTotal(data.total || 0)
      }
    } catch (err) {
      console.error('Directory fetch error:', err)
    } finally {
      setDirectoryLoading(false)
    }
  }, [directoryFilter, directoryPage, directorySearch, onLogout])

  useEffect(() => {
    if (showDirectory) {
      fetchDirectory()
    }
  }, [showDirectory, fetchDirectory])

  // Initial load
  useEffect(() => {
    refreshData(true)
  }, [refreshData])

  const formatCheckInTime = (dateStr: string | null) => {
    if (!dateStr) return null
    try {
      const d = new Date(dateStr)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="min-h-screen bg-obsidian text-ivory font-body flex flex-col">
      {/* Top Operations Header */}
      <header className="sticky top-0 z-30 bg-obsidian/95 backdrop-blur-md border-b border-gold-500/20 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold-400 font-semibold">
                Event Operations Control
              </span>
              <span className="text-gold-500/30">|</span>
              <span className="font-body text-[10px] text-ivory/40 uppercase tracking-widest hidden sm:inline">
                Grandma @ 80
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl text-ivory font-medium mt-0.5">
              Check-in Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-refresh indicator & toggle */}
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? 'Auto-refresh active (every 20s)' : 'Auto-refresh paused'}
              className={`text-[10px] uppercase tracking-wider px-2.5 py-1.5 border transition-colors ${
                autoRefresh
                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                  : 'border-ivory/20 text-ivory/40'
              }`}
            >
              {autoRefresh ? 'Auto-Sync ON' : 'Auto-Sync OFF'}
            </button>

            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={() => refreshData()}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gold-500/30 text-gold-400 hover:text-gold-300 hover:border-gold-500/60 transition-colors text-xs font-body tracking-wider uppercase disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Lock / Exit */}
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 border border-red-500/30 text-red-400 hover:text-red-300 hover:border-red-500/60 transition-colors text-xs font-body tracking-wider uppercase"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Real-time Metric Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Expected */}
          <div className="glass-dark border border-gold-500/20 p-4 sm:p-5 text-left">
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ivory/40 mb-1">
              Total Expected
            </p>
            <p className="font-display text-3xl sm:text-4xl text-ivory font-semibold">
              {stats.total}
            </p>
            <p className="font-body text-[10px] text-ivory/30 mt-1">Confirmed Guests</p>
          </div>

          {/* Card 2: Checked In */}
          <div className="glass-dark border border-emerald-500/30 p-4 sm:p-5 text-left bg-emerald-950/10">
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-emerald-400/80 mb-1">
              Checked In
            </p>
            <p className="font-display text-3xl sm:text-4xl text-emerald-400 font-semibold">
              {stats.checkedIn}
            </p>
            <div className="w-full bg-obsidian h-1.5 mt-2 rounded-full overflow-hidden border border-emerald-500/20">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          {/* Card 3: Remaining */}
          <div className="glass-dark border border-gold-500/20 p-4 sm:p-5 text-left">
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-gold-400/70 mb-1">
              Remaining
            </p>
            <p className="font-display text-3xl sm:text-4xl text-gold-300 font-semibold">
              {stats.remaining}
            </p>
            <p className="font-body text-[10px] text-ivory/30 mt-1">Awaiting Arrival</p>
          </div>

          {/* Card 4: Arrival Rate */}
          <div className="glass-dark border border-gold-500/20 p-4 sm:p-5 text-left">
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-ivory/40 mb-1">
              Arrival Rate
            </p>
            <p className="font-display text-3xl sm:text-4xl text-gold-gradient font-semibold">
              {stats.percentage}%
            </p>
            <p className="font-body text-[10px] text-ivory/30 mt-1">
              Last sync: {lastUpdated}
            </p>
          </div>
        </section>

        {/* Action / Success Banner */}
        <AnimatePresence>
          {actionMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 border font-body text-sm flex items-center justify-between ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/60 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {actionMessage.type === 'success' ? '✓' : '⚠'}
                </span>
                <span>{actionMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionMessage(null)}
                className="text-xs uppercase tracking-wider opacity-60 hover:opacity-100 p-1"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRIMARY SEARCH SECTION - The Centerpiece */}
        <section className="glass-dark border border-gold-500/30 p-5 sm:p-7 gold-border-glow">
          <div className="mb-4">
            <h2 className="font-display text-2xl text-ivory font-medium">
              Guest Check-in Search
            </h2>
            <p className="font-body text-xs text-ivory/50">
              Type guest name, phone number, or invite code to identify and check in.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gold-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone (080...), or invite code..."
                className="w-full pl-11 pr-10 py-3.5 bg-obsidian border border-gold-500/30 text-ivory placeholder:text-ivory/30 font-body text-sm sm:text-base rounded-none focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults(null)
                    setSelectedGuest(null)
                    setSearchError(null)
                    searchInputRef.current?.focus()
                  }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ivory/30 hover:text-ivory"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="py-3.5 px-8 bg-gold-500 text-obsidian font-body text-xs tracking-[0.2em] uppercase font-bold hover:bg-gold-400 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shrink-0 min-h-[48px]"
            >
              {searching ? (
                <>
                  <div className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Find Guest</span>
              )}
            </button>
          </form>

          {searchError && (
            <p className="mt-3 text-xs text-red-400 font-body">{searchError}</p>
          )}

          {/* SEARCH RESULTS DISPLAY */}
          {searchResults && (
            <div className="mt-6 pt-6 border-t border-gold-500/20">
              {searchResults.length === 0 ? (
                /* 0 matches */
                <div className="text-center py-8">
                  <p className="font-display text-2xl text-ivory/60 mb-1">No Guest Found</p>
                  <p className="font-body text-xs text-ivory/40 max-w-sm mx-auto">
                    No records found matching &ldquo;{searchQuery}&rdquo;. Try checking the spelling, or search using their phone number or invite code.
                  </p>
                </div>
              ) : selectedGuest ? (
                /* Identified Single Guest Card */
                <div className="bg-obsidian border border-gold-500/40 p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold-400">
                        Guest Identified
                      </span>
                      <h3 className="font-display text-3xl sm:text-4xl text-ivory font-medium mt-1">
                        {selectedGuest.guest_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-body text-ivory/60">
                        <span className="bg-gold-500/10 border border-gold-500/30 px-2.5 py-1 text-gold-300 font-mono">
                          Code: {selectedGuest.invite_code}
                        </span>
                        {selectedGuest.phone_number && (
                          <span>Phone: {selectedGuest.phone_number}</span>
                        )}
                        <span>Table: {selectedGuest.table_number || 'To Be Assigned'}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {selectedGuest.checked_in ? (
                        <div className="bg-emerald-950/60 border border-emerald-500 px-4 py-2 text-emerald-400 text-center">
                          <p className="font-body text-xs uppercase tracking-widest font-bold flex items-center gap-1.5">
                            <span>✓</span> CHECKED IN
                          </p>
                          <p className="text-[10px] text-emerald-300/80 mt-0.5">
                            {formatCheckInTime(selectedGuest.checked_in_at)
                              ? `At ${formatCheckInTime(selectedGuest.checked_in_at)}`
                              : 'Already checked in'}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gold-500/10 border border-gold-500/40 px-4 py-2 text-gold-300 text-center">
                          <p className="font-body text-xs uppercase tracking-widest font-semibold">
                            NOT CHECKED IN
                          </p>
                          <p className="text-[10px] text-ivory/40 mt-0.5">
                            Awaiting verification
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <div className="pt-4 border-t border-gold-500/20 flex flex-col sm:flex-row items-center gap-3">
                    {selectedGuest.checked_in ? (
                      <div className="w-full py-4 bg-emerald-900/30 border border-emerald-500/40 text-emerald-300 font-body text-xs tracking-[0.2em] uppercase font-bold text-center flex items-center justify-center gap-2">
                        <span>✓ ALREADY CHECKED IN</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCheckIn(selectedGuest.invite_code)}
                        disabled={checkingInCode === selectedGuest.invite_code}
                        className="w-full py-4 bg-gold-500 hover:bg-gold-400 text-obsidian font-body text-sm tracking-[0.25em] uppercase font-bold transition-all shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 disabled:opacity-50 min-h-[52px]"
                      >
                        {checkingInCode === selectedGuest.invite_code ? (
                          <>
                            <div className="w-5 h-5 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
                            <span>Recording Check-in...</span>
                          </>
                        ) : (
                          <span>CHECK IN GUEST →</span>
                        )}
                      </button>
                    )}

                    <Link
                      href={`/invite/${selectedGuest.invite_code}`}
                      target="_blank"
                      className="w-full sm:w-auto px-5 py-4 border border-gold-500/30 hover:border-gold-500 text-gold-400 hover:text-gold-300 font-body text-xs tracking-wider uppercase text-center transition-colors shrink-0"
                    >
                      View Invitation Pass ↗
                    </Link>

                    {searchResults.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSelectedGuest(null)}
                        className="w-full sm:w-auto px-4 py-4 text-ivory/50 hover:text-ivory font-body text-xs tracking-wider uppercase transition-colors"
                      >
                        ← Back to Results ({searchResults.length})
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Multiple Matches List */
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-body text-xs text-gold-400 uppercase tracking-wider font-semibold">
                      Multiple Matches Found ({searchResults.length})
                    </p>
                    <p className="font-body text-[11px] text-ivory/40">
                      Tap a guest to check status and check in:
                    </p>
                  </div>

                  <div className="space-y-2">
                    {searchResults.map((guest) => (
                      <div
                        key={guest.id}
                        className="p-4 bg-obsidian border border-gold-500/20 hover:border-gold-500/50 transition-all flex flex-wrap items-center justify-between gap-3 group"
                      >
                        <div className="flex-1 min-w-[200px]">
                          <p className="font-display text-lg text-ivory group-hover:text-gold-300 font-medium">
                            {guest.guest_name}
                          </p>
                          <p className="font-body text-xs text-ivory/50">
                            Table: {guest.table_number || 'To Be Assigned'}
                            {guest.phone_number && ` · Phone: ${guest.phone_number}`}
                            <span className="font-mono text-gold-500/50 ml-2">[{guest.invite_code}]</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {guest.checked_in ? (
                            <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-500/50 text-emerald-400 font-body text-[11px] font-semibold">
                              ✓ Checked In
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-gold-500/10 border border-gold-500/30 text-gold-400 font-body text-[11px]">
                              Pending
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedGuest(guest)}
                            className="px-4 py-2 bg-gold-500 text-obsidian font-body text-xs uppercase tracking-wider font-bold hover:bg-gold-400 transition-colors"
                          >
                            Select →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* RECENT CHECK-INS SECTION */}
        <section className="glass-dark border border-gold-500/20 p-5 sm:p-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl text-ivory font-medium">
                Recent Check-ins
              </h2>
              <p className="font-body text-xs text-ivory/40">
                Latest guests admitted across all scanning stations
              </p>
            </div>
            <span className="text-xs font-mono text-gold-400/60 bg-gold-500/10 px-2 py-1">
              Live Feed
            </span>
          </div>

          {recentCheckIns.length === 0 ? (
            <p className="text-xs text-ivory/40 py-4 text-center">
              No check-ins recorded yet. Check-ins will stream here live as guests arrive.
            </p>
          ) : (
            <div className="space-y-2">
              {recentCheckIns.slice(0, 6).map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-3 bg-obsidian/60 border border-gold-500/10 text-xs font-body"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <p className="font-medium text-ivory text-sm">{guest.guest_name}</p>
                      <p className="text-[11px] text-ivory/40">
                        {guest.table_number || 'General'}
                        <span className="ml-2 font-mono text-gold-500/40">[{guest.invite_code}]</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-mono text-xs">
                      {formatCheckInTime(guest.checked_in_at) || 'Checked in'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* COLLAPSIBLE ALL GUESTS DIRECTORY */}
        <section className="glass-dark border border-gold-500/20 p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl text-ivory font-medium">
                Guest Directory & Roster
              </h2>
              <p className="font-body text-xs text-ivory/40">
                Browse and filter complete guest list ({stats.total} total)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDirectory(!showDirectory)}
              className="px-4 py-2 border border-gold-500/30 hover:border-gold-500 text-gold-400 font-body text-xs uppercase tracking-wider transition-colors"
            >
              {showDirectory ? '▲ Hide Directory' : '▼ View Directory'}
            </button>
          </div>

          {showDirectory && (
            <div className="mt-6 pt-6 border-t border-gold-500/20 space-y-4">
              {/* Filter controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(['all', 'checked_in', 'pending'] as const).map((filterType) => (
                    <button
                      key={filterType}
                      type="button"
                      onClick={() => {
                        setDirectoryFilter(filterType)
                        setDirectoryPage(1)
                      }}
                      className={`px-3 py-1.5 text-xs font-body uppercase tracking-wider border transition-colors ${
                        directoryFilter === filterType
                          ? 'bg-gold-500 text-obsidian border-gold-500 font-bold'
                          : 'border-gold-500/20 text-ivory/50 hover:text-ivory'
                      }`}
                    >
                      {filterType === 'all'
                        ? `All (${stats.total})`
                        : filterType === 'checked_in'
                        ? `Checked In (${stats.checkedIn})`
                        : `Pending (${stats.remaining})`}
                    </button>
                  ))}
                </div>

                {/* Directory quick filter */}
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    value={directorySearch}
                    onChange={(e) => {
                      setDirectorySearch(e.target.value)
                      setDirectoryPage(1)
                    }}
                    placeholder="Filter by name..."
                    className="w-full px-3 py-1.5 bg-obsidian border border-gold-500/20 text-xs text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              {/* Table / List */}
              {directoryLoading ? (
                <div className="py-12 text-center text-ivory/40 text-xs">
                  <div className="w-6 h-6 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2" />
                  Loading directory records...
                </div>
              ) : directoryGuests.length === 0 ? (
                <p className="py-8 text-center text-xs text-ivory/40">
                  No records match the selected filter.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-body text-xs">
                    <thead>
                      <tr className="border-b border-gold-500/20 text-gold-400/70 text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-3">Guest</th>
                        <th className="py-2.5 px-3 hidden sm:table-cell">Table</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 hidden md:table-cell">Time</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/10">
                      {directoryGuests.map((g) => (
                        <tr key={g.id} className="hover:bg-gold-500/5 transition-colors">
                          <td className="py-3 px-3">
                            <p className="font-medium text-ivory text-sm">{g.guest_name}</p>
                            <p className="text-[10px] text-ivory/40 font-mono">{g.invite_code}</p>
                          </td>
                          <td className="py-3 px-3 hidden sm:table-cell text-ivory/60">
                            {g.table_number || 'To Be Assigned'}
                          </td>
                          <td className="py-3 px-3">
                            {g.checked_in ? (
                              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-semibold">
                                ✓ Checked In
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gold-500/10 text-gold-400 border border-gold-500/30 text-[10px]">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 hidden md:table-cell text-ivory/40 font-mono">
                            {formatCheckInTime(g.checked_in_at) || '—'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {g.checked_in ? (
                              <span className="text-[10px] text-ivory/30 uppercase tracking-wider">Done</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleCheckIn(g.invite_code)}
                                disabled={checkingInCode === g.invite_code}
                                className="px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-obsidian text-[10px] uppercase font-bold tracking-wider disabled:opacity-50"
                              >
                                {checkingInCode === g.invite_code ? '...' : 'Check In'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between pt-3 border-t border-gold-500/10 text-xs font-body text-ivory/40">
                <span>
                  Showing {directoryGuests.length} of {directoryTotal} guests
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDirectoryPage(p => Math.max(1, p - 1))}
                    disabled={directoryPage <= 1 || directoryLoading}
                    className="px-2.5 py-1 border border-gold-500/20 hover:border-gold-500 text-ivory disabled:opacity-30"
                  >
                    ← Prev
                  </button>
                  <span className="font-mono">Page {directoryPage}</span>
                  <button
                    type="button"
                    onClick={() => setDirectoryPage(p => p + 1)}
                    disabled={directoryPage * 20 >= directoryTotal || directoryLoading}
                    className="px-2.5 py-1 border border-gold-500/20 hover:border-gold-500 text-ivory disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-gold-500/10 text-center font-body text-[10px] text-ivory/20 tracking-widest uppercase">
        Luxe Invite Event-Day Operations Dashboard · Private & Confidential
      </footer>
    </div>
  )
}
