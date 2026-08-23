'use client'

import { ArrowRight } from 'lucide-react'
import MagneticButton from '@/components/landing/MagneticButton'

export default function FuturePraise() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-xl sm:p-12">
          <div className="text-center">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ils gravent leur langue avec VEDA
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Bientôt : retours des premiers apprenants. Pas d&apos;avis inventés, pas de témoignages fabriqués.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                aria-hidden
                className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5"
                style={{ filter: 'blur(8px)', opacity: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-400/30" />
                  <div className="space-y-1.5">
                    <div className="h-2 w-16 rounded-full bg-white/30" />
                    <div className="h-2 w-12 rounded-full bg-white/20" />
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  <div className="h-1.5 w-full rounded-full bg-white/20" />
                  <div className="h-1.5 w-5/6 rounded-full bg-white/20" />
                  <div className="h-1.5 w-2/3 rounded-full bg-white/20" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <MagneticButton
              href="/signup"
              className="h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(16,185,129,0.35)] hover:from-emerald-400 hover:to-teal-400 transition-colors"
              ariaLabel="Rejoins les premiers apprenants"
            >
              Rejoins les premiers apprenants
              <ArrowRight className="ml-2 h-4 w-4" />
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  )
}
