'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Flame, Heart, Compass, Globe2, ArrowRight, Mic, Volume2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import { LEARNING_LANGUAGES, APP_NAME } from '@/lib/constants'

interface DailyMission {
  id: string
  title: string
  description: string | null
  reward_value: number
  reward_type: string
}

interface LifeThread {
  total_actions: number
  active_days: number
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.25, 0.4, 0.25, 1] as const } },
}

export default function DashboardHomePage() {
  const { profile, loading } = useAuth()
  const supabase = createClient()
  const [mission, setMission] = useState<DailyMission | null>(null)
  const [thread, setThread] = useState<LifeThread | null>(null)

  useEffect(() => {
    if (!profile) return
    let cancelled = false

    void (async () => {
      const { data: m } = await supabase
        .from('missions')
        .select('id, title, description, reward_value, reward_type')
        .eq('active', true)
        .eq('type', 'solo')
        .limit(1)
        .maybeSingle()
      if (!cancelled && m) setMission(m as DailyMission)

      const { data: t } = await supabase
        .from('life_thread')
        .select('total_actions, active_days')
        .eq('user_id', profile.id)
        .maybeSingle()
      if (!cancelled && t) setThread(t as LifeThread)
    })()

    return () => { cancelled = true }
  }, [profile, supabase])

  const learning = (profile as unknown as { languages_learning?: string[] } | null)?.languages_learning ?? []
  const native = (profile as unknown as { language_native?: string } | null)?.language_native ?? 'fr'
  const energy = (profile as unknown as { vida_energy?: number } | null)?.vida_energy ?? 100
  const streak = profile?.streak_count ?? 0
  const firstName = profile?.display_name?.split(' ')[0] ?? 'Voyageur'

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 6) return 'Belle nuit'
    if (h < 12) return 'Bon matin'
    if (h < 18) return 'Bel après-midi'
    return 'Bonsoir'
  })()

  const targetLang = learning[0] ?? 'en'
  const targetMeta = LEARNING_LANGUAGES.find(l => l.code === targetLang)
  const nativeMeta = LEARNING_LANGUAGES.find(l => l.code === native)

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-6xl space-y-8"
      data-testid="dashboard-home"
    >
      {/* Greeting */}
      <motion.div variants={fadeUp} className="space-y-2">
        <p className="text-sm text-[var(--text-muted)]">{greeting}</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight md:text-4xl">
          {firstName}, ta langue t&apos;attend.
        </h1>
        <p className="text-[var(--text-secondary)]">
          Pas de cours. Pas de stress. Juste {APP_NAME}, qui te grave la langue dans le cerveau.
        </p>
      </motion.div>

      {/* Vitals row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4" data-testid="stat-streak">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Flame className="h-4 w-4 text-orange-400" /> Streak
          </div>
          <p className="mt-2 text-2xl font-bold text-orange-300">{streak} <span className="text-sm text-[var(--text-muted)]">jour{streak > 1 ? 's' : ''}</span></p>
        </Card>
        <Card className="p-4" data-testid="stat-energy">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Heart className="h-4 w-4 text-emerald-400" /> Énergie VEDA
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{energy}%</p>
        </Card>
        <Card className="p-4" data-testid="stat-thread">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Globe2 className="h-4 w-4 text-cyan-400" /> Fil de Vie
          </div>
          <p className="mt-2 text-2xl font-bold text-cyan-300">{thread?.total_actions ?? 0}</p>
          <p className="text-xs text-[var(--text-muted)]">actions gravées</p>
        </Card>
        <Card className="p-4" data-testid="stat-language">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Sparkles className="h-4 w-4 text-violet-400" /> Langue active
          </div>
          <p className="mt-2 text-2xl font-bold">
            {targetMeta?.flag} <span className="text-base text-[var(--text-secondary)]">{targetMeta?.name ?? '—'}</span>
          </p>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/sessions/natif-instinct"
          className="group block"
          data-testid="quick-natif-instinct"
        >
          <Card className="relative overflow-hidden p-6 transition-all hover:scale-[1.01]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                <Volume2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">Natif Instinct™</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Tape une phrase, vois la phonétique VEDA adaptée à ton {nativeMeta?.name ?? 'français'}. 3 couches, 0 traduction mentale.
                </p>
                <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-400">
                  Lancer une couche <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Card>
        </Link>

        <Link
          href="/dashboard/sessions/holotalk"
          className="group block"
          data-testid="quick-holotalk"
        >
          <Card className="relative overflow-hidden p-6 transition-all hover:scale-[1.01]">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                <Mic className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">HoloTalk™</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Parle avec un personnage incarné — vendeur, mamie, coach. Voix, mémoire longue, corrections douces.
                </p>
                <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-violet-300">
                  Démarrer une conversation <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* Mission du jour */}
      {mission && (
        <motion.div variants={fadeUp}>
          <Link href="/dashboard/missions" data-testid="mission-of-day">
            <Card className="group p-6 transition-all hover:scale-[1.005]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
                  <Compass className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Mission du jour</p>
                  <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold">{mission.title}</h3>
                  {mission.description && (
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{mission.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 font-medium text-amber-300">
                      +{mission.reward_value} {mission.reward_type === 'euros' ? '€' : mission.reward_type.replace('_', ' ')}
                    </span>
                    <span className="text-[var(--text-muted)]">→ Voir toutes les missions</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      )}

      {loading && <p className="text-center text-sm text-[var(--text-muted)]">VEDA prépare ton espace…</p>}
    </motion.div>
  )
}
