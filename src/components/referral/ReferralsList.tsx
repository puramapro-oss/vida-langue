'use client'

import { Share2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'

interface VidaReferral {
  id: string
  referrer_id: string
  referred_id: string
  referral_code: string
  status: 'pending' | 'subscribed' | 'churned'
  referrer_earning_cents: number | null
  created_at: string
}

interface ReferralsListProps {
  referrals: VidaReferral[]
}

export default function ReferralsList({ referrals }: ReferralsListProps) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Tes filleuls</h2>
      {referrals.length === 0 ? (
        <EmptyState
          icon={<Share2 className="h-12 w-12" />}
          title="Personne n'a encore cliqué sur ton lien"
          description="Partage-le sur WhatsApp à un ami qui galère avec une langue. C'est le geste le plus rentable que tu peux faire ce mois-ci."
        />
      ) : (
        <div className="space-y-2">
          {referrals.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-lg bg-white/[0.02] hover:bg-white/[0.04] p-3 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[var(--text-primary)]">
                  Filleul #{r.referred_id.slice(0, 8)}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">{formatDate(r.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                {(r.referrer_earning_cents ?? 0) > 0 && (
                  <span className="text-sm font-semibold text-[var(--green)]">
                    +{((r.referrer_earning_cents ?? 0) / 100).toFixed(2)}€
                  </span>
                )}
                <Badge
                  variant={
                    r.status === 'subscribed' ? 'green' : r.status === 'churned' ? 'default' : 'default'
                  }
                >
                  {r.status === 'subscribed' ? 'Abonné' : r.status === 'churned' ? 'Parti' : 'En attente'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
