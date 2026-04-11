'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, Heart, Trees, Users, Globe2, Megaphone, Loader2, Check,
} from 'lucide-react'
import { toast } from 'sonner'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'

interface Mission {
  id: string
  title: string
  description: string | null
  type: 'solo' | 'duo' | 'group' | 'humanitarian' | 'promo' | 'ecological' | 'spiritual'
  reward_type: string
  reward_value: number
  language: string | null
  difficulty: string
}

interface UserMission {
  mission_id: string
  status: string
}

const TYPE_META: Record<string, { icon: typeof Sparkles; color: string; bg: string }> = {
  solo: { icon: Sparkles, color: 'text-emerald-300', bg: 'bg-emerald-500/15' },
  duo: { icon: Users, color: 'text-cyan-300', bg: 'bg-cyan-500/15' },
  group: { icon: Users, color: 'text-violet-300', bg: 'bg-violet-500/15' },
  humanitarian: { icon: Heart, color: 'text-rose-300', bg: 'bg-rose-500/15' },
  ecological: { icon: Trees, color: 'text-lime-300', bg: 'bg-lime-500/15' },
  promo: { icon: Megaphone, color: 'text-amber-300', bg: 'bg-amber-500/15' },
  spiritual: { icon: Globe2, color: 'text-fuchsia-300', bg: 'bg-fuchsia-500/15' },
}

const REWARD_LABEL: Record<string, string> = {
  euros: '€',
  vida_credits: 'crédits Vida',
  contest_entries: 'tickets concours',
  light_points: 'pts lumière',
  cashback: 'cashback',
  products: 'produits',
}

export default function MissionsPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [missions, setMissions] = useState<Mission[]>([])
  const [userMissions, setUserMissions] = useState<UserMission[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    let cancelled = false
    void (async () => {
      const [{ data: m }, { data: um }] = await Promise.all([
        supabase
          .from('missions')
          .select('id, title, description, type, reward_type, reward_value, language, difficulty')
          .eq('active', true)
          .order('created_at', { ascending: true }),
        supabase
          .from('user_missions')
          .select('mission_id, status')
          .eq('user_id', profile.id),
      ])
      if (cancelled) return
      setMissions((m as Mission[]) ?? [])
      setUserMissions((um as UserMission[]) ?? [])
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [profile, supabase])

  const statusOf = (id: string) => userMissions.find(u => u.mission_id === id)?.status ?? null

  async function startMission(missionId: string) {
    if (!profile || completing) return
    setCompleting(missionId)
    try {
      const { error } = await supabase
        .from('user_missions')
        .upsert({
          user_id: profile.id,
          mission_id: missionId,
          status: 'in_progress',
        }, { onConflict: 'user_id,mission_id' as never })

      if (error) {
        toast.error('Vida n\'a pas pu démarrer la mission.')
        return
      }
      setUserMissions(prev => {
        const filtered = prev.filter(u => u.mission_id !== missionId)
        return [...filtered, { mission_id: missionId, status: 'in_progress' }]
      })
      toast.success('Mission acceptée. Bonne route 🌿')
    } finally {
      setCompleting(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6" data-testid="missions-page">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wider text-emerald-400">Missions Vida</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight md:text-4xl">
          Apprendre, c&apos;est aussi changer le monde
        </h1>
        <p className="max-w-2xl text-[var(--text-secondary)]">
          Chaque mission accomplie te rapproche de la fluidité et grave un impact réel.
          Solo, duo, humanitaire, écologique, spirituel.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-[var(--text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Vida charge tes missions…
        </div>
      ) : missions.length === 0 ? (
        <Card className="p-12 text-center text-[var(--text-muted)]">
          Aucune mission active pour l&apos;instant. Vida prépare la prochaine vague.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {missions.map((mission, idx) => {
            const meta = TYPE_META[mission.type] ?? TYPE_META.solo
            const Icon = meta.icon
            const status = statusOf(mission.id)
            const inProgress = status === 'in_progress' || status === 'completed'

            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                data-testid={`mission-${mission.id}`}
              >
                <Card className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${meta.bg} ${meta.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs uppercase tracking-wider text-[var(--text-muted)]">
                      {mission.type}
                    </span>
                  </div>

                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-semibold">
                    {mission.title}
                  </h3>
                  {mission.description && (
                    <p className="mt-1 flex-1 text-sm text-[var(--text-secondary)]">{mission.description}</p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span className={`rounded-full ${meta.bg} px-3 py-1 text-xs font-medium ${meta.color}`}>
                      +{mission.reward_value} {REWARD_LABEL[mission.reward_type] ?? mission.reward_type}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => startMission(mission.id)}
                      disabled={inProgress || completing === mission.id}
                      loading={completing === mission.id}
                      data-testid={`start-${mission.id}`}
                      className="!bg-gradient-to-r !from-emerald-500 !to-emerald-600 !text-white"
                    >
                      {status === 'completed' ? (
                        <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Faite</span>
                      ) : status === 'in_progress' ? 'En cours' : 'Accepter'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
