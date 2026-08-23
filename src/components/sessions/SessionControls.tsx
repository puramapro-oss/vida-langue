'use client'

import { Pause, Play, RotateCcw, SkipForward, Volume2 } from 'lucide-react'
import Button from '@/components/ui/Button'

interface Props {
  running: boolean
  loading: boolean
  completed: boolean
  content: string
  step: number
  totalSteps: number
  onStart: () => void
  onPause: () => void
  onNext: () => void
  onReset: () => void
  onSpeak: (text: string) => void
}

export default function SessionControls({
  running,
  loading,
  completed,
  content,
  step,
  totalSteps,
  onStart,
  onPause,
  onNext,
  onReset,
  onSpeak,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {!running && !completed && (
        <Button onClick={onStart} disabled={loading}>
          <Play className="h-4 w-4 mr-1" />
          Démarrer
        </Button>
      )}
      {running && (
        <Button onClick={onPause} variant="secondary">
          <Pause className="h-4 w-4 mr-1" />
          Pause
        </Button>
      )}
      {running && step < totalSteps - 1 && (
        <Button onClick={onNext} disabled={loading} variant="ghost">
          <SkipForward className="h-4 w-4 mr-1" />
          Phase suivante
        </Button>
      )}
      {(completed || running) && (
        <Button onClick={onReset} variant="ghost">
          <RotateCcw className="h-4 w-4 mr-1" />
          Recommencer
        </Button>
      )}
      {content && (
        <button
          onClick={() => onSpeak(content)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs hover:bg-white/10"
          aria-label="Réécouter"
        >
          <Volume2 className="h-3.5 w-3.5" />
          Réécouter
        </button>
      )}
    </div>
  )
}
