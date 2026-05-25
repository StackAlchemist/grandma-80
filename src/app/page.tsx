'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const features = [
  {
    icon: '◈',
    title: 'Personal Invitations',
    desc: 'Each guest receives a unique, non-transferable digital invitation crafted exclusively for them.',
  },
  {
    icon: '⬡',
    title: 'QR-Secured Entry',
    desc: 'A bespoke QR code is embedded in every invitation, ensuring seamless and secure event access.',
  },
  {
    icon: '◉',
    title: 'One-Time Access',
    desc: 'Each code activates precisely once. Your guest list remains private, controlled, and inviolable.',
  },
]

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-obsidian overflow-hidden font-body">
      {/* Background radial glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gold-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gold-700/5 blur-[100px]" />
      </div>

      {/* Top bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-gold-500/10"
      >
        <div className="font-display text-gold-400 tracking-[0.3em] text-sm uppercase">
          Grandma@80
        </div>
        <Link
          href="/scanner"
          className="font-body text-xs tracking-widest uppercase text-gold-400/60 hover:text-gold-400 transition-colors duration-300 border border-gold-500/20 hover:border-gold-500/50 px-4 py-2"
        >
          Staff Scanner →
        </Link>
      </motion.header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-32">
        {/* Ornamental top */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex items-center gap-4 mb-10"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500/60" />
          <span className="text-gold-400 text-xs tracking-[0.5em] uppercase font-body">
            By Invitation Only
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500/60" />
        </motion.div>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-6"
        >
          <span className="text-gold-gradient block">An Evening</span>
          <span className="text-ivory/90 italic block">of Elegance</span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="font-body text-ivory/50 text-sm md:text-base tracking-widest uppercase mt-6 mb-2"
        >
          In Honour of
        </motion.p>

        <motion.p
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="font-display text-4xl md:text-5xl text-gold-300 italic mb-12"
        >
          Mama Grace
        </motion.p>

        <motion.p
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-lg text-ivory/40 text-sm leading-relaxed font-body"
        >
          A celebration of eighty extraordinary years. Family. Legacy. Love.
          Each guest holds a personal key to this sacred evening.
        </motion.p>

        {/* CTA */}
        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-14 flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/invite/k9x221"
            className="group relative px-10 py-4 bg-gold-500 text-obsidian font-body text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold-400 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">View Sample Invite</span>
            <div className="absolute inset-0 bg-gold-300 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
          </Link>
          <Link
            href="/scanner"
            className="px-10 py-4 border border-gold-500/30 text-gold-400 font-body text-xs tracking-[0.3em] uppercase hover:border-gold-500/70 hover:text-gold-300 transition-all duration-300"
          >
            Staff Check-In
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Ornament */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent mb-20"
          />

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group p-8 border border-gold-500/10 hover:border-gold-500/30 transition-all duration-500 gold-border-glow"
              >
                <div className="text-gold-400 text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {f.icon}
                </div>
                <h3 className="font-display text-2xl text-ivory/90 mb-3">{f.title}</h3>
                <p className="font-body text-ivory/40 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 py-24 border-t border-gold-500/10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="font-display text-5xl md:text-6xl text-gold-gradient mb-6"
          >
            How It Works
          </motion.h2>
          <motion.p
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-ivory/40 font-body text-sm tracking-wide mb-16"
          >
            Three steps. Zero compromise.
          </motion.p>

          <div className="space-y-1">
            {[
              { step: '01', title: 'Receive Your Invitation', desc: 'A private link is shared directly with you. No public access. No duplicates.' },
              { step: '02', title: 'Present Your QR Code', desc: 'Your invitation displays a unique QR code. Show it at the entrance on your device.' },
              { step: '03', title: 'Seamless Entry', desc: 'Staff scan your code once. It activates instantly and can never be reused.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                custom={i + 2}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex items-start gap-8 p-8 border-l-2 border-gold-500/20 hover:border-gold-500/60 transition-colors duration-500 text-left"
              >
                <span className="font-display text-6xl text-gold-500/20 leading-none shrink-0 countdown-digit">
                  {item.step}
                </span>
                <div>
                  <h4 className="font-display text-2xl text-ivory/90 mb-2">{item.title}</h4>
                  <p className="font-body text-ivory/40 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-gold-500/10 text-center">
        <p className="font-display italic text-gold-400/40 text-sm">
          &ldquo;Some celebrations are meant to be remembered forever.&rdquo;
        </p>
        <p className="font-body text-ivory/20 text-xs mt-4 tracking-widest uppercase">
          Luxe Invite · Private Event System
        </p>
      </footer>
    </main>
  )
}
