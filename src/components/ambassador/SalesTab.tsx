'use client'

import { TrendingUp } from 'lucide-react'
import Card from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'

interface Sale {
  id: string
  commission_cents: number
  recurring: boolean
  created_at: string
}

interface SalesTabProps {
  sales: Sale[]
  totalRevenue: number
  recurringRevenue: number
}

export default function SalesTab({ sales, totalRevenue, recurringRevenue }: SalesTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-xs text-[var(--text-muted)]">Total gagné</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{totalRevenue.toFixed(2)}€</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[var(--text-muted)]">Récurrent</p>
          <p className="text-2xl font-bold text-[var(--green)]">{recurringRevenue.toFixed(2)}€/mois</p>
        </Card>
      </div>

      <Card className="p-0">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <h3 className="font-semibold text-[var(--text-primary)]">Historique des ventes</h3>
        </div>
        {sales.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)]">
            Aucune vente pour le moment. Partage ton lien et reviens dans 24h.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
            {sales.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--green)]/10">
                  <TrendingUp className="h-4 w-4 text-[var(--green)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--text-primary)]">
                    {s.recurring ? 'Commission récurrente' : 'Commission 1er paiement'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{formatDate(s.created_at)}</p>
                </div>
                <p className="text-sm font-bold text-[var(--green)]">
                  +{(s.commission_cents / 100).toFixed(2)}€
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
