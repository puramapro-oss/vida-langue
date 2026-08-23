'use client'

import { Brain, Mic, Volume2, Moon, Sparkles, Globe, Users, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

type ModeAccent = {
  hex: string
  glow: string
  ring: string
  bg: string
}

const MODES: {
  icon: typeof Brain
  name: string
  desc: string
  duration: string
  accent: ModeAccent
}[] = [
  {
    icon: Brain,
    name: 'NeuroFlow',
    desc: 'Respiration → immersion double canal → scellage neurologique.',
    duration: '25 min',
    accent: {
      hex: '#7C3AED',
      glow: 'rgba(124, 58, 237, 0.35)',
      ring: 'rgba(124, 58, 237, 0.4)',
      bg: 'rgba(124, 58, 237, 0.12)',
    },
  },
  {
    icon: Mic,
    name: 'HoloTalk',
    desc: 'Conversations vocales avec personnages IA. Voix émotionnelles, mémoire longue.',
    duration: '10 min',
    accent: {
      hex: '#10B981',
      glow: 'rgba(16, 185, 129, 0.35)',
      ring: 'rgba(16, 185, 129, 0.4)',
      bg: 'rgba(16, 185, 129, 0.12)',
    },
  },
  {
    icon: Volume2,
    name: 'Natif Instinct',
    desc: 'Phonétique VEDA adaptée à ta langue maternelle. Phrase → son → sens.',
    duration: '5 min',
    accent: {
      hex: '#06B6D4',
      glow: 'rgba(6, 182, 212, 0.35)',
      ring: 'rgba(6, 182, 212, 0.4)',
      bg: 'rgba(6, 182, 212, 0.12)',
    },
  },
  {
    icon: Moon,
    name: 'SleepSync',
    desc: 'Avant de dormir. Voix lente, consolidation sommeil léger.',
    duration: '8 min',
    accent: {
      hex: '#3B82F6',
      glow: 'rgba(59, 130, 246, 0.35)',
      ring: 'rgba(59, 130, 246, 0.4)',
      bg: 'rgba(59, 130, 246, 0.12)',
    },
  },
  {
    icon: Sparkles,
    name: 'Hypno-Immersif',
    desc: 'Voix binaurale + micro-vibrations. Double canal conscient/inconscient.',
    duration: '20 min',
    accent: {
      hex: '#8B5CF6',
      glow: 'rgba(139, 92, 246, 0.35)',
      ring: 'rgba(139, 92, 246, 0.4)',
      bg: 'rgba(139, 92, 246, 0.12)',
    },
  },
  {
    icon: Globe,
    name: 'Réalité Parallèle',
    desc: 'Monde vocal immersif : voyages, négociations, conflits. 100% voix.',
    duration: '15 min',
    accent: {
      hex: '#F59E0B',
      glow: 'rgba(245, 158, 11, 0.35)',
      ring: 'rgba(245, 158, 11, 0.4)',
      bg: 'rgba(245, 158, 11, 0.12)',
    },
  },
  {
    icon: Users,
    name: 'Groupe',
    desc: 'Parle avec une personne réelle. Groupes auto-créés par niveau.',
    duration: '30 min',
    accent: {
      hex: '#EC4899',
      glow: 'rgba(236, 72, 153, 0.35)',
      ring: 'rgba(236, 72, 153, 0.4)',
      bg: 'rgba(236, 72, 153, 0.12)',
    },
  },
  {
    icon: Heart,
    name: 'Spirituel',
    desc: 'Méditation, gratitude, langues sacrées (angélique, kundalini).',
    duration: '15 min',
    accent: {
      hex: '#D97706',
      glow: 'rgba(217, 119, 6, 0.35)',
      ring: 'rgba(217, 119, 6, 0.4)',
      bg: 'rgba(217, 119, 6, 0.12)',
    },
  },
]

export default function ModesSection() {
  return (
    <section id="modes" className="relative px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight md:text-4xl">
            8 modes d&apos;immersion
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[var(--text-secondary)]">
            Chacun cible un canal d&apos;ancrage différent.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MODES.map((mode, i) => {
            const Icon = mode.icon
            return (
              <motion.div
                key={mode.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
                style={{
                  boxShadow: `0 0 0 0 ${mode.accent.glow}`,
                }}
              >
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: mode.accent.bg,
                    boxShadow: `0 0 20px ${mode.accent.glow}`,
                  }}
                >
                  <Icon className="h-6 w-6" style={{ color: mode.accent.hex }} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{mode.name}</h3>
                <p className="mb-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {mode.desc}
                </p>
                <p className="text-xs font-medium" style={{ color: mode.accent.hex }}>
                  {mode.duration}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
