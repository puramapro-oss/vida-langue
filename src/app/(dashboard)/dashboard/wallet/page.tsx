'use client'

import { useCallback, useEffect, useState } from 'react'
import { Wallet, ArrowUpRight, ArrowDownRight, CreditCard, Clock, TrendingUp, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import { WALLET_MIN_WITHDRAWAL } from '@/lib/constants'

interface WalletData {
  balance: number
  total_earned: number
}

interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  created_at: string
}

export default function WalletPage() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawIban, setWithdrawIban] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const supabase = createClient()

  const handleOpenPortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      toast.error(data.error === 'No Stripe customer found'
        ? 'Aucun abonnement actif. Souscris d\'abord depuis /pricing.'
        : 'Impossible d\'ouvrir le portail. Réessaie.')
    } catch {
      toast.error('Erreur de connexion. Vérifie ta connexion internet.')
    } finally {
      setPortalLoading(false)
    }
  }

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [profileRes, refsRes, withdrawalsRes, paymentsRes] = await Promise.all([
      supabase.from('profiles').select('wallet_balance').eq('id', user.id).maybeSingle(),
      supabase
        .from('referrals')
        .select('id, referrer_earning_cents, status, created_at')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('withdrawals')
        .select('id, amount, status, requested_at, iban')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false })
        .limit(50),
      supabase
        .from('payments')
        .select('id, amount_cents, type, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    const balance = Number(profileRes.data?.wallet_balance ?? 0)
    const totalEarned = (refsRes.data ?? [])
      .filter(r => r.status === 'subscribed')
      .reduce((sum, r) => sum + Number(r.referrer_earning_cents ?? 0), 0) / 100
    setWallet({ balance, total_earned: totalEarned })

    const tx: Transaction[] = []
    for (const r of refsRes.data ?? []) {
      const cents = Number(r.referrer_earning_cents ?? 0)
      if (cents > 0 && r.status === 'subscribed') {
        tx.push({
          id: `ref-${r.id}`,
          amount: cents / 100,
          type: 'commission',
          description: 'Commission parrainage (50% du 1er paiement filleul)',
          created_at: r.created_at,
        })
      }
    }
    for (const w of withdrawalsRes.data ?? []) {
      tx.push({
        id: `wd-${w.id}`,
        amount: -Number(w.amount),
        type: 'withdrawal',
        description: `Retrait IBAN — ${w.status === 'pending' ? 'En attente' : w.status === 'processing' ? 'En traitement' : w.status === 'completed' ? 'Versé' : 'Rejeté'} • ${w.iban.slice(0, 4)}…${w.iban.slice(-4)}`,
        created_at: w.requested_at,
      })
    }
    for (const p of paymentsRes.data ?? []) {
      if (p.type === 'subscription' && p.status === 'completed') {
        tx.push({
          id: `pay-${p.id}`,
          amount: -Number(p.amount_cents) / 100,
          type: 'subscription',
          description: 'Abonnement Vida Langue (Stripe)',
          created_at: p.created_at,
        })
      }
    }
    tx.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setTransactions(tx)
    setLoading(false)
  }, [user, supabase])

  useEffect(() => {
    void load()
  }, [load])

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount < WALLET_MIN_WITHDRAWAL) {
      toast.error(`Montant minimum : ${WALLET_MIN_WITHDRAWAL} EUR. Continue à parrainer pour atteindre le seuil.`)
      return
    }
    if (!withdrawIban || withdrawIban.length < 15) {
      toast.error('IBAN invalide. Vérifie le format (FR76…).')
      return
    }
    if (!wallet || amount > wallet.balance) {
      toast.error('Solde insuffisant pour ce retrait.')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.from('withdrawals').insert({
      user_id: user!.id,
      amount,
      iban: withdrawIban,
    })
    setSubmitting(false)
    if (error) {
      toast.error('Erreur lors de la demande de retrait. Réessaie ou contacte le support.')
      return
    }
    toast.success('Demande de retrait envoyée ! Virement sous 48h ouvrées.')
    setShowWithdraw(false)
    setWithdrawAmount('')
    setWithdrawIban('')
    await load()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Wallet Vida</h1>
        <p className="mt-1 text-[var(--text-secondary)]">Tes commissions de parrainage, ton abonnement et tes retraits IBAN.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--cyan)]/10">
              <Wallet className="h-6 w-6 text-[var(--cyan)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Solde disponible</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {(wallet?.balance ?? 0).toFixed(2)} EUR
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total gagné (parrainage)</p>
              <p className="text-2xl font-bold text-emerald-400">
                {(wallet?.total_earned ?? 0).toFixed(2)} EUR
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center gap-3">
          <Button
            onClick={() => setShowWithdraw(!showWithdraw)}
            icon={<CreditCard className="h-4 w-4" />}
            disabled={!wallet || wallet.balance < WALLET_MIN_WITHDRAWAL}
          >
            Retirer (min {WALLET_MIN_WITHDRAWAL} EUR)
          </Button>
          <Button
            variant="secondary"
            onClick={handleOpenPortal}
            loading={portalLoading}
            icon={<ExternalLink className="h-4 w-4" />}
          >
            Gérer mon abonnement
          </Button>
        </Card>
      </div>

      {/* Formulaire retrait */}
      {showWithdraw && (
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Demande de retrait</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-[var(--text-secondary)]">Montant (EUR)</label>
              <input
                type="number"
                min={WALLET_MIN_WITHDRAWAL}
                max={wallet?.balance ?? 0}
                step="0.01"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-white/5 px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-[var(--cyan)]"
                placeholder={`Min ${WALLET_MIN_WITHDRAWAL} EUR`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-[var(--text-secondary)]">IBAN</label>
              <input
                type="text"
                value={withdrawIban}
                onChange={e => setWithdrawIban(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-[var(--border)] bg-white/5 px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-[var(--cyan)]"
                placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
              />
            </div>
            <Button onClick={handleWithdraw} loading={submitting}>
              Confirmer le retrait
            </Button>
          </div>
        </Card>
      )}

      {/* Historique */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Historique</h2>
        {transactions.length === 0 ? (
          <EmptyState
            icon={<Clock className="h-12 w-12" />}
            title="Aucune transaction"
            description="Tes transactions apparaitront ici"
          />
        ) : (
          <div className="space-y-2">
            {transactions.map(t => (
              <div key={t.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.amount > 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    {t.amount > 0 ? <ArrowDownRight className="h-4 w-4 text-emerald-400" /> : <ArrowUpRight className="h-4 w-4 text-red-400" />}
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">{t.description ?? t.type}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{formatDate(t.created_at)}</p>
                  </div>
                </div>
                <span className={`font-semibold ${t.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)} EUR
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
