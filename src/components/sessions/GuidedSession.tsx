'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Pause, Play, RotateCcw, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { LEARNING_LANGUAGES } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'
import { speakWithElevenLabs, stopSpeaking } from '@/lib/elevenlabs-client'

export type GuidedMode = 'neuroflow' | 'sleep' | 'hypno' | 'reality' | 'group' | 'spiritual'

interface Phase {
  title: string
  description: string
}

interface Props {
  mode: GuidedMode
  badge: string
  title: string
  intro: string
  durationMin: number
  phases: Phase[]
  accentColor: string
  accentBg: string
  ttsRate?: number
  topicOptions?: { value: string; label: string }[]
  scenarioOptions?: { value: string; label: string }[]
}

export default function GuidedSession({
  mode,
  badge,
  title,
  intro,
  durationMin,
  phases,
  accentColor,
  accentBg,
  ttsRate = 0.95,
  topicOptions,
  scenarioOptions,
}: Props) {
  const { profile } = useAuth()
  const [target, setTarget] = useState('en')
  const [native, setNative] = useState('fr')
  const [topic, setTopic] = useState(topicOptions?.[0]?.value ?? '')
  const [scenario, setScenario] = useState(scenarioOptions?.[0]?.value ?? '')
  const [step, setStep] = useState(0)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(durationMin * 60)
  const [completed, setCompleted] = useState(false)
  const startedAtRef = useRef<number | null>(null)
  const tickRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const p = profile as unknown as { language_native?: string; languages_learning?: string[] } | null
    if (p?.language_native) setNative(p.language_native)
    if (p?.languages_learning?.[0]) setTarget(p.languages_learning[0])
  }, [profile])

  useEffect(() => {
    if (!running) return
    tickRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (tickRef.current) clearInterval(tickRef.current)
          finish()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [running])

  function speak(text: string) {
    void speakWithElevenLabs(text, target)
  }

  async function generate(nextStep: number) {
    setLoading(true)
    try {
      const res = await fetch('/api/sessions/guided', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          language: target,
          nativeLanguage: native,
          step: nextStep,
          topic: topic || undefined,
          scenario: scenario || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'VEDA n\'a pas pu générer la phase. Réessaie.')
        return
      }
      setContent(data.text ?? '')
      setTimeout(() => speak(data.text ?? ''), 300)
    } catch {
      toast.error('Connexion perdue. VEDA revient dès que possible.')
    } finally {
      setLoading(false)
    }
  }

  async function start() {
    setRunning(true)
    setCompleted(false)
    setStep(0)
    startedAtRef.current = Date.now()
    await generate(0)
  }

  async function next() {
    if (loading) return
    const ns = step + 1
    if (ns >= phases.length) {
      finish()
      return
    }
    setStep(ns)
    await generate(ns)
  }

  function pause() {
    setRunning(false)
    stopSpeaking()
  }

  function reset() {
    pause()
    setStep(0)
    setContent('')
    setSecondsLeft(durationMin * 60)
    setCompleted(false)
    startedAtRef.current = null
  }

  async function finish() {
    setRunning(false)
    setCompleted(true)
    stopSpeaking()
    const elapsed = startedAtRef.current
      ? Math.floor((Date.now() - startedAtRef.current) / 1000)
      : durationMin * 60
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          language: target,
          duration_seconds: elapsed,
        }),
      })
      const data = await res.json()
      if (data.xp_earned) {
        toast.success(`Session terminée 🌱 +${data.xp_earned} XP gravés dans ton univers VEDA.`)
      }
    } catch {
      toast.message('Session terminée. La synchronisation reprendra dès que tu retrouves le réseau.')
    }
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const progress = ((durationMin * 60 - secondsLeft) / (durationMin * 60)) * 100

  return (
    <div className="mx-auto max-w-3xl space-y-6" data-testid={`session-${mode}`}>
      <Link
        href="/dashboard/sessions"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-emerald-300"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux sessions
      </Link>

      <header className="space-y-2">
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${accentBg}`}
          style={{ borderColor: `${accentColor}30`, color: accentColor }}
        >
          {badge}
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm text-[var(--text-secondary)]">{intro}</p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={native}
          onChange={(e) => setNative(e.target.value)}
          disabled={running}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none disabled:opacity-50"
          aria-label="Langue maternelle"
        >
          {LEARNING_LANGUAGES.map(l => (
            <option key={l.code} value={l.code} className="bg-zinc-900">
              Ma langue : {l.flag} {l.name}
            </option>
          ))}
        </select>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          disabled={running}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none disabled:opacity-50"
          aria-label="Langue à pratiquer"
        >
          {LEARNING_LANGUAGES.map(l => (
            <option key={l.code} value={l.code} className="bg-zinc-900">
              Je parle : {l.flag} {l.name}
            </option>
          ))}
        </select>
      </div>

      {(topicOptions || scenarioOptions) && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {topicOptions && (
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={running}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none disabled:opacity-50"
              aria-label="Thème"
            >
              {topicOptions.map(o => (
                <option key={o.value} value={o.value} className="bg-zinc-900">
                  Thème : {o.label}
                </option>
              ))}
            </select>
          )}
          {scenarioOptions && (
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              disabled={running}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none disabled:opacity-50"
              aria-label="Scénario"
            >
              {scenarioOptions.map(o => (
                <option key={o.value} value={o.value} className="bg-zinc-900">
                  Lieu : {o.label}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <Card className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
            Phase {Math.min(step + 1, phases.length)}/{phases.length} · {phases[step]?.title ?? 'Préparation'}
          </div>
          <div className="font-mono text-lg tabular-nums" style={{ color: accentColor }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
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

        <p className="text-sm text-[var(--text-secondary)]">{phases[step]?.description}</p>

        <div className="min-h-[140px] rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          {loading ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              VEDA prépare ta phase…
            </div>
          ) : content ? (
            <div className="space-y-3">
              <p className="whitespace-pre-wrap text-base leading-relaxed text-[var(--text-primary)]">{content}</p>
              <button
                onClick={() => speak(content)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs hover:bg-white/10"
                aria-label="Réécouter"
              >
                <Volume2 className="h-3 w-3" /> Réécouter
              </button>
            </div>
          ) : (
            <p className="text-center text-sm text-[var(--text-muted)]">
              {completed
                ? 'Session terminée. Reviens demain pour ancrer un peu plus.'
                : 'Lance la session pour entendre VEDA.'}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!running && !completed && step === 0 && (
            <Button onClick={start} icon={<Play className="h-4 w-4" />} disabled={loading}>
              Commencer la session
            </Button>
          )}
          {running && (
            <>
              <Button onClick={next} disabled={loading || step >= phases.length - 1 ? false : false}>
                {step >= phases.length - 1 ? 'Terminer' : 'Phase suivante'}
              </Button>
              <Button variant="secondary" onClick={pause} icon={<Pause className="h-4 w-4" />}>
                Pause
              </Button>
            </>
          )}
          {!running && step > 0 && !completed && (
            <Button onClick={() => setRunning(true)} icon={<Play className="h-4 w-4" />}>
              Reprendre
            </Button>
          )}
          {(step > 0 || completed) && (
            <Button variant="ghost" onClick={reset} icon={<RotateCcw className="h-4 w-4" />}>
              Recommencer
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
