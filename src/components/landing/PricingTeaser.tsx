'use client'

import { Check, Leaf } from 'lucide-react'
import MagneticButton from '@/components/landing/MagneticButton'

export default function PricingTeaser() {
  const perks = [
    'Accès aux 8 modes',
    '50+ langues disponibles',
    'HoloTalk voix illimité',
    'SleepSync & Hypno-Immersif',
    'Voix immersive multilingue',
    'Annulation en 1 clic',
  ] as const

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-8 backdrop-blur-xl sm:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-[100px]" />
          <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-teal-400/10 blur-[80px]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <Leaf className="h-3 w-3" strokeWidth={2.5} />
              Essai 14 jours offerts
            </div>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
              12,90 € / mois.<br />
              <span className="text-[var(--text-secondary)]">Sans engagement.</span>
            </h2>
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <MagneticButton
                href="/signup"
                className="h-12 rounded-full bg-white px-6 text-sm font-semibold text-emerald-950 hover:bg-emerald-50 transition-colors"
                ariaLabel="Commencer 14 jours offerts"
              >
                Commencer — 14 jours offerts
              </MagneticButton>
              <MagneticButton
                href="/pricing"
                strength={0.18}
                className="h-12 rounded-full border border-white/15 px-6 text-sm font-medium text-white hover:bg-white/[0.04] transition-colors"
                ariaLabel="Voir tous les plans"
              >
                Voir tous les plans
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
