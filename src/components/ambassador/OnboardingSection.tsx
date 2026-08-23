'use client'

import { Link2, TrendingUp, Wallet, Megaphone } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { APP_NAME } from '@/lib/constants'

interface Tier {
  id: string
  label: string
  min: number
  commission: string
  color: string
  perk: string
}

interface OnboardingSectionProps {
  tiers: Tier[]
  registering: boolean
  onRegister: () => void
}

export default function OnboardingSection({ tiers, registering, onRegister }: OnboardingSectionProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <Megaphone className="mx-auto h-16 w-16 text-[var(--green)]" />
        <h1 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">
          Deviens Ambassadeur {APP_NAME}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-[var(--text-secondary)]">
          Programme ouvert à tous, sans validation. <span className="text-[var(--green)] font-semibold">50%</span> du
          premier paiement + <span className="text-[var(--green)] font-semibold">10%</span> à vie sur chaque filleul.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Link2, label: 'Lien promo -50%', desc: 'Ton filleul a 50% de réduction pendant 7 jours' },
          { icon: TrendingUp, label: '50% + 10% à vie', desc: 'Commission récurrente tant qu\'il est abonné' },
          { icon: Wallet, label: 'Retrait IBAN dès 5€', desc: 'Versé sur ton wallet VEDA automatiquement' },
        ].map(({ icon: Icon, label, desc }) => (
          <Card key={label} className="p-4 text-center">
            <Icon className="mx-auto mb-2 h-8 w-8 text-[var(--green)]" />
            <p className="font-medium text-[var(--text-primary)]">{label}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{desc}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Paliers de commissions</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {tiers.map(({ label, min, commission, color }) => (
            <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <p className="text-sm font-bold" style={{ color }}>{label}</p>
              <p className="text-xs text-[var(--text-muted)]">{min}+ filleuls</p>
              <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{commission}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="text-center">
        <Button onClick={onRegister} disabled={registering} size="lg">
          {registering ? 'Inscription...' : 'Rejoindre en 1 clic'}
        </Button>
      </div>
    </div>
  )
}
