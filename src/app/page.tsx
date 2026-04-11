'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Mic, Volume2, Moon, Sparkles, Globe, Users, Heart,
  Check, ChevronDown, Menu, X, Leaf, Zap, Sun
} from 'lucide-react'

// ──────────────────────────────────────────────────────────────────
// NAV
// ──────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled ? 'backdrop-blur-xl bg-[rgba(4,10,7,0.85)] border-b border-emerald-400/10' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="gradient-text font-[family-name:var(--font-display)] text-xl font-bold tracking-tight">
              Vida Langue
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-[var(--text-secondary)]">
            <a href="#modes" className="hover:text-[var(--text-primary)] transition-colors">Modes</a>
            <a href="#phonetic" className="hover:text-[var(--text-primary)] transition-colors">Phonétique</a>
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
              className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all"
            >
              Essayer 14 jours
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[var(--text-primary)]"
            aria-label="Menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden backdrop-blur-xl bg-[rgba(4,10,7,0.95)] border-t border-emerald-400/10 px-4 py-6 flex flex-col gap-4"
          >
            <a href="#modes" onClick={() => setMenuOpen(false)} className="text-[var(--text-secondary)]">Modes</a>
            <a href="#phonetic" onClick={() => setMenuOpen(false)} className="text-[var(--text-secondary)]">Phonétique</a>
            <a href="#impact" onClick={() => setMenuOpen(false)} className="text-[var(--text-secondary)]">Impact</a>
            <Link href="/pricing" className="text-[var(--text-secondary)]">Tarifs</Link>
            <a href="#faq" onClick={() => setMenuOpen(false)} className="text-[var(--text-secondary)]">FAQ</a>
            <Link href="/login" className="text-[var(--text-secondary)]">Connexion</Link>
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-5 py-3 text-center text-sm font-semibold text-emerald-950"
            >
              Essayer 14 jours
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

