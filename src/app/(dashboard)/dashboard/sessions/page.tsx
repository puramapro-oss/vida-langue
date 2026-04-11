'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Brain, Mic, Volume2, Moon, Sparkles, Globe, Users, Heart, ArrowRight,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import { LEARNING_MODES } from '@/lib/constants'

const ICONS = {
  brain: Brain,
  mic: Mic,
  'volume-2': Volume2,
  moon: Moon,
  sparkles: Sparkles,
  globe: Globe,
  users: Users,
  heart: Heart,
} as const

const ROUTES: Record<string, string | null> = {
  phonetic: '/dashboard/sessions/natif-instinct',
  holotalk: '/dashboard/sessions/holotalk',
  neuroflow: null,
  sleep: null,
  hypno: null,
  reality: null,
  group: null,
  spiritual: null,
}

const COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  phonetic: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', ring: 'from-emerald-500/15' },
  holotalk: { bg: 'bg-violet-500/15', text: 'text-violet-300', ring: 'from-violet-500/15' },
  neuroflow: { bg: 'bg-cyan-500/15', text: 'text-cyan-300', ring: 'from-cyan-500/15' },
  sleep: { bg: 'bg-indigo-500/15', text: 'text-indigo-300', ring: 'from-indigo-500/15' },
  hypno: { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-300', ring: 'from-fuchsia-500/15' },
  reality: { bg: 'bg-sky-500/15', text: 'text-sky-300', ring: 'from-sky-500/15' },
  group: { bg: 'bg-amber-500/15', text: 'text-amber-300', ring: 'from-amber-500/15' },
  spiritual: { bg: 'bg-rose-500/15', text: 'text-rose-300', ring: 'from-rose-500/15' },
}

export default function SessionsHubPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8" data-testid="sessions-hub">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wider text-emerald-400">Sessions Vida</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight md:text-4xl">
          Choisis ton mode d&apos;immersion
        </h1>
        <p className="max-w-2xl text-[var(--text-secondary)]">
          8 modes pour graver la langue dans ton cerveau. Aucun cours. Aucune théorie.
          Juste la voix, le souffle, et toi.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEARNING_MODES.map((mode, idx) => {
          const Icon = ICONS[mode.icon as keyof typeof ICONS] ?? Sparkles
          const color = COLORS[mode.id] ?? COLORS.phonetic
          const route = ROUTES[mode.id]
          const available = !!route

          const cardInner = (
            <Card className="relative h-full overflow-hidden p-6 transition-all hover:scale-[1.01]">
              <div className={`absolute inset-0 bg-gradient-to-br ${color.ring} via-transparent to-transparent`} />
              <div className="relative space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color.bg} ${color.text}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">{mode.duration} min</span>
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">{mode.name}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{mode.description}</p>
                <div className="pt-2">
                  {available ? (
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${color.text}`}>
                      Lancer <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--text-muted)]">
                      Bientôt
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )

          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              data-testid={`mode-${mode.id}`}
            >
              {available && route ? (
                <Link href={route} className="block h-full">{cardInner}</Link>
              ) : (
                <div className="block h-full opacity-70">{cardInner}</div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
