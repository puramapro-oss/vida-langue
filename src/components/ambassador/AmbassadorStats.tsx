'use client'

import { Eye, Users, TrendingUp, Wallet } from 'lucide-react'
import Card from '@/components/ui/Card'

interface Props {
  conversions: number
  recurringCount: number
  recurringRevenue: number
  totalRevenue: number
}

export default function AmbassadorStats({
  conversions,
  recurringCount,
  recurringRevenue,
  totalRevenue,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-[var(--green)]" />
          <div>
            <p className="text-xs text-[var(--text-muted)]">Conversions</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{conversions}</p>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-xs text-[var(--text-muted)]">Récurrent</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{recurringCount}</p>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-amber-400" />
          <div>
            <p className="text-xs text-[var(--text-muted)]">Récurrent / mois</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {recurringRevenue.toFixed(2)}€
            </p>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Wallet className="h-5 w-5 text-[var(--green)]" />
          <div>
            <p className="text-xs text-[var(--text-muted)]">Total gagné</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {totalRevenue.toFixed(2)}€
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
