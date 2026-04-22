'use client'

import { motion } from 'framer-motion'
import { Flame, Heart, Share2, Trophy } from 'lucide-react'

interface FlywheelProps {
  streak?: number
  impactActions?: number
  referrals?: number
  achievements?: number
}

/**
 * Flywheel VEDA — Wealth Engine Phase 1.
 * Visualise la boucle virale : action → impact → récompense → partage.
 * 0 montant € affiché (SocialFeed principe : badges + progression, pas cash).
 */
export default function Flywheel({
  streak = 0,
  impactActions = 0,
  referrals = 0,
  achievements = 0,
}: FlywheelProps) {
  const nodes = [
    { icon: Flame, label: 'Streak', value: `${streak}j`, color: 'from-orange-400/70 to-red-500/60' },
    { icon: Heart, label: 'Impact', value: `${impactActions}`, color: 'from-emerald-400/70 to-teal-500/60' },
    { icon: Share2, label: 'Partages', value: `${referrals}`, color: 'from-cyan-400/70 to-sky-500/60' },
    { icon: Trophy, label: 'Paliers', value: `${achievements}`, color: 'from-purple-400/70 to-fuchsia-500/60' },
  ]

  return (
    <div className="relative rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 backdrop-blur-xl">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
          Ta boucle VEDA
        </h3>
        <p className="text-xs text-[var(--text-muted)]">Plus tu avances, plus elle accélère.</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {nodes.map((n, i) => {
          const Ic = n.icon
          return (
            <motion.div
              key={n.label}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${n.color} p-4`}
            >
              <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-white/10 blur-2xl" />
              <Ic className="h-5 w-5 text-white/90" strokeWidth={1.8} />
              <p className="mt-3 text-2xl font-bold text-white">{n.value}</p>
              <p className="text-[11px] uppercase tracking-wider text-white/80">{n.label}</p>
            </motion.div>
          )
        })}
      </div>

      <p className="mt-5 text-xs text-[var(--text-secondary)]">
        Chaque action alimente la suivante. Parle → impact → partage → nouveau filleul → nouveau palier.
      </p>
    </div>
  )
}
