'use client'

import { BookOpen } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface AcademyModule {
  level: number
  title: string
  duration: string
  topics: string[]
  unlocked: boolean
}

interface AcademyTabProps {
  conversions: number
}

export default function AcademyTab({ conversions }: AcademyTabProps) {
  const modules: AcademyModule[] = [
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
  ]

  return (
    <div className="space-y-4">
      {modules.map(({ level, title, duration, topics, unlocked }) => (
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
  )
}
