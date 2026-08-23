'use client'

import { Crown } from 'lucide-react'
import Card from '@/components/ui/Card'

interface Tier {
  id: string
  label: string
  min: number
  color: string
}

interface TierProgressProps {
  currentTier: Tier
  nextTier: Tier
  conversions: number
}

export default function TierProgress({ currentTier, nextTier, conversions }: TierProgressProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-5 w-5" style={{ color: currentTier.color }} />
          <span className="text-sm text-[var(--text-primary)]">
            {currentTier.label} → {nextTier.label}
          </span>
        </div>
        <span className="text-sm text-[var(--text-muted)]">
          {conversions}/{nextTier.min} filleuls
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, (conversions / nextTier.min) * 100)}%`,
            backgroundColor: nextTier.color,
          }}
        />
      </div>
    </Card>
  )
}
