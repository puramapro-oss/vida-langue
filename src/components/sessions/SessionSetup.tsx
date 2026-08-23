'use client'

import { LEARNING_LANGUAGES } from '@/lib/constants'

interface Props {
  native: string
  target: string
  topic?: string
  scenario?: string
  disabled: boolean
  onNativeChange: (code: string) => void
  onTargetChange: (code: string) => void
  onTopicChange?: (val: string) => void
  onScenarioChange?: (val: string) => void
  topicOptions?: { value: string; label: string }[]
  scenarioOptions?: { value: string; label: string }[]
}

export default function SessionSetup({
  native,
  target,
  topic,
  scenario,
  disabled,
  onNativeChange,
  onTargetChange,
  onTopicChange,
  onScenarioChange,
  topicOptions,
  scenarioOptions,
}: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={native}
          onChange={(e) => onNativeChange(e.target.value)}
          disabled={disabled}
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
          onChange={(e) => onTargetChange(e.target.value)}
          disabled={disabled}
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
          {topicOptions && onTopicChange && (
            <select
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              disabled={disabled}
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
          {scenarioOptions && onScenarioChange && (
            <select
              value={scenario}
              onChange={(e) => onScenarioChange(e.target.value)}
              disabled={disabled}
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
    </>
  )
}
