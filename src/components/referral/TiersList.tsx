'use client'

import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { REFERRAL_TIERS } from '@/lib/referral-tiers'

interface TiersListProps {
  subscribed: number
}

export default function TiersList({ subscribed }: TiersListProps) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Paliers VEDA</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REFERRAL_TIERS.map((t) => {
          const reached = subscribed >= t.min
          return (
            <div
              key={t.tier}
              className={cn(
                'rounded-xl border p-4 transition-all',
                reached
                  ? 'border-[var(--green)]/30 bg-[var(--green)]/5'
                  : 'border-white/[0.06] bg-white/[0.02]',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold" style={{ color: t.color }}>{t.label}</span>
                <Badge variant={reached ? 'green' : 'default'}>
                  {t.min === 0 ? 'Départ' : `${t.min} filleuls`}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">{t.perk}</p>
              {reached && t.min > 0 && (
                <p className="mt-1 text-xs text-[var(--green)] font-medium">✓ Débloqué</p>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
