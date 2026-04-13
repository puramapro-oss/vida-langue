'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'

interface Affirmation {
  id: string
  text_fr: string
  text_en: string
  category: string
}

const CATEGORY_EMOJIS: Record<string, string> = {
  love: '💚',
  power: '⚡',
  abundance: '✨',
  health: '🧠',
  wisdom: '🌿',
  gratitude: '🙏',
}

export default function AffirmationModal({ onClose }: { onClose: () => void }) {
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      // Get a random affirmation
      const { data } = await supabase
        .from('affirmations')
        .select('id, text_fr, text_en, category')
        .limit(30)

      if (data && data.length > 0) {
        const random = data[Math.floor(Math.random() * data.length)] as Affirmation
        setAffirmation(random)
      }
    }
    void load()
  }, [])

  if (!affirmation) return null

  const emoji = CATEGORY_EMOJIS[affirmation.category] ?? '🌱'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm glass rounded-3xl border border-emerald-400/15 p-8 text-center shadow-[0_0_80px_rgba(16,185,129,0.12)]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>

          <p className="text-xs text-emerald-400 font-medium mb-3 uppercase tracking-wider">
            {emoji} Affirmation du jour
          </p>

          <p className="text-lg font-medium text-[var(--text-primary)] leading-relaxed mb-6">
            {affirmation.text_fr}
          </p>

          <p className="text-xs text-[var(--text-muted)] italic">
            {affirmation.text_en}
          </p>

          <button
            onClick={onClose}
            className="mt-6 w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
            data-testid="btn-affirmation-close"
          >
            Merci, bonne journee 🌱
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
