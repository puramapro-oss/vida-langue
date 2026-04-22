'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Copy, Users, TrendingUp, Award, Share2, Check, Sparkles,
  MessageCircle, Mail, Send, Globe,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { cn, copyToClipboard, formatDate } from '@/lib/utils'
import { APP_DOMAIN, APP_NAME } from '@/lib/constants'

interface VidaReferral {
  id: string
  referrer_id: string
  referred_id: string
  referral_code: string
  status: 'pending' | 'subscribed' | 'churned'
  referrer_earning_cents: number | null
  created_at: string
}

const TIERS = [
  { tier: 'graine', min: 0, label: 'Graine', color: '#94a3b8', perk: 'Tu commences ton chemin' },
  { tier: 'bronze', min: 5, label: 'Bronze', color: '#CD7F32', perk: '+5 vida_credits offerts' },
  { tier: 'argent', min: 10, label: 'Argent', color: '#C0C0C0', perk: '1 mois VEDA offert' },
  { tier: 'or', min: 25, label: 'Or', color: '#FFD700', perk: 'Prix gelé à -20% à vie' },
  { tier: 'platine', min: 50, label: 'Platine', color: '#E5E4E2', perk: 'Statut VEDA Voyageur' },
  { tier: 'diamant', min: 75, label: 'Diamant', color: '#B9F2FF', perk: 'Page perso vidalangue.purama.dev/p/' },
  { tier: 'legende', min: 100, label: 'Légende', color: '#10B981', perk: 'Commissions héréditaires + cadeaux' },
] as const

export default function ReferralPage() {
  const { profile, user } = useAuth()
  const [referrals, setReferrals] = useState<VidaReferral[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  const referralLink = profile?.referral_code
    ? `https://${APP_DOMAIN}/go/${profile.referral_code}`
    : ''

  const shareMessage = useMemo(
    () =>
      `J'apprends une langue avec ${APP_NAME} — la phonétique adaptée à mon cerveau, c'est dingue. ` +
      `Tu as 14 jours offerts via mon lien : ${referralLink}`,
    [referralLink],
  )

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setReferrals(data as VidaReferral[])
      setLoading(false)
    }
    void load()
  }, [user, supabase])

  const handleCopy = async () => {
    if (!referralLink) return
    const ok = await copyToClipboard(referralLink)
    if (ok) {
      setCopied(true)
      toast.success('Lien copié — partage-le !')
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error('Impossible de copier. Sélectionne le lien manuellement.')
    }
  }

  const subscribed = referrals.filter((r) => r.status === 'subscribed').length
  const totalEarningsCents = referrals.reduce(
    (sum, r) => sum + (r.referrer_earning_cents ?? 0),
    0,
  )
  const totalEarnings = totalEarningsCents / 100

  const currentTier = [...TIERS].reverse().find((t) => subscribed >= t.min) ?? TIERS[0]
  const nextTier = TIERS.find((t) => subscribed < t.min)
  const progressPercent = nextTier
    ? Math.min(100, Math.round((subscribed / nextTier.min) * 100))
    : 100

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Parrainage VEDA</h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          Partage VEDA. Gagne <span className="text-[var(--green)] font-semibold">50%</span> du
          1er paiement + <span className="text-[var(--green)] font-semibold">10%</span> à vie tant que ton filleul reste abonné.
        </p>
      </div>

      <Card className="p-6 ring-1 ring-[var(--green)]/20 bg-gradient-to-br from-[var(--green)]/[0.04] to-transparent">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-[var(--green)]" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Ton lien de parrainage</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Ton filleul reçoit <span className="text-[var(--green)] font-semibold">14 jours offerts</span>.
              Tu reçois <span className="text-[var(--green)] font-semibold">la moitié de son 1er paiement</span> dès qu'il s'abonne.
            </p>
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] p-3 max-w-2xl">
              <code className="flex-1 truncate text-sm text-[var(--green)] font-mono">
                {referralLink || 'Chargement...'}
              </code>
              <Button
                size="sm"
                onClick={() => void handleCopy()}
                icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                disabled={!referralLink}
              >
                {copied ? 'Copié' : 'Copier'}
              </Button>
            </div>
          </div>
        </div>

        {referralLink && (
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <a
              href={`sms:?body=${encodeURIComponent(shareMessage)}`}
              className="inline-flex items-center gap-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" /> SMS
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Send className="h-3.5 w-3.5" /> Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Globe className="h-3.5 w-3.5" /> Facebook
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent('VEDA — 14 jours offerts')}&body=${encodeURIComponent(shareMessage)}`}
              className="inline-flex items-center gap-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--green)]/10">
              <Users className="h-5 w-5 text-[var(--green)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Filleuls actifs</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{subscribed}</p>
              <p className="text-xs text-[var(--text-muted)]">{referrals.length} clics totaux</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Gains</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{totalEarnings.toFixed(2)}€</p>
              <p className="text-xs text-[var(--text-muted)]">Versé sur ton wallet VEDA</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: `${currentTier.color}20` }}
            >
              <Award className="h-5 w-5" style={{ color: currentTier.color }} />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Palier actuel</p>
              <p className="text-xl font-bold" style={{ color: currentTier.color }}>{currentTier.label}</p>
              <p className="text-xs text-[var(--text-muted)]">{currentTier.perk}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[var(--text-secondary)]">Prochain palier</p>
              {nextTier ? (
                <>
                  <p className="text-xl font-bold text-[var(--text-primary)]">
                    {nextTier.min - subscribed} <span className="text-sm font-normal">restant{nextTier.min - subscribed > 1 ? 's' : ''}</span>
                  </p>
                  <div className="mt-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%`, background: nextTier.color }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-xl font-bold text-[var(--green)]">Légende atteinte 🌟</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Paliers VEDA</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TIERS.map((t) => {
            const reached = subscribed >= t.min
            return (
              <div
                key={t.tier}
                className={cn(
                  'rounded-xl border p-4 transition-all',
                  reached
                    ? 'border-[var(--green)]/30 bg-[var(--green)]/5'
                    : 'border-white/[0.06] bg-white/[0.02]',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ color: t.color }}>{t.label}</span>
                  <Badge variant={reached ? 'green' : 'default'}>
                    {t.min === 0 ? 'Départ' : `${t.min} filleuls`}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">{t.perk}</p>
                {reached && t.min > 0 && (
                  <p className="mt-1 text-xs text-[var(--green)] font-medium">✓ Débloqué</p>
                )}
              </div>
            )
          })}
        </div>
      </Card>

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
    </div>
  )
}
