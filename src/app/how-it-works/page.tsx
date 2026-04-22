import Link from 'next/link'
import { ArrowLeft, Brain, Mic, Sparkles, Heart, Trophy, BarChart3 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comment ça marche — VEDA',
  description: 'Découvre comment VEDA grave une langue dans ton cerveau en 30 jours.',
}

const STEPS = [
  {
    icon: Brain,
    color: '#10B981',
    title: '1. Choisis ta langue',
    description: 'Anglais, Espagnol, Italien, Japonais, Arabe… 16 langues disponibles. Sélectionne aussi un accent régional (UK, US, Australia…) pour t\'immerger dès la première session.',
  },
  {
    icon: Mic,
    color: '#34D399',
    title: '2. Active la couche audible',
    description: 'Notre méthode Natif Instinct™ affiche chaque mot en 3 couches : orthographe, phonétique linguiste (IPA), et "audible FR" — comment ton oreille française entend vraiment le mot.',
  },
  {
    icon: Sparkles,
    color: '#6EE7B7',
    title: '3. Parle avec un natif',
    description: 'HoloTalk te met face à 6 personas natifs (Marco l\'italien, Yuki la japonaise, Sofia l\'espagnole…). Conversations vocales libres, en streaming, sans jugement.',
  },
  {
    icon: Heart,
    color: '#10B981',
    title: '4. Ancre dans ton cerveau',
    description: 'Chaque mot est sauvegardé en répétition espacée (intervalles 1 → 120 jours). Ton cerveau le revoit pile avant de l\'oublier — c\'est la science du long terme.',
  },
  {
    icon: Trophy,
    color: '#34D399',
    title: '5. Vis des missions',
    description: 'Fini les exercices artificiels. Commande un café, lis un menu, regarde une série. Chaque mission accomplie nourrit ton fil de vie et ton XP VEDA.',
  },
  {
    icon: BarChart3,
    color: '#6EE7B7',
    title: '6. Suis ta progression',
    description: 'Ton univers VEDA grandit visuellement à chaque session. Streaks, paliers, vocabulaire ancré, conversations tenues — tout est mesurable, tout est visible.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)]">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--cyan)]">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>

        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Comment ça marche</h1>
        <p className="mt-2 text-lg text-[var(--text-secondary)]">
          VEDA grave une langue dans ton cerveau en 30 jours, sans cours, sans théorie. 6 étapes.
        </p>

        <div className="mt-12 space-y-8">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-6">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${step.color}15` }}
              >
                <step.icon className="h-7 w-7" style={{ color: step.color }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{step.title}</h2>
                <p className="mt-1 text-[var(--text-secondary)] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--cyan)] to-[var(--purple)] px-8 py-4 text-lg font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Commencer gratuitement
          </Link>
        </div>
      </div>
    </div>
  )
}
