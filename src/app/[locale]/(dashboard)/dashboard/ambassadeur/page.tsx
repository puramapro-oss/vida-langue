'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Megaphone } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import Tabs from '@/components/ui/Tabs'
import { copyToClipboard } from '@/lib/utils'
import { APP_DOMAIN, APP_NAME } from '@/lib/constants'
import OnboardingSection from '@/components/ambassador/OnboardingSection'
import StatsCards from '@/components/ambassador/StatsCards'
import TierProgress from '@/components/ambassador/TierProgress'
import LinksTab from '@/components/ambassador/LinksTab'
import SalesTab from '@/components/ambassador/SalesTab'
import TiersTab from '@/components/ambassador/TiersTab'
import AcademyTab from '@/components/ambassador/AcademyTab'

interface VidaInfluencer {
  id: string
  user_id: string
  promo_code: string | null
  promo_link: string | null
  promo_expires_at: string | null
  commission_first_percent: number
  commission_recurring_percent: number
  total_earned_cents: number
  status: string
  bio: string | null
  social_links: Record<string, string>
  tier: string
  kit_downloaded: boolean
  created_at: string
}

interface VidaInfluencerSale {
  id: string
  influencer_id: string
  buyer_id: string | null
  commission_cents: number
  recurring: boolean
  created_at: string
}

const TIERS = [
  { id: 'bronze', label: 'Bronze', min: 10, commission: '50% + 10%', color: '#cd7f32', perk: '+1 mois VEDA offert' },
  { id: 'argent', label: 'Argent', min: 25, commission: '50% + 12%', color: '#94a3b8', perk: 'VEDA Annuel offert' },
  { id: 'or', label: 'Or', min: 50, commission: '50% + 13%', color: '#f59e0b', perk: 'Page perso /p/[slug]' },
  { id: 'platine', label: 'Platine', min: 100, commission: '50% + 15%', color: '#e879f9', perk: 'Coach IA dédié + accès anticipé' },
  { id: 'diamant', label: 'Diamant', min: 250, commission: '50% + 17%', color: '#06b6d4', perk: 'Statut VIP + événements' },
  { id: 'legende', label: 'Légende', min: 500, commission: '50% + 20%', color: '#10B981', perk: 'Commissions héréditaires' },
]

