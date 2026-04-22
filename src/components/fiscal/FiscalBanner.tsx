'use client'

import Link from 'next/link'
import { Info } from 'lucide-react'

interface FiscalBannerProps {
  totalEarningsCents: number
}

const THRESHOLDS = [
  { cents: 150000, label: '1500 €', regime: 'Micro-BNC simplifié' },
  { cents: 250000, label: '2500 €', regime: 'Déclaration 2042 C PRO' },
  { cents: 300000, label: '3000 €', regime: 'Régime réel recommandé' },
]

/**
 * FiscalBanner VEDA — /fiscal P4.
 * Affiche discrètement le seuil fiscal atteint par l'apprenant.
 * 0 alarmisme : info factuelle + CTA /fiscal pour détails.
 */
export default function FiscalBanner({ totalEarningsCents }: FiscalBannerProps) {
  if (totalEarningsCents <= 0) return null

  const crossed = THRESHOLDS.filter((t) => totalEarningsCents >= t.cents)
  const next = THRESHOLDS.find((t) => totalEarningsCents < t.cents)

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.04] p-5 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 flex-shrink-0 text-cyan-300" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-cyan-100">
            Tes gains cumulés · {(totalEarningsCents / 100).toFixed(2)} €
          </p>
          {crossed.length > 0 && (
            <p className="mt-1 text-xs text-cyan-200/80">
              Seuil franchi : <strong>{crossed[crossed.length - 1].label}</strong> · {crossed[crossed.length - 1].regime}.
            </p>
          )}
          {next && (
            <p className="mt-1 text-xs text-cyan-200/70">
              Prochain palier : {next.label} ({next.regime}).
            </p>
          )}
          <Link
            href="/fiscal"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-cyan-300 hover:text-cyan-200"
          >
            Voir le guide fiscal VEDA →
          </Link>
        </div>
      </div>
    </div>
  )
}
