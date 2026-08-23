'use client'

import { ArrowRight } from 'lucide-react'
import MagneticButton from '@/components/landing/MagneticButton'

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-32">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.18) 0%, rgba(16,185,129,0.06) 35%, transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Une langue. 30 jours.<br />
          <span className="hue-shift">Aujourd&apos;hui.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base text-[var(--text-secondary)] sm:text-lg">
          NAMA-Polyglotte t&apos;attend. 14 jours offerts. Aucun engagement.
        </p>
        <div className="mt-10 flex justify-center">
          <MagneticButton
            href="/signup"
            className="h-14 gap-2 rounded-full bg-white px-8 text-base font-semibold text-emerald-950 shadow-[0_12px_40px_rgba(16,185,129,0.35)] hover:bg-emerald-50 transition-colors"
            ariaLabel="Commencer maintenant"
          >
            Commencer maintenant
            <ArrowRight className="h-5 w-5" />
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
