'use client'

import Link from 'next/link'

interface SubscriptionRow {
  status: string
  plan: string
  current_period_end: string | null
  cancel_at_period_end: boolean | null
  price_cents: number
  trial_ends_at: string | null
}

interface Props {
  sub: SubscriptionRow | null
}

export default function PlanCard({ sub }: Props) {
  if (!sub) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        Tu n&apos;as pas encore d&apos;abonnement.{' '}
        <Link href="/pricing" className="text-emerald-300 hover:text-emerald-200">
          Voir les formules
        </Link>
        .
      </p>
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-[var(--text-secondary)]">Statut</p>
        <p className="text-sm font-semibold text-white">
          {sub.status === 'active'
            ? 'Actif'
            : sub.status === 'trialing'
              ? `Essai (fin ${new Date(sub.trial_ends_at ?? '').toLocaleDateString('fr-FR')})`
              : sub.status}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-[var(--text-secondary)]">Formule</p>
        <p className="text-sm font-semibold text-white">
          {sub.plan} · {(sub.price_cents / 100).toFixed(2)} € / période
        </p>
      </div>
      {sub.current_period_end && (
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-[var(--text-secondary)]">Prochaine échéance</p>
          <p className="text-sm font-semibold text-white">
            {new Date(sub.current_period_end).toLocaleDateString('fr-FR')}
            {sub.cancel_at_period_end ? ' · annulation demandée' : ''}
          </p>
        </div>
      )}
    </>
  )
}
