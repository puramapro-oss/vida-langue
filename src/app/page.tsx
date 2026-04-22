'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Mic, Volume2, Moon, Sparkles, Globe, Users, Heart,
  Check, ChevronDown, Menu, X, Leaf, ArrowRight,
} from 'lucide-react'

const MODES = [
  { icon: Brain, name: 'NeuroFlow', desc: 'Respiration → immersion double canal → scellage neurologique.', duration: '25 min' },
  { icon: Mic, name: 'HoloTalk', desc: 'Conversations vocales avec personnages IA. Voix émotionnelles, mémoire longue.', duration: '10 min' },
  { icon: Volume2, name: 'Natif Instinct', desc: 'Phonétique VEDA adaptée à ta langue maternelle. Phrase → son → sens.', duration: '5 min' },
  { icon: Moon, name: 'SleepSync', desc: 'Avant de dormir. Voix lente, consolidation sommeil léger.', duration: '8 min' },
  { icon: Sparkles, name: 'Hypno-Immersif', desc: 'Voix binaurale + micro-vibrations. Double canal conscient/inconscient.', duration: '20 min' },
  { icon: Globe, name: 'Réalité Parallèle', desc: 'Monde vocal immersif : voyages, négociations, conflits. 100% voix.', duration: '15 min' },
  { icon: Users, name: 'Groupe', desc: 'Parle avec une personne réelle. Groupes auto-créés par niveau.', duration: '30 min' },
  { icon: Heart, name: 'Spirituel', desc: 'Méditation, gratitude, langues sacrées (angélique, kundalini).', duration: '15 min' },
] as const

const FAQ = [
  { q: 'Ça marche vraiment en 30 jours ?', a: 'La phonétique VEDA adapte chaque son à ta langue maternelle. En 30 jours à raison de 15 min/jour, tu tiens une conversation fluide sur les sujets du quotidien.' },
  { q: 'Sans cours, sans théorie ?', a: 'Zéro grammaire explicite. Ton cerveau absorbe les structures comme un enfant — par exposition guidée, répétition contextuelle et émotion.' },
  { q: 'Quelles langues sont disponibles ?', a: '50+ langues couvertes par NAMA-Polyglotte : latines, germaniques, slaves, sino-tibétaines, arabo-sémitiques, indo-iraniennes, japonaise, coréenne, turques, africaines, austronésiennes, langues des signes LSF/ASL, ainsi que des langues d\'éveil (langue des anges, langue de lumière, yatra kundalini).' },
  { q: 'Je peux essayer avant de payer ?', a: '14 jours offerts, sans carte. Accès complet à tous les modes. Si tu n\'es pas conquis, tu pars sans rien payer.' },
  { q: 'Comment se passe l\'annulation ?', a: 'Un clic dans ton espace. Pas d\'appel, pas de mail, pas de justification. Tu gardes l\'accès jusqu\'à la fin de la période déjà payée.' },
] as const

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

function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[140px]" />
        <div className="absolute right-[-10%] top-1/3 h-[420px] w-[420px] rounded-full bg-teal-400/15 blur-[120px]" />
        <div className="absolute left-[-10%] bottom-0 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-emerald-300"
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
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
              en 30 jours.
            </span>
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
            <Link
              href="/signup"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-emerald-950 shadow-[0_8px_32px_rgba(16,185,129,0.25)] hover:bg-emerald-50 transition-all"
            >
              Commencer 14 jours offerts
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#modes"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-6 text-sm font-medium text-white hover:bg-white/[0.06] transition-colors"
            >
              Voir les 8 modes
            </Link>
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

        {/* BLOC 2 above-fold — 3 modes phares (teaser) */}
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

        {/* BLOC 3 above-fold — preuve dynamique (compteurs DB, aucun faux chiffre) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center text-xs text-[var(--text-muted)]"
        >
          <LiveCounters />
        </motion.div>
      </div>
    </section>
  )
}

/**
 * Compteurs dynamiques alimentés par /api/status.
 * Affiche 0 si la DB retourne 0 (JAMAIS de faux chiffre inventé).
 */
function LiveCounters() {
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

  return (
    <>
      <span>
        <strong className="text-white font-semibold">{stats?.learners ?? 0}</strong> apprenants
      </span>
      <span>·</span>
      <span>
        <strong className="text-white font-semibold">{stats?.languages ?? 50}+</strong> langues
      </span>
      <span>·</span>
      <span>
        <strong className="text-white font-semibold">{stats?.sessions ?? 0}</strong> sessions guidées
      </span>
    </>
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
          {MODES.map((m, i) => {
            const Icon = m.icon
            return (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl transition-all hover:border-emerald-400/25 hover:bg-white/[0.04]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h3 className="mt-6 text-base font-semibold text-white">{m.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{m.desc}</p>
                <p className="mt-6 text-xs font-medium uppercase tracking-wider text-emerald-400">
                  {m.duration}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Method() {
  const steps = [
    { n: '01', title: 'Tu choisis une langue', desc: 'Parmi 50+. NAMA calibre la phonétique à ta langue maternelle.' },
    { n: '02', title: 'Tu ouvres un mode', desc: 'NeuroFlow le matin, HoloTalk à midi, SleepSync le soir. 5 à 30 min.' },
    { n: '03', title: 'Tu parles', desc: 'Jour 30 : tu commandes un café, tu négocies, tu flirtes. Dans leur langue.' },
  ] as const

  return (
    <section id="method" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Trois étapes.<br />
            <span className="text-[var(--text-secondary)]">Aucune friction.</span>
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-xl"
            >
              <p className="font-[family-name:var(--font-mono)] text-xs font-medium tracking-[0.2em] text-emerald-400">
                {s.n}
              </p>
              <h3 className="mt-6 text-xl font-semibold text-white">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingTeaser() {
  const perks = [
    'Accès aux 8 modes',
    '16 langues disponibles',
    'HoloTalk voix illimité',
    'SleepSync & Hypno-Immersif',
    'Annulation en 1 clic',
  ] as const

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 backdrop-blur-xl sm:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-[100px]" />
          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
              Essai 14 jours
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
              12,90 € / mois.<br />
              <span className="text-[var(--text-secondary)]">Sans engagement.</span>
            </h2>
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Check className="h-4 w-4 flex-none text-emerald-400" strokeWidth={2.5} />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-emerald-950 hover:bg-emerald-50 transition-colors"
              >
                Commencer — 14 jours offerts
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-medium text-white hover:bg-white/[0.04] transition-colors"
              >
                Voir tous les plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

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

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg-void)] text-white">
      <Nav />
      <Hero />
      <Modes />
      <Method />
      <PricingTeaser />
      <Faq />
      <Footer />
    </main>
  )
}
