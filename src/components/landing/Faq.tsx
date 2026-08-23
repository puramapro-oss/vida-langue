'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FAQ = [
  { q: 'Ça marche vraiment en 30 jours ?', a: 'La phonétique VEDA adapte chaque son à ta langue maternelle. En 30 jours à raison de 15 min/jour, tu tiens une conversation fluide sur les sujets du quotidien.' },
  { q: 'Sans cours, sans théorie ?', a: 'Zéro grammaire explicite. Ton cerveau absorbe les structures comme un enfant — par exposition guidée, répétition contextuelle et émotion.' },
  { q: 'Quelles langues sont disponibles ?', a: '50+ langues couvertes par NAMA-Polyglotte : latines, germaniques, slaves, sino-tibétaines, arabo-sémitiques, indo-iraniennes, japonaise, coréenne, turques, africaines, austronésiennes, langues des signes LSF/ASL, ainsi que des langues d\'éveil (langue des anges, langue de lumière, yatra kundalini).' },
  { q: 'Je peux essayer avant de payer ?', a: '14 jours offerts, sans carte. Accès complet à tous les modes. Si tu n\'es pas conquis, tu pars sans rien payer.' },
  { q: 'Comment se passe l\'annulation ?', a: 'Un clic dans ton espace. Pas d\'appel, pas de mail, pas de justification. Tu gardes l\'accès jusqu\'à la fin de la période déjà payée.' },
] as const

export default function Faq() {
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
