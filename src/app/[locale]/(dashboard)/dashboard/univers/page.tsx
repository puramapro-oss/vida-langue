'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Globe2, Flame, Heart, BookOpen, TrendingUp, Compass, Loader2,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import { LEARNING_LANGUAGES } from '@/lib/constants'

interface LifeThread {
  total_actions: number
  active_days: number
  total_impact: Record<string, number>
}

interface Session {
  id: string
  mode: string
  language: string
  duration_seconds: number
  xp_earned: number
  created_at: string
}

interface UserProgress {
  language: string
  level: number
  fluency_percent: number
  words_known: number
  hours_spoken: number
  phonetic_graduation: 'full_phonetic' | 'mix' | 'native'
}

const GRADUATION_LABEL = {
  full_phonetic: 'Phonétique pure',
  mix: 'Mix doux',
  native: 'Lecture native',
}

export default function UniversPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [thread, setThread] = useState<LifeThread | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    let cancelled = false

    void (async () => {
      const [{ data: t }, { data: s }, { data: p }] = await Promise.all([
        supabase
          .from('life_thread')
          .select('total_actions, active_days, total_impact')
          .eq('user_id', profile.id)
          .maybeSingle(),
        supabase
          .from('sessions')
          .select('id, mode, language, duration_seconds, xp_earned, created_at')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('user_progress')
          .select('language, level, fluency_percent, words_known, hours_spoken, phonetic_graduation')
          .eq('user_id', profile.id),
      ])
      if (cancelled) return
      setThread((t as LifeThread) ?? { total_actions: 0, active_days: 0, total_impact: {} })
      setSessions((s as Session[]) ?? [])
      setProgress((p as UserProgress[]) ?? [])
      setLoading(false)
    })()

    return () => { cancelled = true }
  }, [profile, supabase])

  const streak = profile?.streak_count ?? 0
  const energy = (profile as unknown as { vida_energy?: number } | null)?.vida_energy ?? 100

  return (
    <div className="mx-auto max-w-5xl space-y-6" data-testid="univers-page">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wider text-emerald-400">Mon Univers VEDA</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight md:text-4xl">
          Le fil de ta langue
        </h1>
        <p className="max-w-2xl text-[var(--text-secondary)]">
          Ton fil de vie ne s&apos;efface jamais. Même si tu pauses, il reste là — vivant, intact.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Compass className="h-4 w-4 text-emerald-400" /> Actions gravées
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{thread?.total_actions ?? 0}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Globe2 className="h-4 w-4 text-cyan-400" /> Jours actifs
          </div>
          <p className="mt-2 text-2xl font-bold text-cyan-300">{thread?.active_days ?? 0}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Flame className="h-4 w-4 text-orange-400" /> Streak
          </div>
          <p className="mt-2 text-2xl font-bold text-orange-300">{streak}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Heart className="h-4 w-4 text-rose-400" /> Énergie VEDA
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-300">{energy}%</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Progression par langue</h2>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-[var(--text-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" /> VEDA charge…
          </div>
        ) : progress.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-muted)]">
            Aucune progression enregistrée encore. Lance ta première session.
          </p>
        ) : (
          <ul className="space-y-3">
            {progress.map(p => {
              const meta = LEARNING_LANGUAGES.find(l => l.code === p.language)
              return (
                <li key={p.language} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{meta?.flag} {meta?.name ?? p.language}</span>
                    <span className="text-xs text-[var(--text-muted)]">{GRADUATION_LABEL[p.phonetic_graduation]}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, p.fluency_percent)}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-[var(--text-muted)]">
                    <span>{p.words_known} mots</span>
                    <span>{p.hours_spoken.toFixed(1)} h parlées</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Card className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-violet-400" />
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Dernières sessions</h2>
        </div>
        {loading ? null : sessions.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-muted)]">
            Encore aucune session. Tape ta première phrase dans Natif Instinct™.
          </p>
        ) : (
          <ul className="space-y-2">
            {sessions.map(s => {
              const meta = LEARNING_LANGUAGES.find(l => l.code === s.language)
              return (
                <li key={s.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span>{meta?.flag}</span>
                    <span className="font-medium capitalize">{s.mode}</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="text-xs text-emerald-300">+{s.xp_earned} XP</span>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
