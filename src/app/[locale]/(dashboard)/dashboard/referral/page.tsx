'use client'

import { useEffect, useState, useMemo } from 'react'
import { Copy, Sparkles, Check } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { copyToClipboard } from '@/lib/utils'
import { APP_DOMAIN, APP_NAME } from '@/lib/constants'
import { REFERRAL_TIERS } from '@/lib/referral-tiers'
import ShareButtons from '@/components/referral/ShareButtons'
import StatCards from '@/components/referral/StatCards'
import TiersList from '@/components/referral/TiersList'
import ReferralsList from '@/components/referral/ReferralsList'

interface VidaReferral {
  id: string
  referrer_id: string
  referred_id: string
  referral_code: string
  status: 'pending' | 'subscribed' | 'churned'
  referrer_earning_cents: number | null
  created_at: string
}

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

  const currentTier = [...REFERRAL_TIERS].reverse().find((t) => subscribed >= t.min) ?? REFERRAL_TIERS[0]
  const nextTier = REFERRAL_TIERS.find((t) => subscribed < t.min)
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
          1er paiement de ton filleul, plus l&apos;avantage <span className="text-[var(--green)] font-semibold">carte à vie</span> tant qu&apos;il reste abonné.
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
              Tu reçois <span className="text-[var(--green)] font-semibold">la moitié de son 1er paiement</span> dès qu&apos;il s&apos;abonne.
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

        <ShareButtons referralLink={referralLink} shareMessage={shareMessage} />
      </Card>

      <StatCards
        subscribed={subscribed}
        totalReferrals={referrals.length}
        totalEarnings={totalEarnings}
        currentTier={currentTier}
        nextTier={nextTier}
        progressPercent={progressPercent}
      />

      <TiersList subscribed={subscribed} />

      <ReferralsList referrals={referrals} />
    </div>
  )
}
