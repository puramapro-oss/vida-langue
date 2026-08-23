'use client'

import { Users, TrendingUp, Award, Sparkles } from 'lucide-react'
import Card from '@/components/ui/Card'

interface Tier {
  tier: string
  min: number
  label: string
  color: string
  perk: string
}

interface StatCardsProps {
  subscribed: number
  totalReferrals: number
  totalEarnings: number
  currentTier: Tier
  nextTier: Tier | undefined
  progressPercent: number
}

export default function StatCards({
  subscribed,
  totalReferrals,
  totalEarnings,
  currentTier,
  nextTier,
  progressPercent,
}: StatCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--green)]/10">
            <Users className="h-5 w-5 text-[var(--green)]" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Filleuls actifs</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{subscribed}</p>
            <p className="text-xs text-[var(--text-muted)]">{totalReferrals} clics totaux</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Gains</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{totalEarnings.toFixed(2)}€</p>
            <p className="text-xs text-[var(--text-muted)]">Versé sur ton wallet VEDA</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${currentTier.color}20` }}
          >
            <Award className="h-5 w-5" style={{ color: currentTier.color }} />
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Palier actuel</p>
            <p className="text-xl font-bold" style={{ color: currentTier.color }}>{currentTier.label}</p>
            <p className="text-xs text-[var(--text-muted)]">{currentTier.perk}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-[var(--text-secondary)]">Prochain palier</p>
            {nextTier ? (
              <>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {nextTier.min - subscribed} <span className="text-sm font-normal">restant{nextTier.min - subscribed > 1 ? 's' : ''}</span>
                </p>
                <div className="mt-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%`, background: nextTier.color }}
                  />
                </div>
              </>
            ) : (
              <p className="text-xl font-bold text-[var(--green)]">Légende atteinte 🌟</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
