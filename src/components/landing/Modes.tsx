'use client'

import { useState, useRef, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import {
  Brain, Mic, Volume2, Moon, Sparkles, Globe, Users, Heart,
} from 'lucide-react'

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

function ModeCard({ mode, index }: { mode: typeof MODES[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const Icon = mode.icon

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const card = ref.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
    // tilt léger : -4deg → +4deg
    const tiltY = ((x / rect.width) - 0.5) * 8
    const tiltX = -((y / rect.height) - 0.5) * 8
    setTilt({ x: tiltX, y: tiltY })
  }

  function handleLeave() {
    setTilt({ x: 0, y: 0 })
  }

  const style = {
    '--spotlight-color': mode.accent.glow,
    transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
  } as React.CSSProperties

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      style={style}
      className="spotlight-card group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.18]"
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset transition-transform duration-300 group-hover:scale-110"
        style={{
          backgroundColor: mode.accent.bg,
          color: mode.accent.hex,
          boxShadow: `inset 0 0 0 1px ${mode.accent.ring}`,
        }}
      >
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <h3 className="mt-6 text-base font-semibold text-white">{mode.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{mode.desc}</p>
      <p
        className="mt-6 text-xs font-medium uppercase tracking-wider"
        style={{ color: mode.accent.hex }}
      >
        {mode.duration}
      </p>
    </motion.div>
  )
}

export default function Modes() {
  return (
    <section id="modes" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
            8 modes d&apos;apprentissage.<br />
            <span className="text-[var(--text-secondary)]">Un seul objectif : la fluidité.</span>
          </h2>
          <p className="mt-6 text-base text-[var(--text-secondary)]">
            Choisis ton mode selon ton humeur, ton énergie, ton moment. VEDA s&apos;adapte — toi, tu parles.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MODES.map((m, i) => (
            <ModeCard key={m.name} mode={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
