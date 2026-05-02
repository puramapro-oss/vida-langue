'use client'

import { useState, useEffect, useRef, type MouseEvent } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useSpring, type MotionStyle } from 'framer-motion'
import {
  Brain, Mic, Volume2, Moon, Sparkles, Globe, Users, Heart,
  Check, ChevronDown, Menu, X, Leaf, ArrowRight, Send, Loader2,
} from 'lucide-react'
import CursorGlow from '@/components/landing/CursorGlow'
import MagneticButton from '@/components/landing/MagneticButton'
import AnimatedCounter from '@/components/landing/AnimatedCounter'
import ScrollRevealText from '@/components/landing/ScrollRevealText'

// Hero3D = lourd → ssr:false + dynamic
const Hero3D = dynamic(() => import('@/components/landing/Hero3D'), {
  ssr: false,
  loading: () => null,
})

// ─── Modes : 8 cartes avec palette unique ──────────────────────────────────
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

const FAQ = [
  { q: 'Ça marche vraiment en 30 jours ?', a: 'La phonétique VEDA adapte chaque son à ta langue maternelle. En 30 jours à raison de 15 min/jour, tu tiens une conversation fluide sur les sujets du quotidien.' },
  { q: 'Sans cours, sans théorie ?', a: 'Zéro grammaire explicite. Ton cerveau absorbe les structures comme un enfant — par exposition guidée, répétition contextuelle et émotion.' },
  { q: 'Quelles langues sont disponibles ?', a: '50+ langues couvertes par NAMA-Polyglotte : latines, germaniques, slaves, sino-tibétaines, arabo-sémitiques, indo-iraniennes, japonaise, coréenne, turques, africaines, austronésiennes, langues des signes LSF/ASL, ainsi que des langues d\'éveil (langue des anges, langue de lumière, yatra kundalini).' },
  { q: 'Je peux essayer avant de payer ?', a: '14 jours offerts, sans carte. Accès complet à tous les modes. Si tu n\'es pas conquis, tu pars sans rien payer.' },
  { q: 'Comment se passe l\'annulation ?', a: 'Un clic dans ton espace. Pas d\'appel, pas de mail, pas de justification. Tu gardes l\'accès jusqu\'à la fin de la période déjà payée.' },
] as const

// ─── Navigation premium ────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-2xl bg-[rgba(4,10,7,0.72)] border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-[10px] bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center shadow-[0_0_20px_rgba(16,185,129,0.35)]">
              <Leaf className="h-4 w-4 text-emerald-950" strokeWidth={2.5} />
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">
              VEDA
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-[var(--text-secondary)]">
            <a href="#modes" className="hover:text-white transition-colors">Modes</a>
            <a href="#method" className="hover:text-white transition-colors">Méthode</a>
            <Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-white text-emerald-950 px-4 py-2 text-sm font-semibold hover:bg-emerald-50 transition-colors"
            >
              Commencer
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white"
            aria-label="Menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden backdrop-blur-2xl bg-[rgba(4,10,7,0.96)] border-t border-white/[0.06]"
          >
            <div className="flex flex-col gap-1 px-6 py-6">
              {[
                { href: '#modes', label: 'Modes' },
                { href: '#method', label: 'Méthode' },
                { href: '/pricing', label: 'Tarifs' },
                { href: '#faq', label: 'FAQ' },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-base text-white/90 hover:text-white"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="rounded-full border border-white/15 px-4 py-3 text-center text-sm text-white"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-emerald-950"
                >
                  Commencer
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

// ─── Compteurs DB live ──────────────────────────────────────────────────────
function LiveStats() {
  const [stats, setStats] = useState<{ learners: number; languages: number; sessions: number } | null>(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/status', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!mounted || !data) return
        setStats({
          learners: Number(data.learners ?? 0),
          languages: Number(data.languages ?? 50),
          sessions: Number(data.sessions ?? 0),
        })
      })
      .catch(() => {
        if (!mounted) return
        setStats({ learners: 0, languages: 50, sessions: 0 })
      })
    return () => { mounted = false }
  }, [])

  const learners = stats?.learners ?? 0
  const languages = stats?.languages ?? 50
  const sessions = stats?.sessions ?? 0

  return (
    <div className="mt-12 grid grid-cols-3 gap-4 text-center sm:gap-8">
      <div>
        <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
          <AnimatedCounter value={learners} />
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-[var(--text-muted)]">Apprenants</p>
      </div>
      <div>
        <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
          <AnimatedCounter value={languages} suffix="+" />
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-[var(--text-muted)]">Langues</p>
      </div>
      <div>
        <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
          <AnimatedCounter value={sessions} />
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-[var(--text-muted)]">Sessions guidées</p>
      </div>
    </div>
  )
}