// ──────────────────────────────────────────────────────────────────
// HERO
// ──────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Aurora ambiance */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-teal-400/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/5 px-4 py-2 text-xs font-medium text-emerald-300 mb-6"
        >
          <Leaf className="h-3 w-3" />
          La première app qui grave les langues dans ton cerveau
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-[family-name:var(--font-display)] text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]"
        >
          <span className="block text-[var(--text-primary)]">Parle une langue</span>
          <span className="block gradient-text">en 30 jours.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed"
        >
          Sans cours. Sans stress. Sans théorie. Juste ta voix, ton cerveau et
          la phonétique Vida qui s&apos;adapte à ta langue maternelle.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/signup"
            className="group rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-8 py-4 text-base font-semibold text-emerald-950 shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transition-all"
          >
            Commencer 14 jours gratuits
          </Link>
          <Link
            href="#phonetic"
            className="rounded-full border border-emerald-400/30 px-8 py-4 text-base font-semibold text-[var(--text-primary)] hover:bg-emerald-500/10 transition-all"
          >
            Voir comment ça marche
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs text-[var(--text-muted)]"
        >
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 14 jours gratuits</span>
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Toutes les langues</span>
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 10 % du CA → Association Vida</span>
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Annule quand tu veux</span>
        </motion.div>
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────
// PHONÉTIQUE VIDA
// ──────────────────────────────────────────────────────────────────
function PhoneticSection() {
  return (
    <section id="phonetic" className="py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/5 px-4 py-2 text-xs font-medium text-emerald-300 mb-4">
            <Volume2 className="h-3 w-3" />
            Natif Instinct™
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold tracking-tight">
            La phonétique neuro-adaptative
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto">
            Oublie les règles. Vida décompose chaque phrase en 3 couches — dans
            ta langue maternelle — pour que ton cerveau l&apos;absorbe comme enfant.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              layer: 'Couche 1',
              title: 'Phrase originale',
              sample: 'Did you eat?',
              hint: 'Ce que la personne dit réellement, dans la langue cible.',
            },
            {
              layer: 'Couche 2',
              title: 'Phonétique Vida',
              sample: 'DIJOU IT',
              hint: 'Adaptée à ta langue maternelle. Un FR voit "DIJOU IT", un ES voit "DIYU IT".',
            },
            {
              layer: 'Couche 3',
              title: 'Micro-traduction',
              sample: 'T\'as mangé ?',
              hint: 'Le sens, juste ce qu\'il faut. Zéro traduction mentale pendant que tu parles.',
            },
          ].map((card, i) => (
            <motion.div
              key={card.layer}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass glass-hover p-6 flex flex-col gap-3"
            >
              <div className="text-xs font-mono text-emerald-400">{card.layer}</div>
              <div className="font-semibold text-[var(--text-primary)]">{card.title}</div>
              <div className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold gradient-text">
                {card.sample}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">{card.hint}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-[var(--text-muted)]">
          Niveau 1 (full phonétique) → Niveau 2 (mix) → Niveau 3 (natif instinct) — l&apos;évolution est automatique.
        </div>
      </div>
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────
// MODES
// ──────────────────────────────────────────────────────────────────
function ModesSection() {
  const modes = [
    { icon: Brain, name: 'NeuroFlow™', desc: 'Respiration → immersion double canal → scellage neurologique. 20-30 min.', color: 'from-emerald-500/20 to-teal-500/20' },
    { icon: Mic, name: 'HoloTalk™', desc: 'Conversations vocales avec personnages IA réalistes. Mémoire longue, voix émotionnelle.', color: 'from-teal-500/20 to-cyan-500/20' },
    { icon: Volume2, name: 'Natif Instinct™', desc: 'Phonétique 3 couches adaptée à ta langue maternelle. Aucune règle à mémoriser.', color: 'from-lime-500/20 to-emerald-500/20' },
    { icon: Moon, name: 'SleepSync™', desc: 'Session courte avant dormir. Consolidation en sommeil léger. Toujours optionnel.', color: 'from-indigo-500/20 to-emerald-500/20' },
    { icon: Sparkles, name: 'Hypno-Immersif™', desc: 'Voix binaurale + micro-vibrations. Double canal conscient/inconscient. Zéro hypnose médicale.', color: 'from-purple-500/20 to-emerald-500/20' },
    { icon: Globe, name: 'Réalité Parallèle', desc: 'Monde virtuel vocal : arriver dans un pays, négocier, gérer un conflit. 100 % voix.', color: 'from-emerald-500/20 to-blue-500/20' },
    { icon: Users, name: 'Groupe / Rencontre', desc: 'Parle avec une vraie personne proposée par l\'app. Groupes auto-créés.', color: 'from-pink-500/20 to-emerald-500/20' },
    { icon: Heart, name: 'Spirituel', desc: 'Apprentissage + méditation, gratitude, langues sacrées (anges, lumière, yatra).', color: 'from-yellow-500/20 to-emerald-500/20' },
  ]

  return (
    <section id="modes" className="py-20 md:py-32 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold tracking-tight">
            8 modes. 1 seul abonnement.
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto">
            Choisis ton état d&apos;esprit. Vida s&apos;adapte à ton énergie du moment.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modes.map((mode, i) => (
            <motion.div
              key={mode.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
              className={`glass glass-hover p-6 relative overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-40 pointer-events-none`} />
              <div className="relative">
                <mode.icon className="h-8 w-8 text-emerald-400 mb-4" />
                <h3 className="font-semibold text-lg text-[var(--text-primary)]">{mode.name}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">{mode.desc}</p>
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
  const stats = [
    { value: '10 %', label: 'du CA reversés à l\'Association Vida', icon: Heart },
    { value: '14 j', label: 'd\'essai gratuit, sans carte bancaire', icon: Sparkles },
    { value: '30 j', label: 'pour devenir fluide à l\'oral', icon: Zap },
    { value: '∞', label: 'de langues disponibles', icon: Globe },
  ]

  return (
    <section id="impact" className="py-20 md:py-32 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/5 px-4 py-2 text-xs font-medium text-emerald-300 mb-4">
            <Sun className="h-3 w-3" />
            Apprendre + faire du bien
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold tracking-tight">
            Chaque mot que tu apprends{' '}
            <span className="gradient-text">nourrit le monde.</span>
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto">
            Missions humanitaires, écologiques, spirituelles. Ton fil de vie garde tout en mémoire — même
            si tu te mets en pause. 1 mot = 1 action réelle.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass p-6 text-center"
            >
              <stat.icon className="h-6 w-6 text-emerald-400 mx-auto mb-3" />
              <div className="font-[family-name:var(--font-display)] text-4xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-[var(--text-secondary)]">{stat.label}</div>
            </motion.div>
          ))}
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
      q: 'Ça marche vraiment en 30 jours ?',
      a: 'Oui, à condition d\'ouvrir l\'app quelques minutes par jour. La phonétique Vida court-circuite la traduction mentale — la plupart des utilisateurs tiennent une vraie conversation au bout de 2-3 semaines. Sinon, tu gardes ton essai sans friction.',
    },
    {
      q: 'Je n\'ai jamais su apprendre une langue. C\'est pour moi ?',
      a: 'Absolument. Vida est faite pour les sceptiques, les démotivés, les stressés et les dispersés. Zéro jugement, zéro correction agressive, zéro comparaison. Tu ouvres l\'app, tu poses ton téléphone, Vida agit.',
    },
    {
      q: 'Comment fonctionne l\'essai gratuit ?',
      a: '14 jours complets, accès à tous les modes, sans carte bancaire obligatoire. Tu peux annuler en 1 clic avant la fin. Si tu veux arrêter plus tard, on te propose un tarif moitié prix à vie.',
    },
    {
      q: 'Quelles langues sont disponibles ?',
      a: 'Toutes les langues du monde — des plus parlées (anglais, espagnol, italien, allemand, japonais, chinois...) aux plus rares. L\'interface est elle-même disponible en 16 langues.',
    },
    {
      q: 'Qu\'est-ce que "l\'Association Vida" ?',
      a: '10 % du chiffre d\'affaires est automatiquement reversé à l\'Association Vida, qui finance des missions humanitaires, écologiques et de bien-être. Tu apprends, le monde gagne.',
    },
    {
      q: 'Mes données sont-elles protégées ?',
      a: 'Oui. 100 % RGPD, hébergement européen, chiffrement de bout en bout. Tu peux exporter ou supprimer tes données à tout moment depuis ton profil.',
    },
  ]

  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold tracking-tight">
            Questions fréquentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="glass overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-semibold text-[var(--text-primary)]">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-emerald-400 transition-transform ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 text-sm text-[var(--text-secondary)] leading-relaxed">
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
    <section className="py-20 md:py-32 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />
      </div>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl font-bold tracking-tight">
          Respire. Parle.{' '}
          <span className="gradient-text">Sois libre.</span>
        </h2>
        <p className="mt-6 text-lg text-[var(--text-secondary)]">
          14 jours d&apos;essai gratuit. Aucune carte bancaire requise. Tu peux annuler quand tu veux.
        </p>
        <div className="mt-10">
          <Link
            href="/signup"
            className="inline-block rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-10 py-5 text-lg font-semibold text-emerald-950 shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_rgba(16,185,129,0.7)] transition-all"
          >
            Commencer ma métamorphose
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
    <footer className="border-t border-emerald-400/10 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="gradient-text font-[family-name:var(--font-display)] text-2xl font-bold">
              Vida Langue
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-xs">
              La première app qui grave les langues dans ton cerveau. Sans cours, sans stress, sans théorie.
            </p>
          </div>

          <div>
            <div className="font-semibold text-[var(--text-primary)] text-sm mb-3">Produit</div>
            <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
              <li><Link href="/pricing" className="block py-2 hover:text-emerald-400">Tarifs</Link></li>
              <li><Link href="/how-it-works" className="block py-2 hover:text-emerald-400">Comment ça marche</Link></li>
              <li><Link href="/aide" className="block py-2 hover:text-emerald-400">Aide</Link></li>
              <li><Link href="/contact" className="block py-2 hover:text-emerald-400">Contact</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-[var(--text-primary)] text-sm mb-3">Légal</div>
            <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
              <li><Link href="/mentions-legales" className="block py-2 hover:text-emerald-400">Mentions légales</Link></li>
              <li><Link href="/politique-confidentialite" className="block py-2 hover:text-emerald-400">Confidentialité</Link></li>
              <li><Link href="/cgu" className="block py-2 hover:text-emerald-400">CGU</Link></li>
              <li><Link href="/cgv" className="block py-2 hover:text-emerald-400">CGV</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-emerald-400/10 text-xs text-[var(--text-muted)] text-center">
          © {new Date().getFullYear()} SASU PURAMA · 8 Rue de la Chapelle, 25560 Frasne · TVA non applicable, art. 293 B du CGI ·{' '}
          10 % du CA → Association Vida
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
    <main>
      <Nav />
      <Hero />
      <PhoneticSection />
      <ModesSection />
      <ImpactSection />
      <FAQSection />
      <CTA />
      <Footer />
    </main>
  )
}
