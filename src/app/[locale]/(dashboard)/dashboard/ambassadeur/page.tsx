'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Users, TrendingUp, Wallet, Link2, Copy, Check,
  Star, Crown, Megaphone, BookOpen, Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import Tabs from '@/components/ui/Tabs'
import { cn, copyToClipboard, formatDate } from '@/lib/utils'
import { APP_DOMAIN, APP_NAME } from '@/lib/constants'

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
            {TIERS.map(({ label, min, commission, color }) => (
              <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <p className="text-sm font-bold" style={{ color }}>{label}</p>
                <p className="text-xs text-[var(--text-muted)]">{min}+ filleuls</p>
                <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{commission}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center">
          <Button onClick={() => void register()} disabled={registering} size="lg">
            {registering ? 'Inscription...' : 'Rejoindre en 1 clic'}
          </Button>
        </div>
      </div>
    )
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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-[var(--green)]" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Conversions</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{conversions}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Récurrent</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{sales.filter((s) => s.recurring).length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Récurrent / mois</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{recurringRevenue.toFixed(2)}€</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-[var(--green)]" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Total gagné</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{totalRevenue.toFixed(2)}€</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tier progress */}
      {nextTier && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5" style={{ color: currentTier.color }} />
              <span className="text-sm text-[var(--text-primary)]">
                {currentTier.label} → {nextTier.label}
              </span>
            </div>
            <span className="text-sm text-[var(--text-muted)]">
              {conversions}/{nextTier.min} filleuls
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (conversions / nextTier.min) * 100)}%`,
                backgroundColor: nextTier.color,
              }}
            />
          </div>
        </Card>
      )}

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
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Tes liens</h3>
            <div className="space-y-3">
              {[
                { label: 'Lien promo -50% (7j)', url: goLink },
                { label: 'Page publique', url: profileLink },
              ].map(({ label, url }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 min-w-0">
                    <Link2 className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                    <code className="flex-1 truncate text-sm text-[var(--green)]">{url}</code>
                  </div>
                  <button
                    onClick={() => void handleCopy(url, label)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-[var(--text-secondary)] hover:bg-white/[0.06] transition-colors"
                  >
                    {copied === label ? <Check className="h-4 w-4 text-[var(--green)]" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Templates de partage</h3>
            <div className="space-y-2">
              {shareTemplates.map((text, i) => (
                <div key={i} className="flex items-start gap-2">
                  <p className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-[var(--text-secondary)]">
                    {text}
                  </p>
                  <button
                    onClick={() => void handleCopy(text, `Template ${i + 1}`)}
                    className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-white/5 transition-colors"
                  >
                    {copied === `Template ${i + 1}` ? <Check className="h-3.5 w-3.5 text-[var(--green)]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'ventes' && (
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
      )}

      {tab === 'paliers' && (
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Paliers de commission</h3>
            <div className="space-y-2">
              {TIERS.map((tier, idx) => {
                const isActive = tier.id === influencer.tier
                const isPassed = idx < currentTierIdx
                return (
                  <div
                    key={tier.id}
                    className={cn(
                      'flex items-center gap-4 rounded-xl border p-4 transition-all',
                      isActive ? 'border-[var(--green)]/30 bg-[var(--green)]/5' :
                      isPassed ? 'border-emerald-500/20 bg-emerald-500/5' :
                      'border-white/[0.06] bg-white/[0.02]'
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${tier.color}20` }}>
                      <Star className="h-5 w-5" style={{ color: tier.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-[var(--text-primary)]">{tier.label}</p>
                        {isActive && <Badge variant="green">Actuel</Badge>}
                        {isPassed && <Badge variant="default">Atteint</Badge>}
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        {tier.min}+ filleuls — {tier.perk}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-right" style={{ color: tier.color }}>{tier.commission}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Bonus en euros</h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {PALIER_EUROS.map(({ signups, bonus }) => (
                <div key={signups} className={cn(
                  'rounded-lg border p-3 text-center',
                  conversions >= signups ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/[0.06] bg-white/[0.02]'
                )}>
                  <p className="text-xs text-[var(--text-muted)]">{signups}</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{bonus}€</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'academy' && (
        <div className="space-y-4">
          {[
            {
              level: 1,
              title: 'Les bases — VEDA Ambassadeur',
              duration: '2h',
              topics: [
                'Comprendre VEDA en 5 min',
                'Activer ton lien promo -50%',
                'Partager efficacement (story, DM, post)',
                'Optimiser ta page perso',
              ],
              unlocked: true,
            },
            {
              level: 2,
              title: 'Stratégie avancée',
              duration: '6h',
              topics: [
                'Cibler les bonnes audiences',
                'Contenu qui convertit (TikTok, Reels, Shorts)',
                'Storytelling VEDA (avant/après)',
                'Réseau ambassadeurs VEDA',
              ],
              unlocked: conversions >= 25,
            },
            {
              level: 3,
              title: 'Expert — revenus passifs',
              duration: '12h',
              topics: [
                'Funnel automatisé',
                'Email + retargeting',
                'Partenariats marques',
                'Scale 1k+ filleuls',
              ],
              unlocked: conversions >= 50,
            },
          ].map(({ level, title, duration, topics, unlocked }) => (
            <Card key={level} className={cn('p-5', !unlocked && 'opacity-60')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold',
                    unlocked ? 'bg-[var(--green)]/20 text-[var(--green)]' : 'bg-white/10 text-[var(--text-muted)]'
                  )}>
                    N{level}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{title}</p>
                    <p className="text-xs text-[var(--text-muted)]">{duration} — {topics.length} modules</p>
                  </div>
                </div>
                <Badge variant={unlocked ? 'green' : 'default'}>
                  {unlocked ? 'Disponible' : 'Verrouillé'}
                </Badge>
              </div>
              <ul className="mt-3 space-y-1">
                {topics.map((topic) => (
                  <li key={topic} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <BookOpen className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    {topic}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
