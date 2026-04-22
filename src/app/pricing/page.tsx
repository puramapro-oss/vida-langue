'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Sparkles, ArrowLeft, Heart, Infinity as InfinityIcon, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'

type VidaPlanKey = 'monthly' | 'yearly' | 'half_lifetime'

interface VidaPlan {
  id: VidaPlanKey
  name: string
  tagline: string
  price: number // €/mois affichés
  billed: string
  totalNote?: string
  badge?: string
  popular?: boolean
  ringColor: string
  features: string[]
  cta: string
  trial: boolean
}

const PLANS: VidaPlan[] = [
  {
    id: 'monthly',
    name: 'VEDA Mensuel',
    tagline: 'Sans engagement. Annule quand tu veux.',
    price: 12.9,
    billed: '12,90€ facturés chaque mois',
    ringColor: '#34D399',
    features: [
      '14 jours d\'essai gratuit',
      'Mode Natif Instinct™ illimité',
      'HoloTalk™ — 6 personas vocaux',
      'Fil de Vie & impact tracké',
      'Missions, parrainage, gains',
      'Accessibilité totale',
    ],
    cta: 'Essayer 14 jours',
    trial: true,
  },
  {
    id: 'yearly',
    name: 'VEDA Annuel',
    tagline: 'Économise 30%. Le choix de ceux qui veulent vraiment changer.',
    price: 9,
    billed: '108€ facturés une fois par an',
    totalNote: 'Soit 9€/mois — au lieu de 12,90€',
    badge: '⭐ -30%',
    popular: true,
    ringColor: '#10B981',
    features: [
      'Tout du plan mensuel',
      '14 jours d\'essai gratuit',
      'Économise 46,80€ par an',
      'Priorité sur les nouvelles fonctions',
      'Cadeau de bienvenue : 500 vida_credits',
      'Concours annuel exclusif',
    ],
    cta: 'Devenir fluide en 1 an',
    trial: true,
  },
  {
    id: 'half_lifetime',
    name: 'Moitié prix à vie',
    tagline: 'Offre exceptionnelle. Verrouille 6,45€/mois — pour toujours.',
    price: 6.45,
    billed: '6,45€/mois — gelé À VIE',
    badge: 'À VIE',
    ringColor: '#F59E0B',
    features: [
      'Tout du plan mensuel',
      'Prix garanti à vie : 6,45€',
      'Jamais de hausse de prix',
      'Annulable à tout moment',
      'Statut "Membre Fondateur"',
      'Pas d\'essai — démarrage immédiat',
    ],
    cta: 'Verrouiller 6,45€ à vie',
    trial: false,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { isAuthenticated, isSuperAdmin } = useAuth()
  const [loading, setLoading] = useState<VidaPlanKey | null>(null)

  const handleChoose = async (plan: VidaPlanKey) => {
    if (!isAuthenticated) {
      router.push(`/signup?plan=${plan}`)
      return
    }

    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json() as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Erreur lors de la création du checkout')
      }

      window.location.href = data.url
    } catch (err) {
      console.error(err)
      toast.error('Impossible de démarrer le paiement. Réessaie ou contacte le support.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-void)] px-4 py-16">
      <div className="max-w-6xl mx-auto mb-10">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>

      {/* Bandeau financement */}
      <div className="max-w-3xl mx-auto mb-8">
        <Link
          href="/financer"
          data-testid="banner-financer"
          className="block w-full rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 p-4 text-center hover:border-emerald-500/40 transition-all group"
        >
          <p className="text-sm font-medium text-emerald-400 mb-0.5">
            La plupart de nos clients ne paient rien grace aux aides
          </p>
          <p className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
            45 aides analysees — Decouvrez celles auxquelles vous avez droit →
          </p>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-[var(--green)]/10 border border-[var(--green)]/30 rounded-full px-4 py-1.5 text-[var(--green)] text-sm font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          14 jours d'essai gratuit · Sans CB
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
          Grave la langue dans ton cerveau.
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
          Un seul abonnement. Toutes les langues. Tous les modes. Toutes les fonctionnalités.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            data-testid={`plan-${plan.id}`}
            className={`relative flex flex-col p-7 transition-all duration-300 ${
              plan.popular ? 'ring-2 ring-[var(--green)]/40 shadow-[0_0_60px_rgba(16,185,129,0.18)] md:scale-105' : ''
            }`}
            style={!plan.popular ? { borderColor: `${plan.ringColor}30` } : undefined}
          >
            {plan.badge && (
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-black text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
                style={{ background: `linear-gradient(135deg, ${plan.ringColor}, #34D399)` }}
              >
                {plan.badge}
              </div>
            )}

            <div className="mb-5">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: `${plan.ringColor}20`, color: plan.ringColor }}
              >
                {plan.id === 'monthly' && <Calendar className="w-5 h-5" />}
                {plan.id === 'yearly' && <Sparkles className="w-5 h-5" />}
                {plan.id === 'half_lifetime' && <InfinityIcon className="w-5 h-5" />}
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">{plan.name}</h2>
              <p className="text-[var(--text-secondary)] text-sm">{plan.tagline}</p>
            </div>

            <div className="mb-6 pb-6 border-b border-white/[0.06]">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[var(--text-primary)]" style={{ color: plan.ringColor }}>
                  {plan.price.toString().replace('.', ',')}€
                </span>
                <span className="text-[var(--text-secondary)] text-sm">/mois</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">{plan.billed}</p>
              {plan.totalNote && (
                <p className="text-xs mt-1" style={{ color: plan.ringColor }}>{plan.totalNote}</p>
              )}
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: plan.ringColor }} />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              data-testid={`btn-choose-${plan.id}`}
              onClick={() => void handleChoose(plan.id)}
              loading={loading === plan.id}
              disabled={!!loading}
              className="w-full"
              variant={plan.popular ? 'primary' : 'secondary'}
            >
              {isSuperAdmin ? 'Accès admin' : plan.cta}
            </Button>
          </Card>
        ))}
      </div>

      <div className="max-w-3xl mx-auto text-center mb-16">
        <p className="text-[var(--text-secondary)] text-sm mb-2">
          Tu hésites encore ?
        </p>
        <p className="text-[var(--text-muted)] text-xs max-w-xl mx-auto">
          Tu peux explorer VEDA librement sans abonnement.<br />
          Mais sans abo, tu ne peux pas démarrer de session ni sauvegarder ton fil de vie.
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-8">
          VEDA vs les autres
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-4 px-4 text-[var(--text-secondary)] font-medium">Fonctionnalité</th>
                <th className="text-center py-4 px-4 text-[var(--green)] font-bold">VEDA</th>
                <th className="text-center py-4 px-4 text-[var(--text-muted)] font-medium">Duolingo</th>
                <th className="text-center py-4 px-4 text-[var(--text-muted)] font-medium">Babbel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {[
                ['Phonétique adaptée à ta langue maternelle', true, false, false],
                ['Conversations vocales IA réalistes', true, false, false],
                ['Pas de leçons théoriques fastidieuses', true, false, false],
                ['Mode flow neuro-immersif', true, false, false],
                ['Missions à impact réel', true, false, false],
                ['10% du CA reversé à une asso', true, false, false],
                ['Prix mensuel', '12,90€', '13,99€', '14,99€'],
              ].map(([feature, vida, duo, babbel], i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{String(feature)}</td>
                  <td className="py-3 px-4 text-center font-medium text-[var(--green)]">
                    {typeof vida === 'boolean' ? (vida ? '✅' : '❌') : vida}
                  </td>
                  <td className="py-3 px-4 text-center text-[var(--text-muted)]">
                    {typeof duo === 'boolean' ? (duo ? '✅' : '❌') : duo}
                  </td>
                  <td className="py-3 px-4 text-center text-[var(--text-muted)]">
                    {typeof babbel === 'boolean' ? (babbel ? '✅' : '❌') : babbel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-[var(--green)] text-sm font-medium mb-3">
          <Heart className="w-4 h-4" />
          Engagement VEDA
        </div>
        <p className="text-[var(--text-muted)] text-xs leading-relaxed">
          10% de chaque abonnement est reversé à l'Association VEDA (impact écologique &amp; éducatif).<br />
          SASU PURAMA · 8 Rue de la Chapelle, 25560 Frasne · TVA non applicable, art. 293 B du CGI.
        </p>
      </div>
    </div>
  )
}
