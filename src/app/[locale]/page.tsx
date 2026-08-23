'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Volume2, Mic, Brain, ArrowRight } from 'lucide-react'
import CursorGlow from '@/components/landing/CursorGlow'
import MagneticButton from '@/components/landing/MagneticButton'
import Nav from '@/components/landing/Nav'
import LiveStats from '@/components/landing/LiveStats'
import Footer from '@/components/landing/Footer'
import Modes from '@/components/landing/Modes'
import Method from '@/components/landing/Method'
import ScrollPunchline from '@/components/landing/ScrollPunchline'
import PricingTeaser from '@/components/landing/PricingTeaser'
import FuturePraise from '@/components/landing/FuturePraise'
import FinalCTA from '@/components/landing/FinalCTA'
import Faq from '@/components/landing/Faq'

// Hero3D = lourd → ssr:false + dynamic + idle-deferred mount (LCP-friendly)
const Hero3D = dynamic(() => import('@/components/landing/Hero3D'), {
  ssr: false,
  loading: () => null,
})

function DeferredHero3D() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
    }
    const w = window as IdleWindow
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 2000 })
      return () => {
        const wc = window as IdleWindow & { cancelIdleCallback?: (id: number) => void }
        wc.cancelIdleCallback?.(id)
      }
    }
    const t = setTimeout(() => setReady(true), 1500)
    return () => clearTimeout(t)
  }, [])
  if (!ready) return null
  return <Hero3D />
}

// Nav extracted to @/components/landing/Nav
// LiveStats extracted to @/components/landing/LiveStats
// Modes extracted to @/components/landing/Modes
// Method extracted to @/components/landing/Method
// ScrollPunchline extracted to @/components/landing/ScrollPunchline
// PricingTeaser extracted to @/components/landing/PricingTeaser
// FuturePraise extracted to @/components/landing/FuturePraise
// FinalCTA extracted to @/components/landing/FinalCTA
// Faq extracted to @/components/landing/Faq

// ─── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* Couches background : aurora + grille + noise + blobs + 3D */}
      <div aria-hidden className="aurora-rich">
        <span />
      </div>
      <div aria-hidden className="grid-overlay absolute inset-0" />
      <div aria-hidden className="noise-overlay absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[140px]" />
        <div className="absolute right-[-10%] top-1/3 h-[420px] w-[420px] rounded-full bg-teal-400/10 blur-[120px]" />
        <div className="absolute left-[-10%] bottom-0 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* Sphère 3D en arrière-plan, ssr:false + idle-deferred (LCP-friendly) */}
      <DeferredHero3D />

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Nouvelle méthode — 14 jours offerts
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-8 font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl"
          >
            Parle une langue<br />
            <span className="hue-shift">en 30 jours.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-lg text-[var(--text-secondary)] sm:text-xl"
          >
            VEDA grave les langues dans ton cerveau par la phonétique, la voix
            et l&apos;immersion. Guidée par <span className="text-emerald-300 font-semibold">NAMA-Polyglotte</span>.
            Sans cours. Sans stress. Sans théorie.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <MagneticButton
              href="/signup"
              className="group h-12 gap-2 rounded-full bg-white px-6 text-sm font-semibold text-emerald-950 shadow-[0_8px_32px_rgba(16,185,129,0.25)] hover:bg-emerald-50 transition-colors"
              ariaLabel="Commencer 14 jours offerts"
            >
              Commencer 14 jours offerts
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </MagneticButton>
            <MagneticButton
              href="#modes"
              className="h-12 rounded-full border border-white/15 bg-white/[0.03] px-6 text-sm font-medium text-white hover:bg-white/[0.06] transition-colors"
              strength={0.18}
              ariaLabel="Voir les 8 modes"
            >
              Voir les 8 modes
            </MagneticButton>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 text-xs text-[var(--text-muted)]"
          >
            Sans carte bancaire · Annulation 1 clic · 50+ langues
          </motion.p>
        </div>

        {/* Teaser 3 modes phares */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {[
            { icon: Volume2, name: 'Natif Instinct', tag: 'Phonétique 3 couches' },
            { icon: Mic, name: 'HoloTalk', tag: 'Voix vivante · mémoire longue' },
            { icon: Brain, name: 'NeuroFlow', tag: 'État flow profond' },
          ].map((m) => {
            const Ic = m.icon
            return (
              <a
                key={m.name}
                href="#modes"
                className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 backdrop-blur-xl transition-all hover:border-emerald-400/30 hover:bg-white/[0.04]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
                  <Ic className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{m.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{m.tag}</p>
                </div>
              </a>
            )
          })}
        </motion.div>

        {/* Stats animées (DB live, jamais de faux chiffre) */}
        <LiveStats />
      </div>
    </section>
  )
}

// NewsletterForm extracted to @/components/landing/NewsletterForm
// Footer extracted to @/components/landing/Footer

// ─── Page principale ────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg-void)] text-white">
      <CursorGlow />
      <Nav />
      <Hero />
      <Modes />
      <Method />
      <ScrollPunchline />
      <PricingTeaser />
      <FuturePraise />
      <FinalCTA />
      <Faq />
      <Footer />
    </main>
  )
}
