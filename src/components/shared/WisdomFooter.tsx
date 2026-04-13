'use client'

import { useMemo } from 'react'

const CITATIONS = [
  'Apprendre une langue, c\'est acquerir une nouvelle ame. — Proverbe tcheque',
  'Les limites de ma langue sont les limites de mon monde. — Ludwig Wittgenstein',
  'Une langue differente est une vision differente de la vie. — Federico Fellini',
  'Celui qui connait deux langues en vaut deux. — Proverbe francais',
  'Parler une autre langue, c\'est posseder une seconde ame. — Charlemagne',
  'La langue est la feuille de route d\'une culture. — Rita Mae Brown',
  'Chaque nouvelle langue ouvre une porte que tu ne soupconnais pas.',
  'La patience est le chemin le plus court vers la fluidite.',
  'Ton cerveau est une foret : chaque langue y plante un arbre.',
  'Le courage de parler imparfaitement est le debut de la maitrise.',
  'Apprendre, c\'est se transformer un mot a la fois.',
  'La beaute d\'une langue se revele quand on la parle avec le coeur.',
]

export default function WisdomFooter() {
  const citation = useMemo(() => {
    const today = new Date()
    const index = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % CITATIONS.length
    return CITATIONS[index]
  }, [])

  return (
    <div className="mt-12 pt-6 border-t border-white/[0.04] text-center">
      <p className="text-xs text-[var(--text-muted)] italic max-w-md mx-auto leading-relaxed">
        &ldquo;{citation}&rdquo;
      </p>
    </div>
  )
}
