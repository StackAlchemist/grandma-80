'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  targetDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(targetDate: string): TimeLeft {
  const target = new Date(targetDate).getTime()
  const now = Date.now()
  const diff = Math.max(0, target - now)

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const id = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (!mounted) return null

  const isExpired = Object.values(timeLeft).every(v => v === 0)

  if (isExpired) {
    return (
      <div className="text-center py-4">
        <p className="font-display italic text-gold-400 text-xl">The evening is upon us</p>
      </div>
    )
  }

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.seconds },
  ]

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-2 sm:gap-4">
          <div className="flex flex-col items-center">
            <div className="glass px-3 py-2 sm:px-4 sm:py-3 min-w-[52px] sm:min-w-[64px] text-center">
              <span className="font-display text-2xl sm:text-3xl text-gold-300 countdown-digit">
                {pad(unit.value)}
              </span>
            </div>
            <span className="font-body text-[10px] tracking-widest uppercase text-ivory/30 mt-1.5">
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="font-display text-gold-500/50 text-xl mb-4">:</span>
          )}
        </div>
      ))}
    </div>
  )
}