// ─── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* Couches background : aurora + grille + noise + blobs + 3D */}
      <div aria-hidden className="aurora-rich">
        <span />
      </div>
      <div aria-hidden className="grid-overlay absolute inset-0" />
      <div aria-hidden className="noise-overlay absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[140px]" />
        <div className="absolute right-[-10%] top-1/3 h-[420px] w-[420px] rounded-full bg-teal-400/10 blur-[120px]" />
        <div className="absolute left-[-10%] bottom-0 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* Sphère 3D en arrière-plan, ssr:false */}
      <Hero3D />

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Nouvelle méthode — 14 jours offerts
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-8 font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl"
          >
            Parle une langue<br />
            <span className="hue-shift">en 30 jours.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-lg text-[var(--text-secondary)] sm:text-xl"
          >
            VEDA grave les langues dans ton cerveau par la phonétique, la voix
            et l&apos;immersion. Guidée par <span className="text-emerald-300 font-semibold">NAMA-Polyglotte</span>.
            Sans cours. Sans stress. Sans théorie.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <MagneticButton
              href="/signup"
              className="group h-12 gap-2 rounded-full bg-white px-6 text-sm font-semibold text-emerald-950 shadow-[0_8px_32px_rgba(16,185,129,0.25)] hover:bg-emerald-50 transition-colors"
              ariaLabel="Commencer 14 jours offerts"
            >
              Commencer 14 jours offerts
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </MagneticButton>
            <MagneticButton
              href="#modes"
              className="h-12 rounded-full border border-white/15 bg-white/[0.03] px-6 text-sm font-medium text-white hover:bg-white/[0.06] transition-colors"
              strength={0.18}
              ariaLabel="Voir les 8 modes"
            >
              Voir les 8 modes
            </MagneticButton>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 text-xs text-[var(--text-muted)]"
          >
            Sans carte bancaire · Annulation 1 clic · 50+ langues
          </motion.p>
        </div>

        {/* Teaser 3 modes phares */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {[
            { icon: Volume2, name: 'Natif Instinct', tag: 'Phonétique 3 couches' },
            { icon: Mic, name: 'HoloTalk', tag: 'Voix vivante · mémoire longue' },
            { icon: Brain, name: 'NeuroFlow', tag: 'État flow profond' },
          ].map((m) => {
            const Ic = m.icon
            return (
              <a
                key={m.name}
                href="#modes"
                className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 backdrop-blur-xl transition-all hover:border-emerald-400/30 hover:bg-white/[0.04]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
                  <Ic className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{m.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{m.tag}</p>
                </div>
              </a>
            )
          })}
        </motion.div>

        {/* Stats animées (DB live, jamais de faux chiffre) */}
        <LiveStats />
      </div>
    </section>
  )
}

// ─── Modes : 8 cards avec spotlight + tilt 3D ───────────────────────────────
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

