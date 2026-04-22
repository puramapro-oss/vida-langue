import Link from 'next/link'
import { ArrowLeft, Sparkles, Bug, Zap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog — VEDA',
  description: 'Historique des mises à jour VEDA',
}

const ENTRIES = [
  {
    date: '11 avril 2026',
    version: 'v0.5',
    changes: [
      { type: 'feature', text: 'Design vert émeraude + animations VEDA' },
      { type: 'feature', text: 'i18n 16 langues (purge complète des contenus legacy)' },
      { type: 'feature', text: 'Centre d\'aide rebrandé avec coach VEDA' },
      { type: 'feature', text: 'Admin dashboard avec stats apprenants' },
      { type: 'improvement', text: 'Pages légales (CGU/CGV/Mentions/RGPD) adaptées au domaine langues' },
      { type: 'improvement', text: 'Templates emails Resend rebrandés VEDA (10 séquences)' },
      { type: 'bugfix', text: 'Refactor wallet sur tables VEDA (profiles + payments)' },
    ],
  },
  {
    date: '11 avril 2026',
    version: 'v0.4',
    changes: [
      { type: 'feature', text: 'Système de parrainage (Graine → Légende, 50% du 1er paiement)' },
      { type: 'feature', text: 'Programme influenceur 1 clic + dashboard' },
      { type: 'feature', text: 'Pricing VEDA concret (Mensuel / Annuel / À vie moitié prix)' },
      { type: 'feature', text: 'Stripe checkout + webhook commission auto' },
      { type: 'feature', text: 'Page Impact (4 dimensions, équivalents réels)' },
      { type: 'feature', text: 'Attribution parrainage cookie httpOnly + auth.callback' },
    ],
  },
  {
    date: '11 avril 2026',
    version: 'v0.3',
    changes: [
      { type: 'feature', text: 'Sessions Natif Instinct™ (3 couches phonétiques + Web Speech)' },
      { type: 'feature', text: 'HoloTalk : 6 personas natifs en streaming Claude' },
      { type: 'feature', text: 'Vocabulaire à répétition espacée (intervalles 1→120j)' },
      { type: 'feature', text: 'Missions impact + fil de vie multilingue' },
      { type: 'feature', text: 'Onboarding VEDA (welcome → native → trial 14j)' },
    ],
  },
  {
    date: '11 avril 2026',
    version: 'v0.1',
    changes: [
      { type: 'feature', text: 'Schéma vida_langue : 30+ tables avec RLS' },
      { type: 'feature', text: 'Auth email + Google OAuth + trial 14j auto' },
      { type: 'feature', text: 'Landing page VEDA (Hero + 8 modes + Impact + FAQ)' },
      { type: 'feature', text: 'Identité Coach IA VEDA (linguiste neuro-cognitive)' },
      { type: 'feature', text: 'Theme émeraude #10B981 + fonts Syne/DM Sans' },
    ],
  },
]

const TYPE_ICONS = {
  feature: Sparkles,
  bugfix: Bug,
  improvement: Zap,
}
const TYPE_COLORS = {
  feature: '#00d4ff',
  bugfix: '#ef4444',
  improvement: '#f59e0b',
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--cyan)]">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>

        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Changelog</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Historique des mises à jour VEDA</p>

        <div className="mt-8 space-y-10">
          {ENTRIES.map(entry => (
            <div key={entry.version}>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-[var(--cyan)]/10 px-3 py-1 text-sm font-bold text-[var(--cyan)]">{entry.version}</span>
                <span className="text-sm text-[var(--text-secondary)]">{entry.date}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {entry.changes.map((change, i) => {
                  const Icon = TYPE_ICONS[change.type as keyof typeof TYPE_ICONS] ?? Sparkles
                  const color = TYPE_COLORS[change.type as keyof typeof TYPE_COLORS] ?? '#888'
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
                      <span className="text-sm text-[var(--text-primary)]">{change.text}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
