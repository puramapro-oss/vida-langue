'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  Brain, Mic, Volume2, Moon, Sparkles, Globe, Users, Heart,
  Check, ChevronDown, Menu, X, Leaf, Zap, Sun, ArrowRight,
  Headphones, Wand2, Languages,
} from 'lucide-react'

// ──────────────────────────────────────────────────────────────────
// NAV — sticky glass, mobile sheet
// ──────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
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
      className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${
        scrolled
          ? 'backdrop-blur-2xl bg-[rgba(4,10,7,0.78)] border-b border-emerald-400/[0.08]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center shadow-[0_0_24px_rgba(16,185,129,0.45)] group-hover:shadow-[0_0_32px_rgba(16,185,129,0.7)] transition-shadow">
              <Leaf className="h-4 w-4 text-emerald-950" strokeWidth={2.5} />
            </div>
            <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight gradient-text">
              Vida Langue
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-[var(--text-secondary)]">
            <a href="#how" className="hover:text-[var(--text-primary)] transition-colors">Méthode</a>
            <a href="#modes" className="hover:text-[var(--text-primary)] transition-colors">Modes</a>
            <a href="#impact" className="hover:text-[var(--text-primary)] transition-colors">Impact</a>
            <Link href="/pricing" className="hover:text-[var(--text-primary)] transition-colors">Tarifs</Link>
            <a href="#faq" className="hover:text-[var(--text-primary)] transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-5 py-2 text-sm font-semibold text-emerald-950 shadow-[0_0_24px_rgba(16,185,129,0.4)] hover:shadow-[0_0_36px_rgba(16,185,129,0.65)] hover:scale-[1.02] transition-all"
            >
              Essai 14 jours
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-500/5 text-[var(--text-primary)]"
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
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
            className="md:hidden backdrop-blur-2xl bg-[rgba(4,10,7,0.97)] border-t border-emerald-400/10"
          >
            <div className="flex flex-col gap-1 px-4 py-6">
              {[
                { href: '#how', label: 'Méthode' },
                { href: '#modes', label: 'Modes' },
                { href: '#impact', label: 'Impact' },
                { href: '/pricing', label: 'Tarifs' },
                { href: '#faq', label: 'FAQ' },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-base text-[var(--text-secondary)] hover:bg-emerald-500/8 hover:text-[var(--text-primary)] transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <div className="my-3 h-px bg-emerald-400/10" />
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-emerald-400/20 px-4 py-3 text-center text-base font-medium text-[var(--text-primary)]"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-3 text-center text-base font-semibold text-emerald-950 shadow-[0_0_30px_rgba(16,185,129,0.45)]"
              >
                Essai 14 jours
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

// ──────────────────────────────────────────────────────────────────
// HERO — animated phonetic demo + dual CTA
// ──────────────────────────────────────────────────────────────────
const PHONETIC_SAMPLES = [
  { lang: 'EN', flag: '🇬🇧', original: 'How are you?', vida: 'HAOU AR YOU', meaning: 'Comment ça va ?' },
  { lang: 'ES', flag: '🇪🇸', original: '¿Qué tal?', vida: 'KÉ TAL', meaning: 'Quoi de neuf ?' },
  { lang: 'IT', flag: '🇮🇹', original: 'Come stai?', vida: 'KOMÉ STAÏ', meaning: 'Comment vas-tu ?' },
  { lang: 'JP', flag: '🇯🇵', original: 'お元気ですか？', vida: 'O-GUEN-KI DESS-KA', meaning: 'Tu vas bien ?' },
  { lang: 'DE', flag: '🇩🇪', original: 'Wie geht\'s?', vida: 'VIE GUÉTSS', meaning: 'Ça roule ?' },
  { lang: 'PT', flag: '🇵🇹', original: 'Tudo bem?', vida: 'TOUDOU BEÏN', meaning: 'Tout va bien ?' },
]

function HeroPhoneticDemo() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PHONETIC_SAMPLES.length), 2800)
    return () => clearInterval(t)
  }, [])

  const sample = PHONETIC_SAMPLES[idx]

  return (
    <div className="relative mx-auto mt-14 w-full max-w-xl">
      {/* Glow */}
      <div className="absolute inset-0 -z-10 rounded-[28px] bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-emerald-300/20 blur-3xl opacity-70" />

      <div className="glass rounded-3xl p-5 sm:p-7 border border-emerald-400/15">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <span className="ml-2 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
              Natif Instinct™
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/5 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
            <span>{sample.flag}</span>
            <span>{sample.lang}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-1">01 · Original</div>
              <div className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
                {sample.original}
              </div>
            </div>
            <div className="h-px bg-emerald-400/10" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-1">02 · Phonétique Vida</div>
              <div className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold gradient-text break-words">
                {sample.vida}
              </div>
            </div>
            <div className="h-px bg-emerald-400/10" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-1">03 · Sens FR</div>
              <div className="text-base sm:text-lg text-[var(--text-secondary)] italic">
                « {sample.meaning} »
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
          <div className="flex gap-1">
            {PHONETIC_SAMPLES.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === idx ? 'w-6 bg-emerald-400' : 'w-1.5 bg-emerald-400/20'
                }`}
              />
            ))}
          </div>
          <span className="font-mono">vida.audio · prononciation native</span>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Aurora ambiance */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/3 h-[480px] w-[480px] rounded-full bg-emerald-500/15 blur-[140px]" />
        <div className="absolute top-40 right-1/4 h-[400px] w-[400px] rounded-full bg-teal-400/15 blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-lime-400/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/5 px-4 py-2 text-xs font-medium text-emerald-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Apprendre une langue, complètement repensé
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mt-6 font-[family-name:var(--font-display)] text-[44px] sm:text-6xl md:text-7xl lg:text-[88px] font-bold tracking-[-0.025em] leading-[1.02]"
        >
          <span className="block text-[var(--text-primary)]">Parle une langue.</span>
          <span className="block gradient-text">Pas l&apos;inverse.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-6 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed"
        >
          La phonétique <span className="text-emerald-300">Vida</span> s&apos;adapte à ta langue maternelle.
          Sans cours, sans grammaire, sans honte. Juste ta voix et ton instinct.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <Link
            href="/signup"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-7 py-4 text-base font-semibold text-emerald-950 shadow-[0_0_40px_rgba(16,185,129,0.45)] hover:shadow-[0_0_60px_rgba(16,185,129,0.7)] hover:scale-[1.02] transition-all"
          >
            Commencer 14 jours gratuits
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#how"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-500/[0.04] px-7 py-4 text-base font-semibold text-[var(--text-primary)] hover:bg-emerald-500/10 hover:border-emerald-400/40 transition-all"
          >
            Voir la méthode
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.36 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--text-muted)]"
        >
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Sans carte bancaire</span>
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Toutes les langues</span>
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Annule en 1 clic</span>
        </motion.div>

        <HeroPhoneticDemo />
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────
// HOW IT WORKS — 3 step timeline
// ──────────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      n: '01',
      icon: Languages,
      title: 'Choisis la langue à vivre',
      desc: 'Anglais, japonais, arabe, occitan, lakota… toutes les langues du monde sont là. Tu choisis ta langue maternelle pour calibrer la phonétique Vida.',
    },
    {
      n: '02',
      icon: Wand2,
      title: 'Vis tes premiers mots en 30 secondes',
      desc: 'Pas de cours. Pas de tableau. Tu appuies, Vida parle, tu répètes. Le mode Natif Instinct™ te montre la phrase sur 3 couches — ton cerveau absorbe, sans traduire.',
    },
    {
      n: '03',
      icon: Headphones,
      title: 'Mène une vraie conversation',
      desc: 'HoloTalk™ te met face à 6 personas vocaux qui répondent comme des vrais humains. Tu négocies, tu plaisantes, tu sors de ta zone — sans jugement.',
    },
  ]

  return (
    <section id="how" className="relative py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/5 px-4 py-2 text-xs font-medium text-emerald-300 mb-4">
            <Sparkles className="h-3 w-3" />
            La méthode Vida
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em]">
            Trois pas. Zéro friction.
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto text-base sm:text-lg">
            Pas besoin de motivation. Pas besoin de discipline. Juste d&apos;ouvrir l&apos;app.
          </p>
        </div>

        <div className="relative grid gap-6 md:grid-cols-3">
          {/* Connecting line desktop */}
          <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <div className="glass glass-hover relative h-full rounded-3xl p-7 border border-emerald-400/10">
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-400/30">
                    <step.icon className="h-5 w-5 text-emerald-300" strokeWidth={2} />
                  </div>
                  <div className="font-mono text-xs text-emerald-400/80">{step.n}</div>
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--text-primary)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────
// MODES — 8 modes grid
// ──────────────────────────────────────────────────────────────────
function ModesSection() {
  const modes = [
    { icon: Volume2, name: 'Natif Instinct™', desc: 'Phonétique 3 couches adaptée à ta langue maternelle. Plus jamais de règles à mémoriser.', accent: 'from-emerald-400/30 to-teal-400/10' },
    { icon: Mic, name: 'HoloTalk™', desc: 'Conversations vocales avec 6 personas IA. Mémoire longue, voix émotionnelle.', accent: 'from-teal-400/30 to-cyan-400/10' },
    { icon: Brain, name: 'NeuroFlow™', desc: 'Respiration → immersion double canal → scellage neurologique. 20-30 min.', accent: 'from-lime-400/30 to-emerald-400/10' },
    { icon: Moon, name: 'SleepSync™', desc: 'Session courte avant dormir. Consolidation en sommeil léger. Toujours optionnel.', accent: 'from-indigo-400/30 to-emerald-400/10' },
    { icon: Sparkles, name: 'Hypno-Immersif', desc: 'Voix binaurale + micro-vibrations. Double canal conscient/inconscient.', accent: 'from-purple-400/30 to-emerald-400/10' },
    { icon: Globe, name: 'Réalité Parallèle', desc: 'Monde virtuel vocal : arriver dans un pays, négocier, gérer un conflit. 100 % voix.', accent: 'from-blue-400/30 to-emerald-400/10' },
    { icon: Users, name: 'Groupe', desc: 'Parle avec une personne réelle proposée par l\'app. Groupes auto-créés.', accent: 'from-pink-400/30 to-emerald-400/10' },
    { icon: Heart, name: 'Spirituel', desc: 'Apprentissage doux, méditation, gratitude. Langues sacrées si tu veux.', accent: 'from-amber-400/30 to-emerald-400/10' },
  ]

  return (
    <section id="modes" className="relative py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/5 px-4 py-2 text-xs font-medium text-emerald-300 mb-4">
            <Zap className="h-3 w-3" />
            8 modes · 1 abonnement
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em]">
            Choisis ton état d&apos;esprit.<br />
            <span className="gradient-text">Vida s&apos;adapte.</span>
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto text-base sm:text-lg">
            Stressé, rêveur, joueur, pressé ? Chaque mode est pensé pour un moment de ta journée.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {modes.map((mode, i) => (
            <motion.div
              key={mode.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
              className="group relative"
            >
              <div className="relative h-full rounded-3xl border border-emerald-400/10 bg-white/[0.02] backdrop-blur-xl p-6 overflow-hidden transition-all duration-500 hover:border-emerald-400/30 hover:bg-white/[0.04] hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                <div className="relative">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-400/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <mode.icon className="h-5 w-5 text-emerald-300" strokeWidth={2} />
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--text-primary)] mb-1.5">
                    {mode.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{mode.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────
// IMPACT
// ──────────────────────────────────────────────────────────────────
function ImpactSection() {
  return (
    <section id="impact" className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/8 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/5 px-4 py-2 text-xs font-medium text-emerald-300 mb-4">
            <Sun className="h-3 w-3" />
            Apprendre + faire du bien
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em]">
            Chaque mot que tu apprends<br />
            <span className="gradient-text">nourrit le monde.</span>
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto text-base sm:text-lg">
            10 % du chiffre d&apos;affaires Vida est reversé chaque mois à l&apos;Association Vida — missions
            humanitaires, écologiques, spirituelles. Ton fil de vie garde tout en mémoire.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Heart, title: '10 % du CA', desc: 'reversés à l\'Association Vida — automatiquement, chaque mois.' },
            { icon: Leaf, title: 'Fil de vie', desc: 'tes mots, tes sessions, tes impacts gardés pour toujours — même en pause.' },
            { icon: Globe, title: 'Toutes les langues', desc: 'des plus parlées aux plus rares. L\'interface elle-même en 16 langues.' },
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass rounded-3xl p-6 border border-emerald-400/10"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-400/20 mb-4">
                <stat.icon className="h-5 w-5 text-emerald-300" strokeWidth={2} />
              </div>
              <div className="font-[family-name:var(--font-display)] text-2xl font-bold gradient-text mb-1.5">
                {stat.title}
              </div>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed">{stat.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────
// PRICING TEASER
// ──────────────────────────────────────────────────────────────────
function PricingTeaser() {
  const plans = [
    { name: 'Mensuel', price: '12,90€', period: '/mois', desc: 'Sans engagement', highlight: false },
    { name: 'Annuel', price: '9€', period: '/mois', desc: 'Économise 30%', highlight: true, badge: 'POPULAIRE' },
    { name: 'À vie', price: '6,45€', period: '/mois gelé', desc: 'Membre Fondateur', highlight: false },
  ]
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold tracking-[-0.02em]">
            Un seul abonnement.<br />
            <span className="gradient-text">Trois façons de payer.</span>
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] text-base sm:text-lg max-w-xl mx-auto">
            14 jours d&apos;essai gratuit. Sans CB. Annulation en 1 clic.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl border p-6 backdrop-blur-xl transition-all hover:-translate-y-1 ${
                p.highlight
                  ? 'border-emerald-400/40 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 shadow-[0_0_40px_rgba(16,185,129,0.2)]'
                  : 'border-emerald-400/10 bg-white/[0.02]'
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-3 py-1 text-[10px] font-bold text-emerald-950">
                  {p.badge}
                </div>
              )}
              <div className="text-sm font-semibold text-[var(--text-secondary)]">{p.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--text-primary)]">{p.price}</span>
                <span className="text-sm text-[var(--text-muted)]">{p.period}</span>
              </div>
              <div className="mt-1 text-xs text-emerald-300">{p.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
          >
            Voir le détail des tarifs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────
// FAQ
// ──────────────────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)
  const faqs = [
    {
      q: 'C\'est quoi la phonétique Vida exactement ?',
      a: 'Une décomposition phonétique sur 3 couches, calibrée sur ta langue maternelle. Au lieu de te dire "th = θ", on t\'écrit "ZE" si tu es français, "DE" si tu es espagnol. Tu lis ce que ton cerveau sait déjà prononcer. Zéro règle, zéro intermédiaire.',
    },
    {
      q: 'Je n\'ai jamais réussi à apprendre une langue. C\'est pour moi ?',
      a: 'Surtout pour toi. Vida est faite pour les sceptiques, les démotivés, les stressés et les dispersés. Zéro jugement, zéro correction agressive, zéro comparaison. Tu ouvres l\'app, tu poses ton téléphone, Vida agit.',
    },
    {
      q: 'Comment fonctionne l\'essai gratuit ?',
      a: '14 jours complets, accès à tous les modes, sans carte bancaire obligatoire. Tu peux annuler en 1 clic avant la fin. Si tu hésites encore, on te propose un tarif moitié prix verrouillé à vie.',
    },
    {
      q: 'Quelles langues sont disponibles ?',
      a: 'Toutes. Anglais, espagnol, italien, allemand, japonais, chinois, arabe, portugais, russe, hindi, swahili, lakota, occitan, breton… et celles qu\'on n\'a pas encore référencées, demande-les. L\'interface elle-même est disponible en 16 langues.',
    },
    {
      q: 'Qu\'est-ce que l\'Association Vida ?',
      a: '10 % du chiffre d\'affaires de Vida Langue est reversé chaque mois à l\'Association Vida (loi 1901) qui finance des missions humanitaires, écologiques et de bien-être. Tu apprends, le monde gagne.',
    },
    {
      q: 'Mes données sont-elles protégées ?',
      a: 'Oui. 100 % RGPD, hébergement européen, chiffrement de bout en bout. Tu peux exporter ou supprimer toutes tes données à tout moment depuis ton profil.',
    },
  ]

  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold tracking-[-0.02em]">
            Questions fréquentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-emerald-400/10 bg-white/[0.02] backdrop-blur-xl transition-colors hover:border-emerald-400/20"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-5 text-left"
              >
                <span className="font-semibold text-[var(--text-primary)] text-[15px] sm:text-base">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-emerald-400 transition-transform duration-300 ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-5 sm:px-6 pb-5 text-sm text-[var(--text-secondary)] leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────
// CTA
// ──────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/15 blur-[140px]" />
      </div>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.025em] leading-[1.05]">
          Respire. Parle.<br />
          <span className="gradient-text">Sois libre.</span>
        </h2>
        <p className="mt-6 text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
          14 jours d&apos;essai gratuit. Aucune carte bancaire. Tu peux annuler quand tu veux.
        </p>
        <div className="mt-10">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-9 py-5 text-base sm:text-lg font-semibold text-emerald-950 shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.75)] hover:scale-[1.02] transition-all"
          >
            Commencer ma métamorphose
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────
// FOOTER
// ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-emerald-400/10 py-12 mt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center">
                <Leaf className="h-4 w-4 text-emerald-950" strokeWidth={2.5} />
              </div>
              <span className="gradient-text font-[family-name:var(--font-display)] text-2xl font-bold">
                Vida Langue
              </span>
            </Link>
            <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-xs leading-relaxed">
              Apprendre une langue, complètement repensé. Sans cours, sans grammaire, sans honte.
            </p>
          </div>

          <div>
            <div className="font-semibold text-[var(--text-primary)] text-sm mb-3">Produit</div>
            <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
              <li><Link href="/pricing" className="block py-1.5 hover:text-emerald-300 transition-colors">Tarifs</Link></li>
              <li><Link href="/how-it-works" className="block py-1.5 hover:text-emerald-300 transition-colors">Comment ça marche</Link></li>
              <li><Link href="/aide" className="block py-1.5 hover:text-emerald-300 transition-colors">Aide</Link></li>
              <li><Link href="/contact" className="block py-1.5 hover:text-emerald-300 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-[var(--text-primary)] text-sm mb-3">Légal</div>
            <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
              <li><Link href="/mentions-legales" className="block py-1.5 hover:text-emerald-300 transition-colors">Mentions légales</Link></li>
              <li><Link href="/politique-confidentialite" className="block py-1.5 hover:text-emerald-300 transition-colors">Confidentialité</Link></li>
              <li><Link href="/cgu" className="block py-1.5 hover:text-emerald-300 transition-colors">CGU</Link></li>
              <li><Link href="/cgv" className="block py-1.5 hover:text-emerald-300 transition-colors">CGV</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-emerald-400/10 text-xs text-[var(--text-muted)] text-center leading-relaxed">
          © {new Date().getFullYear()} SASU PURAMA · 8 Rue de la Chapelle, 25560 Frasne · TVA non applicable, art. 293 B du CGI<br />
          10 % du chiffre d&apos;affaires reversés à l&apos;Association Vida
        </div>
      </div>
    </footer>
  )
}

// ──────────────────────────────────────────────────────────────────
// PAGE
// ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <HowItWorks />
      <ModesSection />
      <ImpactSection />
      <PricingTeaser />
      <FAQSection />
      <CTA />
      <Footer />
    </main>
  )
}
