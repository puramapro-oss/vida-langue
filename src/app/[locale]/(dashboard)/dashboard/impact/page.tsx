'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Leaf, Heart, Users, Sparkles, TreePine, Droplets, Wind, Trash2,
  TrendingUp, Globe2, Calendar,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { cn, formatDate } from '@/lib/utils'

interface ImpactEntry {
  id: string
  user_id: string
  action: string
  impact_type: 'ecological' | 'human' | 'social' | 'wellbeing'
  impact_value: number | null
  equivalent_text: string | null
  partner_org: string | null
  created_at: string
}

interface ImpactSummary {
  ecological: number
  human: number
  social: number
  wellbeing: number
  total: number
}

const IMPACT_TYPE_META: Record<ImpactEntry['impact_type'], { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  ecological: { label: 'Écologique', color: '#10B981', icon: Leaf },
  human: { label: 'Humain', color: '#F472B6', icon: Heart },
  social: { label: 'Social', color: '#06B6D4', icon: Users },
  wellbeing: { label: 'Bien-être', color: '#A855F7', icon: Sparkles },
}

export default function ImpactPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<ImpactEntry[]>([])
  const [collectiveTotal, setCollectiveTotal] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const [personal, collective] = await Promise.all([
        supabase
          .from('impact_log')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('impact_log')
          .select('*', { count: 'exact', head: true }),
      ])
      if (personal.data) setEntries(personal.data as ImpactEntry[])
      if (collective.count !== null) setCollectiveTotal(collective.count)
      setLoading(false)
    }
    void load()
  }, [user, supabase])

  const summary = useMemo<ImpactSummary>(() => {
    const s: ImpactSummary = { ecological: 0, human: 0, social: 0, wellbeing: 0, total: 0 }
    for (const e of entries) {
      const v = Number(e.impact_value ?? 0)
      s[e.impact_type] += v
      s.total += v
    }
    return s
  }, [entries])

  // Equivalents calculés depuis l'impact écologique (1 point d'impact ≈ 1 unité)
  // Hypothèse simple : impact_value en kg CO₂ pour ecological, "personnes" pour human
  const equivalents = useMemo(() => {
    return [
      {
        icon: TreePine,
        color: '#10B981',
        value: Math.round(summary.ecological / 22), // 1 arbre absorbe ~22kg CO₂/an
        label: 'arbre' + (Math.round(summary.ecological / 22) > 1 ? 's' : '') + ' équivalent',
        hint: '1 arbre = 22 kg CO₂/an',
      },
      {
        icon: Wind,
        color: '#06B6D4',
        value: Math.round(summary.ecological),
        label: 'kg de CO₂ évités',
        hint: 'Cumul écologique',
      },
      {
        icon: Droplets,
        color: '#3B82F6',
        value: Math.round(summary.ecological * 5), // 1kg CO₂ ~ 5L eau économisée
        label: 'litres d\'eau préservés',
        hint: 'Estimation : 5L par kg CO₂ évité',
      },
      {
        icon: Trash2,
        color: '#F59E0B',
        value: Math.round(summary.ecological / 3),
        label: 'kg de déchets évités',
        hint: '1 sac de déchets ≈ 3 kg CO₂',
      },
    ]
  }, [summary])

  const projectionAnnual = useMemo(() => {
    // Si tu continues au rythme actuel des 30 derniers jours
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now()
    const last30 = entries.filter((e) => {
      const ageMs = now - new Date(e.created_at).getTime()
      return ageMs < 30 * 24 * 60 * 60 * 1000
    })
    const monthlyImpact = last30.reduce((sum, e) => sum + Number(e.impact_value ?? 0), 0)
    return Math.round(monthlyImpact * 12)
  }, [entries])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
          <Leaf className="h-7 w-7 text-[var(--green)]" />
          Mon Impact
        </h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          Chaque action que tu fais avec VEDA laisse une trace dans le monde réel.
        </p>
      </div>

      {/* Résumé 4 dimensions */}
      <div className="grid gap-4 md:grid-cols-4">
        {(Object.keys(IMPACT_TYPE_META) as Array<keyof typeof IMPACT_TYPE_META>).map((key) => {
          const meta = IMPACT_TYPE_META[key]
          const Icon = meta.icon
          const value = summary[key]
          return (
            <Card key={key} className="p-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: `${meta.color}18`, color: meta.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{meta.label}</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {value.toFixed(value < 10 ? 1 : 0)}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Equivalents réels */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-[var(--green)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Tes équivalents réels</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {equivalents.map(({ icon: Icon, color, value, label, hint }) => (
            <div key={label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${color}18`, color }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{value.toLocaleString('fr-FR')}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Projection + collectif */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 ring-1 ring-[var(--green)]/20 bg-gradient-to-br from-[var(--green)]/[0.04] to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-[var(--green)]" />
            <h3 className="font-semibold text-[var(--text-primary)]">Projection sur 1 an</h3>
          </div>
          <p className="text-[var(--text-secondary)] text-sm mb-4">
            Si tu continues au rythme des 30 derniers jours :
          </p>
          <p className="text-4xl font-bold text-[var(--green)]">
            {projectionAnnual.toLocaleString('fr-FR')}
            <span className="text-lg font-normal text-[var(--text-secondary)] ml-2">points d&apos;impact / an</span>
          </p>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            ≈ {Math.round(projectionAnnual / 22)} arbres équivalents par an
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-[var(--text-secondary)]" />
            <h3 className="font-semibold text-[var(--text-primary)]">Impact collectif VEDA</h3>
          </div>
          <p className="text-[var(--text-secondary)] text-sm mb-4">
            Toutes les actions de tous les apprenants VEDA cumulées :
          </p>
          <p className="text-4xl font-bold text-[var(--text-primary)]">
            {collectiveTotal.toLocaleString('fr-FR')}
            <span className="text-lg font-normal text-[var(--text-secondary)] ml-2">actions</span>
          </p>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Tu fais partie d&apos;un mouvement. Chaque session compte.
          </p>
        </Card>
      </div>

      {/* Historique */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[var(--text-secondary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Tes 100 dernières actions</h2>
        </div>
        {entries.length === 0 ? (
          <EmptyState
            icon={<Leaf className="h-12 w-12" />}
            title="Aucun impact enregistré pour l'instant"
            description="Termine une mission ou une session pour commencer à laisser ta trace dans le monde."
          />
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {entries.map((e) => {
              const meta = IMPACT_TYPE_META[e.impact_type]
              const Icon = meta.icon
              return (
                <div
                  key={e.id}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors',
                  )}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${meta.color}18`, color: meta.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[var(--text-primary)]">{e.action}</p>
                    {e.equivalent_text && (
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{e.equivalent_text}</p>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span>{formatDate(e.created_at)}</span>
                      {e.partner_org && (
                        <>
                          <span>·</span>
                          <span>{e.partner_org}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {e.impact_value !== null && (
                    <span className="text-sm font-semibold" style={{ color: meta.color }}>
                      +{Number(e.impact_value).toFixed(1)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