const PALIER_EUROS = [
  { signups: 10, bonus: 50 },
  { signups: 25, bonus: 150 },
  { signups: 50, bonus: 400 },
  { signups: 100, bonus: 1000 },
  { signups: 250, bonus: 3000 },
  { signups: 500, bonus: 6500 },
]

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base || 'vida'}-${suffix}`
}

export default function AmbassadeurPage() {
  const { user, profile } = useAuth()
  const [influencer, setInfluencer] = useState<VidaInfluencer | null>(null)
  const [sales, setSales] = useState<VidaInfluencerSale[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [tab, setTab] = useState('outils')
  const supabase = createClient()

  const load = useCallback(async () => {
    if (!user) return

    const { data: inf } = await supabase
      .from('influencers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (inf) {
      setInfluencer(inf as VidaInfluencer)
      const { data: salesData } = await supabase
        .from('influencer_sales')
        .select('*')
        .eq('influencer_id', (inf as VidaInfluencer).id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (salesData) setSales(salesData as VidaInfluencerSale[])
    }

    setLoading(false)
  }, [user, supabase])

  useEffect(() => {
    void load()
  }, [load])

  const register = async () => {
    if (!user || !profile) return
    setRegistering(true)

    const promoCode = generateSlug(profile.display_name ?? user.email ?? 'vida')
    const promoLink = `https://${APP_DOMAIN}/go/${promoCode}`
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { error } = await supabase.from('influencers').insert({
      user_id: user.id,
      promo_code: promoCode,
      promo_link: promoLink,
      promo_expires_at: expiresAt,
      commission_first_percent: 50,
      commission_recurring_percent: 10,
      total_earned_cents: 0,
      status: 'active',
      tier: 'bronze',
    })

    if (error) {
      toast.error('Impossible de créer ton profil ambassadeur. Réessaie.')
    } else {
      toast.success(`Bienvenue dans le programme ! Ton lien : ${promoCode}`)
      void load()
    }
    setRegistering(false)
  }

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(label)
      toast.success(`${label} copié`)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const { promoActive, promoDaysLeft } = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now()
    const expiresAt = influencer?.promo_expires_at ? new Date(influencer.promo_expires_at).getTime() : 0
    return {
      promoActive: expiresAt > now,
      promoDaysLeft: expiresAt > now ? Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))) : 0,
    }
  }, [influencer?.promo_expires_at])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Onboarding (pas encore inscrit)
  if (!influencer) {
    return <OnboardingSection tiers={TIERS} registering={registering} onRegister={() => void register()} />
  }

  // Dashboard
  const goLink = influencer.promo_link ?? `https://${APP_DOMAIN}/go/${influencer.promo_code}`
  const profileLink = `https://${APP_DOMAIN}/p/${influencer.promo_code}`
  const currentTier = TIERS.find((t) => t.id === influencer.tier) ?? TIERS[0]
  const currentTierIdx = TIERS.findIndex((t) => t.id === currentTier.id)
  const nextTier = TIERS[currentTierIdx + 1]

  const conversions = sales.length
  const totalRevenue = sales.reduce((sum, s) => sum + s.commission_cents, 0) / 100
  const recurringRevenue = sales
    .filter((s) => s.recurring)
    .reduce((sum, s) => sum + s.commission_cents, 0) / 100

  const shareTemplates = [
    `J'apprends une langue avec ${APP_NAME}, l'app qui grave la phonétique dans ton cerveau. -50% pendant 7j via mon lien : ${goLink}`,
    `Si t'as déjà raté Duolingo, essaie ${APP_NAME}. C'est de la phonétique adaptée à ta langue maternelle. ${goLink}`,
    `J'ai testé ${APP_NAME}. Pour la 1ère fois j'ai parlé sans réfléchir. -50% via mon code (7j) : ${goLink}`,
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-[var(--text-primary)]">
            <Megaphone className="h-7 w-7 text-[var(--green)]" />
            Espace Ambassadeur
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="green">{currentTier.label}</Badge>
            <span className="text-sm text-[var(--text-muted)]">{currentTier.commission}</span>
          </div>
        </div>
        {promoActive && (
          <div className="rounded-xl border border-[var(--green)]/30 bg-[var(--green)]/[0.06] px-4 py-2 text-right">
            <p className="text-xs text-[var(--text-muted)]">Code promo -50%</p>
            <p className="text-sm font-semibold text-[var(--green)]">
              Actif · {promoDaysLeft}j restant{promoDaysLeft > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      <StatsCards
        conversions={conversions}
        sales={sales}
        recurringRevenue={recurringRevenue}
        totalRevenue={totalRevenue}
      />

      {nextTier && <TierProgress currentTier={currentTier} nextTier={nextTier} conversions={conversions} />}

      <Tabs
        tabs={[
          { id: 'outils', label: 'Liens & Outils' },
          { id: 'ventes', label: 'Ventes' },
          { id: 'paliers', label: 'Paliers' },
          { id: 'academy', label: 'Academy' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'outils' && (
        <LinksTab
          goLink={goLink}
          profileLink={profileLink}
          shareTemplates={shareTemplates}
          copied={copied}
          onCopy={handleCopy}
        />
      )}

      {tab === 'ventes' && <SalesTab sales={sales} totalRevenue={totalRevenue} recurringRevenue={recurringRevenue} />}

      {tab === 'paliers' && (
        <TiersTab
          tiers={TIERS}
          currentTier={currentTier}
          currentTierIdx={currentTierIdx}
          conversions={conversions}
          palierEuros={PALIER_EUROS}
        />
      )}

      {tab === 'academy' && <AcademyTab conversions={conversions} />}
    </div>
  )
}
