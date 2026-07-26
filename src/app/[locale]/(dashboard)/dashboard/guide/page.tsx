'use client'

import { useState } from 'react'
import { BookOpen, Mic, Volume2, Brain, Heart, Sparkles, ChevronRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

const GUIDES = [
  {
    id: 'natif-instinct',
    icon: Brain,
    title: 'Natif Instinct™',
    color: '#10B981',
    steps: [
      'Va dans Sessions → Natif Instinct',
      'Tape un mot ou une phrase dans la langue cible',
      'Découvre les 3 couches : spelling, IPA, et "audible FR"',
      'Écoute la prononciation native (Web Speech API)',
      'Ton vocabulaire est sauvegardé et reviendra en spaced repetition',
    ],
  },
  {
    id: 'holotalk',
    icon: Mic,
    title: 'HoloTalk',
    color: '#34D399',
    steps: [
      'Ouvre Sessions → HoloTalk',
      'Choisis un persona natif (Marco, Yuki, Sofia…)',
      'Active le micro et parle naturellement',
      'Le persona te répond en streaming, avec voix native',
      'Chaque conversation nourrit ta progression et ton fil de vie',
    ],
  },
  {
    id: 'missions',
    icon: Heart,
    title: 'Missions impact',
    color: '#6EE7B7',
    steps: [
      'Va dans Missions',
      'Choisis une mission (vocabulaire, conversation, écoute, partage)',
      'Accepte-la — elle apparaît dans ton dashboard',
      'Termine-la pour gagner XP, énergie VEDA et impact réel',
      'Tes missions alimentent l\'arbre VEDA (1 mission = 1 graine plantée)',
    ],
  },
  {
    id: 'fil-vie',
    icon: Sparkles,
    title: 'Fil de vie & Univers',
    color: '#10B981',
    steps: [
      'Va dans Univers',
      'Visualise ta progression par langue et par mode',
      'Consulte ton fil de vie : chaque session laisse une trace',
      'Suis tes streaks, tes paliers et tes derniers mots appris',
      'Ton univers grandit littéralement avec toi',
    ],
  },
  {
    id: 'parrainage',
    icon: Volume2,
    title: 'Parrainage',
    color: '#34D399',
    steps: [
      'Ouvre Parrainage',
      'Copie ton lien personnel ou ton code',
      'Partage-le sur WhatsApp, SMS, Twitter ou Email',
      'À chaque ami abonné, tu reçois 50% de son 1er mois sur ton wallet',
      'Monte les paliers Graine → Légende et débloque des avantages',
    ],
  },
  {
    id: 'wallet',
    icon: BookOpen,
    title: 'Wallet & retrait',
    color: '#6EE7B7',
    steps: [
      'Va dans Wallet',
      'Vérifie ton solde (parrainage + missions)',
      'Dès 5€, tu peux demander un retrait IBAN',
      'Gère ton abonnement via le portail Stripe sécurisé',
      'Consulte tes factures et l\'historique des paiements',
    ],
  },
]

export default function GuidePage() {
  const [activeGuide, setActiveGuide] = useState(GUIDES[0].id)

  const guide = GUIDES.find(g => g.id === activeGuide)!

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Guide</h1>
        <p className="mt-1 text-[var(--text-secondary)]">Apprends à utiliser toutes les fonctionnalités de VEDA</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-1">
          {GUIDES.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGuide(g.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all',
                activeGuide === g.id
                  ? 'bg-white/10 text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-white/5'
              )}
            >
              <g.icon className="h-5 w-5" style={{ color: g.color }} />
              {g.title}
              {activeGuide === g.id && <ChevronRight className="ml-auto h-4 w-4" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <Card className="lg:col-span-3 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${guide.color}15` }}>
              <guide.icon className="h-6 w-6" style={{ color: guide.color }} />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{guide.title}</h2>
          </div>
          <ol className="space-y-4">
            {guide.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: `${guide.color}15`, color: guide.color }}>
                  {i + 1}
                </div>
                <p className="pt-1 text-[var(--text-primary)]">{step}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  )
}
