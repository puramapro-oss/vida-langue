'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useEffect } from 'react'

interface MagicMomentProps {
  open: boolean
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
  onDismiss: () => void
  durationMs?: number
}

/**
 * MagicMoment VEDA — Wealth Engine Phase 1.
 * Célébration d'un palier atteint (streak, achievement, level up).
 * Modal plein écran glass, dismiss auto après durationMs. Non-bloquant.
 */
export default function MagicMoment({
  open,
  title,
  subtitle,
  icon: Icon = Sparkles,
  onDismiss,
  durationMs = 3200,
}: MagicMomentProps) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(t)
  }, [open, durationMs, onDismiss])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onDismiss}
          role="dialog"
          aria-live="polite"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative mx-6 max-w-md overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 p-10 text-center backdrop-blur-2xl shadow-[0_20px_80px_rgba(16,185,129,0.35)]"
          >
            <div className="absolute inset-0 -z-10 opacity-60">
              <div className="absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-400/30 blur-3xl" />
            </div>

            <motion.div
              initial={{ rotate: -20, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 240 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 to-teal-400 text-emerald-950"
            >
              <Icon className="h-8 w-8" strokeWidth={2} />
            </motion.div>

            <h2 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-emerald-100/90">{subtitle}</p>
            )}

            <p className="mt-6 text-[11px] uppercase tracking-wider text-emerald-200/60">
              Appuie pour continuer
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