function Modes() {
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

// ─── Method : timeline 3 étapes avec ligne pointillée animée ───────────────
function Method() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.7', 'end 0.3'],
  })
  const lineHeight = useSpring(scrollYProgress, { stiffness: 80, damping: 20 })

  const steps = [
    { n: '01', title: 'Tu choisis une langue', desc: 'Parmi 50+. NAMA calibre la phonétique à ta langue maternelle.' },
    { n: '02', title: 'Tu ouvres un mode', desc: 'NeuroFlow le matin, HoloTalk à midi, SleepSync le soir. 5 à 30 min.' },
    { n: '03', title: 'Tu parles', desc: 'Jour 30 : tu commandes un café, tu négocies, tu flirtes. Dans leur langue.' },
  ] as const

  return (
    <section id="method" ref={containerRef} className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Trois étapes.<br />
            <span className="text-[var(--text-secondary)]">Aucune friction.</span>
          </h2>
        </div>

        <div className="relative mt-20">
          {/* Ligne verticale pointillée animée — visible md+ */}
          <div className="pointer-events-none absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px md:block">
            <div className="h-full w-full border-l border-dashed border-white/10" />
            <motion.div
              aria-hidden
              className="absolute inset-x-0 top-0 origin-top"
              style={{
                scaleY: lineHeight as unknown as MotionStyle['scaleY'],
                background:
                  'linear-gradient(to bottom, rgba(16,185,129,0) 0%, rgba(16,185,129,0.6) 50%, rgba(6,182,212,0) 100%)',
                width: '2px',
                height: '100%',
                left: '-1px',
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-xl"
              >
                <p className="font-[family-name:var(--font-display)] text-6xl font-bold leading-none tracking-tight text-emerald-400/90">
                  {s.n}
                </p>
                <h3 className="mt-5 text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Scroll reveal — phrase signature ──────────────────────────────────────
function ScrollPunchline() {
  return (
    <section className="relative py-32 sm:py-40">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <ScrollRevealText
          text="Jour 30. Tu commandes un café. Dans leur langue."
          className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl"
        />
      </div>
    </section>
  )
}

// ─── Pricing teaser ────────────────────────────────────────────────────────
function PricingTeaser() {
  const perks = [
    'Accès aux 8 modes',
    '50+ langues disponibles',
    'HoloTalk voix illimité',
    'SleepSync & Hypno-Immersif',
    'Voix immersive multilingue',
    'Annulation en 1 clic',
  ] as const

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-8 backdrop-blur-xl sm:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-[100px]" />
          <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-teal-400/10 blur-[80px]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <Leaf className="h-3 w-3" strokeWidth={2.5} />
              Essai 14 jours offerts
            </div>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
              12,90 € / mois.<br />
              <span className="text-[var(--text-secondary)]">Sans engagement.</span>
            </h2>
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <MagneticButton
                href="/signup"
                className="h-12 rounded-full bg-white px-6 text-sm font-semibold text-emerald-950 hover:bg-emerald-50 transition-colors"
                ariaLabel="Commencer 14 jours offerts"
              >
                Commencer — 14 jours offerts
              </MagneticButton>
              <MagneticButton
                href="/pricing"
                strength={0.18}
                className="h-12 rounded-full border border-white/15 px-6 text-sm font-medium text-white hover:bg-white/[0.04] transition-colors"
                ariaLabel="Voir tous les plans"
              >
                Voir tous les plans
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Témoignages désactivés (CTA "rejoins les premiers") ───────────────────
function FuturePraise() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-xl sm:p-12">
          <div className="text-center">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ils gravent leur langue avec VEDA
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Bientôt : retours des premiers apprenants. Pas d&apos;avis inventés, pas de témoignages fabriqués.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                aria-hidden
                className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5"
                style={{ filter: 'blur(8px)', opacity: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-400/30" />
                  <div className="space-y-1.5">
                    <div className="h-2 w-16 rounded-full bg-white/30" />
                    <div className="h-2 w-12 rounded-full bg-white/20" />
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  <div className="h-1.5 w-full rounded-full bg-white/20" />
                  <div className="h-1.5 w-5/6 rounded-full bg-white/20" />
                  <div className="h-1.5 w-2/3 rounded-full bg-white/20" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <MagneticButton
              href="/signup"
              className="h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(16,185,129,0.35)] hover:from-emerald-400 hover:to-teal-400 transition-colors"
              ariaLabel="Rejoins les premiers apprenants"
            >
              Rejoins les premiers apprenants
              <ArrowRight className="ml-2 h-4 w-4" />
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CTA finale ─────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-32">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.18) 0%, rgba(16,185,129,0.06) 35%, transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Une langue. 30 jours.<br />
          <span className="hue-shift">Aujourd&apos;hui.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base text-[var(--text-secondary)] sm:text-lg">
          NAMA-Polyglotte t&apos;attend. 14 jours offerts. Aucun engagement.
        </p>
        <div className="mt-10 flex justify-center">
          <MagneticButton
            href="/signup"
            className="h-14 gap-2 rounded-full bg-white px-8 text-base font-semibold text-emerald-950 shadow-[0_12px_40px_rgba(16,185,129,0.35)] hover:bg-emerald-50 transition-colors"
            ariaLabel="Commencer maintenant"
          >
            Commencer maintenant
            <ArrowRight className="h-5 w-5" />
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ────────────────────────────────────────────────────────────────────
function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <h2 className="text-center font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Questions fréquentes.
        </h2>
        <div className="mt-12 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
          {FAQ.map((f, i) => (
            <button
              key={f.q}
              onClick={() => setOpen(open === i ? null : i)}
              className="group w-full px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-medium text-white">{f.q}</span>
                <ChevronDown
                  className={`h-4 w-4 flex-none text-[var(--text-muted)] transition-transform ${open === i ? 'rotate-180' : ''}`}
                />
              </div>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="pt-4 text-sm leading-relaxed text-[var(--text-secondary)]">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Newsletter inline (footer) ────────────────────────────────────────────
function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message ?? 'Tu es inscrit 🌱')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error ?? 'Inscription impossible. Réessaie.')
      }
    } catch {
      setStatus('error')
      setMessage('Connexion perdue. Réessaie.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ton@email.com"
          className="flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm placeholder:text-[var(--text-muted)] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
          aria-label="Adresse email"
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-60 transition-colors"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              S&apos;abonner <Send className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
      {message && (
        <p
          className={`text-xs ${
            status === 'success' ? 'text-emerald-300' : 'text-rose-300'
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  )
}

// ─── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center">
                <Leaf className="h-3.5 w-3.5 text-emerald-950" strokeWidth={2.5} />
              </div>
              <span className="font-[family-name:var(--font-display)] text-base font-bold tracking-tight text-white">
                VEDA
              </span>
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-[var(--text-muted)]">
              Parle une langue en 30 jours. Sans cours, sans stress, sans théorie.
            </p>
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white">
                Newsletter
              </p>
              <NewsletterForm />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Produit</p>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--text-secondary)]">
              <li><a href="#modes" className="hover:text-white transition-colors">Modes</a></li>
              <li><a href="#method" className="hover:text-white transition-colors">Méthode</a></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">Comment ça marche</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Aide</p>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--text-secondary)]">
              <li><Link href="/aide" className="hover:text-white transition-colors">Centre d&apos;aide</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/status" className="hover:text-white transition-colors">Statut</Link></li>
              <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Légal</p>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--text-secondary)]">
              <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
              <li><Link href="/politique-confidentialite" className="hover:text-white transition-colors">Confidentialité</Link></li>
              <li><Link href="/cgv" className="hover:text-white transition-colors">CGV</Link></li>
              <li><Link href="/cgu" className="hover:text-white transition-colors">CGU</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.06] pt-8 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} VEDA — SASU PURAMA. TVA non applicable, art. 293 B du CGI.</p>
          <p>Frasne, France · Fait avec 🌱</p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page principale ────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg-void)] text-white">
      <CursorGlow />
      <Nav />
      <Hero />
      <Modes />
      <Method />
      <ScrollPunchline />
      <PricingTeaser />
      <FuturePraise />
      <FinalCTA />
      <Faq />
      <Footer />
    </main>
  )
}
