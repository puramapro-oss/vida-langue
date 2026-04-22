'use client'

import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface PrimeTrackerProps {
  primeAmountCents: number
  grantedAt: string | null
  unlockedAt: string | null
  cancelledAt?: string | null
}

/**
 * PrimeTracker VEDA — Paiement V7.1.
 * Affiche le statut de la prime de bienvenue 20€ :
 * - En cours : J+X/30 avec barre de progression
 * - Débloquée : montant utilisable
 * - Annulée : récupérée (si user a annulé avant J+30)
 */
export default function PrimeTracker({
  primeAmountCents,
  grantedAt,
  unlockedAt,
  cancelledAt,
}: PrimeTrackerProps) {
  if (cancelledAt) {
    return (
      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.04] p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-100">Prime récupérée</p>
            <p className="mt-1 text-xs text-amber-200/70">
              Conformément aux CGV, l'annulation avant le 30ème jour déduit la prime de bienvenue.
              Aucune retenue au-delà de la prime elle-même.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (unlockedAt) {
    return (
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.04] p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-100">
              Prime débloquée · {(primeAmountCents / 100).toFixed(2)} €
            </p>
            <p className="mt-1 text-xs text-emerald-200/70">
              Elle est utilisable dès maintenant (retrait IBAN ou boutique).
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!grantedAt) return null

  const granted = new Date(grantedAt).getTime()
  const now = Date.now()
  const elapsedDays = Math.floor((now - granted) / (24 * 60 * 60 * 1000))
  const daysRemaining = Math.max(0, 30 - elapsedDays)
  const progress = Math.min(100, Math.round((elapsedDays / 30) * 100))

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 flex-shrink-0 text-emerald-300" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            Prime de bienvenue · {(primeAmountCents / 100).toFixed(2)} €
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Débloquée dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} (J+{elapsedDays}/30)
          </p>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-[11px] text-[var(--text-muted)]">
        Anti-abus : la prime devient transférable après 30 jours d'abonnement continu. 1 par compte à vie.
      </p>
    </div>
  )
}
