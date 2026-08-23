'use client'

import { Star } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface Tier {
  id: string
  label: string
  min: number
  commission: string
  color: string
  perk: string
}

interface TiersTabProps {
  tiers: Tier[]
  currentTier: Tier
  currentTierIdx: number
  conversions: number
  palierEuros: Array<{ signups: number; bonus: number }>
}

export default function TiersTab({ tiers, currentTier, currentTierIdx, conversions, palierEuros }: TiersTabProps) {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Paliers de commission</h3>
        <div className="space-y-2">
          {tiers.map((tier, idx) => {
            const isActive = tier.id === currentTier.id
            const isPassed = idx < currentTierIdx
            return (
              <div
                key={tier.id}
                className={cn(
                  'flex items-center gap-4 rounded-xl border p-4 transition-all',
                  isActive ? 'border-[var(--green)]/30 bg-[var(--green)]/5' :
                  isPassed ? 'border-emerald-500/20 bg-emerald-500/5' :
                  'border-white/[0.06] bg-white/[0.02]'
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${tier.color}20` }}>
                  <Star className="h-5 w-5" style={{ color: tier.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-[var(--text-primary)]">{tier.label}</p>
                    {isActive && <Badge variant="green">Actuel</Badge>}
                    {isPassed && <Badge variant="default">Atteint</Badge>}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {tier.min}+ filleuls — {tier.perk}
                  </p>
                </div>
                <span className="text-sm font-bold text-right" style={{ color: tier.color }}>{tier.commission}</span>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Bonus en euros</h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {palierEuros.map(({ signups, bonus }) => (
            <div key={signups} className={cn(
              'rounded-lg border p-3 text-center',
              conversions >= signups ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/[0.06] bg-white/[0.02]'
            )}>
              <p className="text-xs text-[var(--text-muted)]">{signups}</p>
              <p className="text-sm font-bold text-[var(--text-primary)]">{bonus}€</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
