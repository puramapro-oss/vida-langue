'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Wind, Moon, Zap, Play, Pause, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

type Pattern = 'coherence' | 'relaxing' | 'energizing'

interface BreathPattern {
  id: Pattern
  name: string
  description: string
  icon: typeof Wind
  color: string
  phases: { label: string; duration: number }[]
}

const PATTERNS: BreathPattern[] = [
  {
    id: 'coherence',
    name: 'Coherence cardiaque',
    description: '5 secondes d\'inspiration, 5 secondes d\'expiration. Le rythme parfait pour calmer le systeme nerveux.',
    icon: Wind,
    color: '#10B981',
    phases: [
      { label: 'Inspire', duration: 5 },
      { label: 'Expire', duration: 5 },
    ],
  },
  {
    id: 'relaxing',
    name: 'Relaxation profonde',
    description: '4-7-8. Inspire 4s, retiens 7s, expire 8s. Technique anti-stress validee scientifiquement.',
    icon: Moon,
    color: '#8B5CF6',
    phases: [
      { label: 'Inspire', duration: 4 },
      { label: 'Retiens', duration: 7 },
      { label: 'Expire', duration: 8 },
    ],
  },
  {
    id: 'energizing',
    name: 'Energisante',
    description: 'Inspiration rapide, expiration lente. Reveille le corps et l\'esprit en 3 minutes.',
    icon: Zap,
    color: '#F59E0B',
    phases: [
      { label: 'Inspire', duration: 2 },
      { label: 'Retiens', duration: 2 },
      { label: 'Expire', duration: 4 },
    ],
  },
]

export default function BreathePage() {
  const [selected, setSelected] = useState<Pattern | null>(null)
  const [active, setActive] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [cycles, setCycles] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pattern = PATTERNS.find((p) => p.id === selected)

  const stop = useCallback(() => {
    setActive(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  const reset = useCallback(() => {
    stop()
    setPhaseIndex(0)
    setCountdown(0)
    setCycles(0)
    setElapsed(0)
  }, [stop])

  useEffect(() => {
    if (!active || !pattern) return

    queueMicrotask(() => {
      setCountdown(pattern.phases[0].duration)
      setPhaseIndex(0)
    })

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPhaseIndex((pi) => {
            const next = pi + 1
            if (next >= pattern.phases.length) {
              setCycles((c) => c + 1)
              setCountdown(pattern.phases[0].duration)
              return 0
            }
            setCountdown(pattern.phases[next].duration)
            return next
          })
          return 0
        }
        return prev - 1
      })
      setElapsed((e) => e + 1)
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active, pattern])

  const currentPhase = pattern?.phases[phaseIndex]
  const totalPhaseDuration = currentPhase?.duration ?? 1
  const progress = countdown / totalPhaseDuration

  // Circle scale: inspire=expand, expire=shrink, retiens=hold
  const circleScale =
    currentPhase?.label === 'Inspire'
      ? 1 + (1 - progress) * 0.4
      : currentPhase?.label === 'Expire'
        ? 1.4 - (1 - progress) * 0.4
        : 1.4

  return (
    <div className="min-h-screen bg-[var(--bg-void)] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">
            Respiration guidee
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Quelques minutes de respiration consciente transforment ta journee d&apos;apprentissage.
          </p>
        </div>

        {!selected && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PATTERNS.map((p) => {
              const Icon = p.icon
              return (
                <Card
                  key={p.id}
                  className="p-5 cursor-pointer hover:border-white/10 transition-all"
                  onClick={() => { setSelected(p.id); reset() }}
                  data-testid={`pattern-${p.id}`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${p.color}20`, color: p.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{p.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{p.description}</p>
                </Card>
              )
            })}
          </div>
        )}

        {selected && pattern && (
          <div className="text-center">
            {/* Circle */}
            <div className="relative w-56 h-56 mx-auto mb-8">
              <motion.div
                animate={{ scale: active ? circleScale : 1 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${pattern.color}30 0%, ${pattern.color}05 70%, transparent 100%)`,
                  border: `2px solid ${pattern.color}40`,
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {active && currentPhase && (
                    <motion.div
                      key={`${phaseIndex}-${countdown}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-center"
                    >
                      <p className="text-lg font-medium" style={{ color: pattern.color }}>
                        {currentPhase.label}
                      </p>
                      <p className="text-4xl font-bold text-[var(--text-primary)]">{countdown}</p>
                    </motion.div>
                  )}
                  {!active && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-[var(--text-muted)]"
                    >
                      {cycles > 0 ? `${cycles} cycle${cycles > 1 ? 's' : ''}` : 'Pret ?'}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-6 mb-6 text-xs text-[var(--text-muted)]">
              <span>Cycles : {cycles}</span>
              <span>Temps : {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3">
              <Button
                variant="secondary"
                onClick={() => { setSelected(null); reset() }}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Changer
              </Button>
              <Button
                onClick={() => setActive(!active)}
                data-testid="btn-breathe-toggle"
              >
                {active ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {active ? 'Pause' : 'Commencer'}
              </Button>
              {cycles > 0 && (
                <Button variant="secondary" onClick={reset}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
