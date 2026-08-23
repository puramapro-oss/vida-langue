'use client'

import { motion } from 'framer-motion'

interface Props {
  step: number
  totalSteps: number
  phaseTitle: string
  minutesLeft: number
  secondsLeft: number
  progress: number
  accentColor: string
}

export default function SessionProgress({
  step,
  totalSteps,
  phaseTitle,
  minutesLeft,
  secondsLeft,
  progress,
  accentColor,
}: Props) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
          Phase {Math.min(step + 1, totalSteps)}/{totalSteps} · {phaseTitle}
        </div>
        <div className="font-mono text-lg tabular-nums" style={{ color: accentColor }}>
          {String(minutesLeft).padStart(2, '0')}:{String(secondsLeft).padStart(2, '0')}
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: accentColor }}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </>
  )
}
