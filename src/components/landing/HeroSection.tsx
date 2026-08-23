'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import MagneticButton from './MagneticButton'
import ScrollRevealText from './ScrollRevealText'
import AnimatedCounter from './AnimatedCounter'

const DeferredHero3D = dynamic(() => import('./Hero3D'), {
  ssr: false,
  loading: () => null,
})

function DeferredHero3DMount() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    const w = window as IdleWindow
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 2000 })
      return () => w.cancelIdleCallback?.(id)
    }
    const t = setTimeout(() => setReady(true), 1500)
    return () => clearTimeout(t)
  }, [])
  if (!ready) return null
  return <DeferredHero3D />
}

interface Props {
  stats: { learners: number; languages: number; sessions: number } | null
}

export default function HeroSection({ stats }: Props) {
  const learners = stats?.learners ?? 0
  const languages = stats?.languages ?? 50
  const sessions = stats?.sessions ?? 0

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <DeferredHero3DMount />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <ScrollRevealText
          text="Parle une nouvelle langue en 30 jours"
          className="mb-6 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
        />
        <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--text-secondary)] md:text-xl">
          Phonétique VEDA adaptée à ta langue maternelle.
          <br />
          Ancrage neurologique 8 canaux. 15 min/jour.
        </p>

        <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-emerald-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-50 hover:shadow-emerald-500/30"
            >
              Commencer gratuitement <ArrowRight className="h-5 w-5" />
            </Link>
          </MagneticButton>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/5"
          >
            Se connecter
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-[var(--text-muted)]">
              <AnimatedCounter end={learners} />+ apprenants
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400/60" />
            <span className="text-[var(--text-muted)]">{languages}+ langues</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400/60" />
            <span className="text-[var(--text-muted)]">
              <AnimatedCounter end={sessions} />+ sessions
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

// Missing import
import dynamic from 'next/dynamic'
