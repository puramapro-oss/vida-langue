'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQ = [
  {
    q: 'Ça marche vraiment en 30 jours ?',
    a: 'La phonétique VEDA adapte chaque son à ta langue maternelle. En 30 jours à raison de 15 min/jour, tu tiens une conversation fluide sur les sujets du quotidien.',
  },
  {
    q: 'Sans cours, sans théorie ?',
    a: 'Zéro grammaire explicite. Ton cerveau absorbe les structures comme un enfant — par exposition guidée, répétition contextuelle et émotion.',
  },
  {
    q: 'Quelles langues sont disponibles ?',
    a: '50+ langues couvertes par NAMA-Polyglotte : latines, germaniques, slaves, sino-tibétaines, arabo-sémitiques, indo-iraniennes, japonaise, coréenne, turques, africaines, austronésiennes, langues des signes LSF/ASL, ainsi que des langues d\'éveil (langue des anges, langue de lumière, yatra kundalini).',
  },
  {
    q: 'Je peux essayer avant de payer ?',
    a: '14 jours offerts, sans carte. Accès complet à tous les modes. Si tu n\'es pas conquis, tu pars sans rien payer.',
  },
  {
    q: 'Comment se passe l\'annulation ?',
    a: 'Un clic dans ton espace. Pas d\'appel, pas de mail, pas de justification. Tu gardes l\'accès jusqu\'à la fin de la période déjà payée.',
  },
] as const

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="relative px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-12 text-center font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl">
          Questions fréquentes
        </h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-white/[0.04]"
              >
                <span className="font-medium text-white">{item.q}</span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-emerald-400 transition-transform ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="border-t border-white/[0.06] px-6 py-5 leading-relaxed text-[var(--text-secondary)]">
                      {item.a}
                    </p>
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
