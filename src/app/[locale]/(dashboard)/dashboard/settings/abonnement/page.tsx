'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import PrimeTracker from '@/components/wallet/PrimeTracker'
import CancellationWizard from '@/components/subscription/CancellationWizard'

type Step = 'overview' | 'reason' | 'offer' | 'confirm'

interface SubscriptionRow {
  id: string
  status: string
  plan: string
  current_period_end: string | null
  cancel_at_period_end: boolean | null
  price_cents: number
  started_at: string | null
  trial_ends_at: string | null
}

interface PrimeRow {
  amount_cents: number
  granted_at: string | null
  unlocked_at: string | null
  cancelled_at: string | null
}

export default function AbonnementPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [step, setStep] = useState<Step>('overview')
  const [sub, setSub] = useState<SubscriptionRow | null>(null)
  const [prime, setPrime] = useState<PrimeRow | null>(null)
  const [reason, setReason] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      if (subData) setSub(subData as SubscriptionRow)

      const { data: primeData } = await supabase
        .from('welcome_primes')
        .select('amount_cents, granted_at, unlocked_at, cancelled_at')
        .eq('user_id', user.id)
        .maybeSingle()
      if (primeData) setPrime(primeData as PrimeRow)

      setLoading(false)
    }
    void load()
  }, [user, supabase])

  async function openStripePortal() {
    setBusy(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Portail indisponible.')
        setBusy(false)
        return
      }
      window.location.href = data.url
    } catch {
      toast.error('Impossible d\'ouvrir le portail. Réessaie.')
      setBusy(false)
    }
  }

  async function acceptHalfPriceOffer() {
    setBusy(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'half_lifetime' }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Impossible d'activer l'offre.")
        setBusy(false)
        return
      }
      window.location.href = data.url
    } catch {
      toast.error('Erreur serveur.')
      setBusy(false)
    }
  }

  async function confirmCancellation() {
    setBusy(true)
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Annulation impossible.')
        setBusy(false)
        return
      }
      toast.success('Abonnement annulé. Tu gardes accès jusqu\'à la fin de la période.')
      setStep('overview')
      setBusy(false)
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle()
      if (subData) setSub(subData as SubscriptionRow)
    } catch {
      toast.error('Erreur réseau.')
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-2 py-4">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/settings" className="text-sm text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Réglages
        </Link>
      </div>

      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white sm:text-3xl">
        Ton abonnement VEDA
      </h1>

      {step === 'overview' && (
        <div className="space-y-4">
          <Card className="p-6">
            {sub ? (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-[var(--text-secondary)]">Statut</p>
                  <p className="text-sm font-semibold text-white">
                    {sub.status === 'active' ? 'Actif' : sub.status === 'trialing' ? `Essai (fin ${new Date(sub.trial_ends_at ?? '').toLocaleDateString('fr-FR')})` : sub.status}
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
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">
                Tu n&apos;as pas encore d&apos;abonnement. <Link href="/pricing" className="text-emerald-300 hover:text-emerald-200">Voir les formules</Link>.
              </p>
            )}
          </Card>

          {prime && (
            <PrimeTracker
              primeAmountCents={prime.amount_cents}
              grantedAt={prime.granted_at}
              unlockedAt={prime.unlocked_at}
              cancelledAt={prime.cancelled_at}
            />
          )}

          {sub && (
            <Card className="p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Moyens de paiement & factures</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Gère ta carte, IBAN ou PayPal sur Stripe.
                  </p>
                </div>
                <Button variant="secondary" onClick={openStripePortal} disabled={busy}>
                  {busy ? 'Ouverture…' : 'Ouvrir le portail Stripe'}
                </Button>
              </div>
            </Card>
          )}

          {sub && sub.status !== 'cancelled' && !sub.cancel_at_period_end && (
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--text-muted)]" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Besoin de partir ?</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    3 étapes honnêtes. Pas d&apos;appel, pas de justification obligatoire.
                  </p>
                  <button
                    onClick={() => setStep('reason')}
                    className="mt-3 text-xs font-medium text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-secondary)]"
                  >
                    Commencer la procédure d&apos;annulation
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {(step === 'reason' || step === 'offer' || step === 'confirm') && (
        <CancellationWizard
          step={step}
          reason={reason}
          busy={busy}
          onReasonChange={setReason}
          onBack={() => {
            if (step === 'reason') setStep('overview')
            else if (step === 'offer') setStep('reason')
            else if (step === 'confirm') setStep('offer')
          }}
          onContinue={() => {
            if (step === 'reason') setStep('offer')
            else if (step === 'offer') setStep('confirm')
          }}
          onAcceptOffer={acceptHalfPriceOffer}
          onConfirm={confirmCancellation}
        />
      )}
    </main>
  )
}
