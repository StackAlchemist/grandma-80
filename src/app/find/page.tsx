import type { Metadata } from 'next'
import Link from 'next/link'
import { FindForm } from '@/components/find/FindForm'
import { EVENT_CONFIG } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Find Your Invitation — Margaret Olusola Odusoga JP. @ 80',
  description: 'Search for and access your private digital invitation.',
}

export default function FindPage() {
  return (
    <main className="relative min-h-screen bg-obsidian text-ivory font-body flex flex-col justify-between overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gold-500/5 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-gold-700/5 blur-[100px]" />
      </div>

      {/* Top navigation bar */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6 border-b border-gold-500/10">
        <Link
          href="/"
          className="font-display text-gold-400 tracking-[0.3em] text-sm uppercase hover:text-gold-300 transition-colors"
        >
          Grandma@80
        </Link>
        <Link
          href="/"
          className="font-body text-[10px] sm:text-xs tracking-widest uppercase text-gold-400/60 hover:text-gold-400 transition-colors duration-300 border border-gold-500/20 hover:border-gold-500/50 px-4 py-2"
        >
          ← Home
        </Link>
      </header>

      {/* Center content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        <FindForm />
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-gold-500/10 text-center space-y-2">
        <p className="font-display italic text-gold-400/50 text-xs sm:text-sm">
          &ldquo;Reflecting on a lifetime of grace & thanksgiving for 80 beautiful years.&rdquo;
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-ivory/25 font-body text-[10px] tracking-widest uppercase">
          <span>
            Technology Partner:{' '}
            <a
              href="https://wa.me/2348076808189"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400/70 hover:text-gold-300 transition-colors"
            >
              Seraph Technologies
            </a>
          </span>
          <span className="hidden sm:inline text-gold-500/30">·</span>
          <a
            href="tel:+2348076808189"
            className="hover:text-gold-400/80 transition-colors tracking-wider"
          >
            +234 807 680 8189
          </a>
        </div>
      </footer>
    </main>
  )
}

