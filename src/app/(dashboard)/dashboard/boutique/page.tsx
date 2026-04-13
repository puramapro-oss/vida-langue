'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Coins, Tag, Ticket, Gift, DollarSign, Star } from 'lucide-react'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'

interface ShopItem {
  id: string
  category: string
  name: string
  description: string | null
  cost_points: number
  value_description: string | null
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Tag; color: string; label: string }> = {
  reduction: { icon: Tag, color: '#10B981', label: 'Reductions' },
  subscription: { icon: Star, color: '#8B5CF6', label: 'Abonnements' },
  ticket: { icon: Ticket, color: '#F59E0B', label: 'Tickets' },
  feature: { icon: Gift, color: '#06B6D4', label: 'Bonus' },
  cash: { icon: DollarSign, color: '#22C55E', label: 'Euros' },
}

export default function BoutiquePage() {
  const { profile } = useAuth()
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string | null>(null)
  const [points, setPoints] = useState(0)

  useEffect(() => {
    setPoints(profile?.purama_points ?? 0)
  }, [profile?.purama_points])

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/boutique')
      const data = (await res.json()) as { items: ShopItem[] }
      setItems(data.items ?? [])
      setLoading(false)
    }
    void load()
  }, [])

  const handleBuy = async (item: ShopItem) => {
    if (points < item.cost_points) {
      toast.error(`Points insuffisants. Il te faut ${item.cost_points} points.`)
      return
    }

    setBuying(item.id)
    try {
      const res = await fetch('/api/boutique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: item.id }),
      })
      const data = (await res.json()) as { success?: boolean; remaining_points?: number; error?: string }

      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Achat impossible.')
        return
      }

      setPoints(data.remaining_points ?? 0)
      toast.success(`${item.name} achete ! 🎉`)
    } catch {
      toast.error('Erreur. Reessaie.')
    } finally {
      setBuying(null)
    }
  }

  // Group by category
  const grouped = items.reduce<Record<string, ShopItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            Boutique Points
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Depense tes Purama Points pour des reductions, des bonus et plus.
          </p>
        </div>
        <Card className="px-4 py-2.5 flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-lg font-bold text-[var(--text-primary)]">
            {points.toLocaleString('fr-FR')}
          </span>
          <span className="text-xs text-[var(--text-muted)]">pts</span>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center">
          <ShoppingBag className="w-10 h-10 text-emerald-400/30 mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">La boutique est vide pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, catItems]) => {
            const config = CATEGORY_CONFIG[category] ?? { icon: Gift, color: '#10B981', label: category }
            const Icon = config.icon
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    {config.label}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catItems.map((item) => {
                    const canAfford = points >= item.cost_points
                    return (
                      <Card key={item.id} className="p-4 flex flex-col">
                        <div className="flex-1 mb-3">
                          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            <span className={`text-sm font-bold ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>
                              {item.cost_points.toLocaleString('fr-FR')}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant={canAfford ? 'primary' : 'secondary'}
                            disabled={!canAfford || buying === item.id}
                            loading={buying === item.id}
                            onClick={() => void handleBuy(item)}
                            data-testid={`btn-buy-${item.id}`}
                          >
                            {canAfford ? 'Acheter' : 'Pas assez'}
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
