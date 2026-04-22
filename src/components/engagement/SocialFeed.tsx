'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Heart, Flame, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface FeedEvent {
  id: string
  kind: 'streak' | 'palier' | 'gratitude' | 'achievement'
  actor_first_name: string | null
  text: string
  created_at: string
}

/**
 * SocialFeed VEDA — Wealth Engine Phase 1.
 * Affiche les victoires communautaires SANS montants €.
 * Objectif : motivation, pas jalousie. Pseudonymisation first_name uniquement.
 */
export default function SocialFeed({ limit = 8 }: { limit?: number }) {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        // Remplace par une table `social_feed` en P4 si besoin ; fallback sur achievements.
        const { data } = await supabase
          .from('achievements')
          .select('id, user_id, badge_type, unlocked_at')
          .order('unlocked_at', { ascending: false })
          .limit(limit)

        if (!mounted) return
        if (!data) {
          setEvents([])
          setLoading(false)
          return
        }
        const mapped: FeedEvent[] = data.map((a: { id: string; badge_type: string; unlocked_at: string }) => ({
          id: a.id,
          kind: 'achievement' as const,
          actor_first_name: null,
          text: `Quelqu'un a débloqué ${a.badge_type}`,
          created_at: a.unlocked_at,
        }))
        setEvents(mapped)
        setLoading(false)
      } catch {
        if (mounted) {
          setEvents([])
          setLoading(false)
        }
      }
    }
    void load()
    return () => { mounted = false }
  }, [supabase, limit])

  const iconFor = (k: FeedEvent['kind']) => {
    switch (k) {
      case 'streak': return Flame
      case 'palier': return Trophy
      case 'gratitude': return Heart
      default: return Sparkles
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <p className="text-xs uppercase tracking-wider text-emerald-300">La communauté VEDA</p>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">Chargement…</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <p className="text-xs uppercase tracking-wider text-emerald-300">La communauté VEDA</p>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Sois le premier à marquer un palier aujourd'hui 🌱
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-wider text-emerald-300">La communauté VEDA</p>
        <p className="text-[11px] text-[var(--text-muted)]">Anonymisé · sans montants</p>
      </div>
      <ul className="mt-4 space-y-3">
        {events.map((e) => {
          const Ic = iconFor(e.kind)
          return (
            <li key={e.id} className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
                <Ic className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{e.text}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
