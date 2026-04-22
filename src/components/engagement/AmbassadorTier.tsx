'use client'

import { motion } from 'framer-motion'

export type AmbassadorTierId = 'bronze' | 'argent' | 'or' | 'platine' | 'diamant' | 'legende' | 'eternel'

export const AMBASSADOR_TIERS = [
  { id: 'bronze', label: 'Bronze', minConversions: 1, color: '#cd7f32', perk: 'VEDA Mensuel offert' },
  { id: 'argent', label: 'Argent', minConversions: 10, color: '#94a3b8', perk: 'VEDA Annuel offert' },
  { id: 'or', label: 'Or', minConversions: 25, color: '#f59e0b', perk: 'Page perso /p/[slug]' },
  { id: 'platine', label: 'Platine', minConversions: 50, color: '#e879f9', perk: 'Coach NAMA dédié' },
  { id: 'diamant', label: 'Diamant', minConversions: 100, color: '#06b6d4', perk: 'VIP événements' },
  { id: 'legende', label: 'Légende', minConversions: 250, color: '#10B981', perk: 'Commissions héréditaires' },
  { id: 'eternel', label: 'Éternel', minConversions: 1000, color: '#fde047', perk: '1% parts VEDA · à vie' },
] as const

export function resolveTier(conversions: number): typeof AMBASSADOR_TIERS[number] {
  const reversed = [...AMBASSADOR_TIERS].reverse()
  return reversed.find((t) => conversions >= t.minConversions) ?? AMBASSADOR_TIERS[0]
}

interface AmbassadorTierProps {
  conversions: number
  compact?: boolean
}

/**
 * AmbassadorTier VEDA — Wealth Engine Phase 1.
 * Affiche le palier courant + palier suivant + progression.
 * Tiers : Bronze → Argent → Or → Platine → Diamant → Légende → Éternel.
 */
export default function AmbassadorTier({ conversions, compact = false }: AmbassadorTierProps) {
  const current = resolveTier(conversions)
  const currentIdx = AMBASSADOR_TIERS.findIndex((t) => t.id === current.id)
  const next = AMBASSADOR_TIERS[currentIdx + 1] ?? null
  const progress = next
    ? Math.min(100, Math.round(((conversions - current.minConversions) / (next.minConversions - current.minConversions)) * 100))
    : 100

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: current.color }} />
        <span className="font-semibold text-white">{current.label}</span>
        <span className="text-[var(--text-muted)]">· {conversions} conversions</span>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 backdrop-blur-xl">
      <div className="flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-wider text-emerald-300">Ton palier</p>
        <p className="text-[11px] text-[var(--text-muted)]">{conversions} conversion{conversions > 1 ? 's' : ''}</p>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-[#0A0A0F]"
          style={{ background: `linear-gradient(135deg, ${current.color}dd, ${current.color}99)` }}
        >
          {current.label.slice(0, 1)}
        </div>
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl font-bold text-white">{current.label}</p>
          <p className="text-xs text-[var(--text-secondary)]">{current.perk}</p>
        </div>
      </div>

      {next && (
        <div className="mt-5">
          <div className="flex items-baseline justify-between text-xs text-[var(--text-secondary)]">
            <span>Vers {next.label}</span>
            <span>{conversions}/{next.minConversions}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${current.color}, ${next.color})` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-[var(--text-muted)]">{next.perk} — débloqué à {next.minConversions} filleuls.</p>
        </div>
      )}
    </div>
  )
}
