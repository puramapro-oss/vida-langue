'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Loader2, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { LEARNING_LANGUAGES } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'

interface PhoneticLayer {
  original: string
  phonetic_vida: string
  micro_translation: string
  graduation: 'full_phonetic' | 'mix' | 'native'
}

interface PhoneticResponse {
  source_phrase: string
  source_language: string
  native_language: string
  layers: PhoneticLayer[]
  word_breakdown: Array<{ word: string; phonetic: string; meaning: string }>
  cultural_note?: string
}

const LAYER_LABELS = {
  full_phonetic: 'Couche 1 — Pure phonétique Vida',
  mix: 'Couche 2 — Mix doux',
  native: 'Couche 3 — Lecture native',
} as const

const SAMPLE_PHRASES: Record<string, string[]> = {
  en: ['Did you eat?', 'What time is it?', 'I want to go home', 'Where is the bathroom?'],
  es: ['¿Cómo estás?', 'Buenos días', 'No entiendo', '¿Dónde está la playa?'],
  it: ['Buongiorno', 'Vorrei un caffè', 'Quanto costa?', 'Sono qui'],
  de: ['Guten Tag', 'Wie heißt du?', 'Ich liebe dich', 'Wo ist der Bahnhof?'],
  pt: ['Bom dia', 'Tudo bem?', 'Obrigado', 'Onde fica a praia?'],
  ja: ['こんにちは', 'ありがとう', 'お元気ですか', 'どこですか'],
}

export default function NatifInstinctPage() {
  const { profile } = useAuth()
  const [phrase, setPhrase] = useState('')
  const [target, setTarget] = useState('en')
  const [native, setNative] = useState('fr')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PhoneticResponse | null>(null)
  const [activeLayer, setActiveLayer] = useState<0 | 1 | 2>(0)

  useEffect(() => {
    const p = profile as unknown as { language_native?: string; languages_learning?: string[] } | null
    if (p?.language_native) setNative(p.language_native)
    if (p?.languages_learning?.[0]) setTarget(p.languages_learning[0])
  }, [profile])

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!phrase.trim() || loading) return
    setLoading(true)
    setResult(null)
    setActiveLayer(0)
    try {
      const res = await fetch('/api/phonetic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase: phrase.trim(), targetLanguage: target, nativeLanguage: native }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Vida a perdu le souffle, retente.')
        return
      }
      setResult(data as PhoneticResponse)

      void fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'phonetic',
          language: target,
          duration_seconds: 60,
          words_learned: 1,
        }),
      })
    } catch {
      toast.error('Connexion perdue. Respire, retente.')
    } finally {
      setLoading(false)
    }
  }

  function speak(text: string, lang: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.message('Voix navigateur indisponible sur cet appareil.')
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : lang === 'it' ? 'it-IT' : lang === 'de' ? 'de-DE' : lang === 'pt' ? 'pt-PT' : lang === 'ja' ? 'ja-JP' : lang
    utterance.rate = 0.85
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const samples = SAMPLE_PHRASES[target] ?? SAMPLE_PHRASES.en

  return (
    <div className="mx-auto max-w-4xl space-y-6" data-testid="natif-instinct">
      <Link
        href="/dashboard/sessions"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-emerald-300"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux sessions
      </Link>

      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          <Sparkles className="h-3 w-3" /> Mode Natif Instinct™
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight md:text-4xl">
          Tape une phrase. Vois ton cerveau s&apos;ouvrir.
        </h1>
        <p className="text-[var(--text-secondary)]">
          3 couches phonétiques adaptées à ta langue maternelle. Aucune théorie. Tu lis, tu parles, tu graves.
        </p>
      </header>

      <Card className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="native-select" className="mb-1 block text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Ta langue
              </label>
              <select
                id="native-select"
                value={native}
                onChange={(e) => setNative(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                data-testid="native-select"
              >
                {LEARNING_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="bg-zinc-900">
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="target-select" className="mb-1 block text-xs uppercase tracking-wider text-[var(--text-muted)]">
                Langue à apprendre
              </label>
              <select
                id="target-select"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                data-testid="target-select"
              >
                {LEARNING_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="bg-zinc-900">
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="phrase-input" className="mb-1 block text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Ta phrase
            </label>
            <textarea
              id="phrase-input"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Ex : Did you eat?"
              maxLength={500}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base focus:border-emerald-400 focus:outline-none resize-none"
              data-testid="phrase-input"
            />
            <div className="mt-1 flex flex-wrap gap-1.5">
              {samples.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPhrase(s)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-emerald-400/40 hover:text-emerald-300"
                  data-testid={`sample-${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !phrase.trim()}
            loading={loading}
            data-testid="submit-phrase"
            className="w-full !bg-gradient-to-r !from-emerald-500 !to-emerald-600 !text-white"
          >
            {loading ? 'Vida grave…' : 'Graver dans mon cerveau'}
          </Button>
        </form>
      </Card>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.source_phrase}
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
            data-testid="phonetic-result"
          >
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(result.layers ?? []).map((l, i) => (
                <button
                  key={l.graduation}
                  onClick={() => setActiveLayer(i as 0 | 1 | 2)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    activeLayer === i
                      ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      : 'border border-white/10 bg-white/5 text-[var(--text-secondary)] hover:border-emerald-400/40'
                  }`}
                  data-testid={`layer-tab-${i}`}
                >
                  {LAYER_LABELS[l.graduation]}
                </button>
              ))}
            </div>

            <Card className="space-y-5 p-6">
              {result.layers?.[activeLayer] && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Phrase originale</p>
                    <div className="mt-1 flex items-start gap-3">
                      <p className="flex-1 font-[family-name:var(--font-display)] text-2xl font-medium md:text-3xl">
                        {result.layers[activeLayer].original}
                      </p>
                      <button
                        onClick={() => speak(result.layers[activeLayer].original, target)}
                        className="shrink-0 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-2 text-emerald-300 hover:bg-emerald-500/20"
                        aria-label="Écouter"
                        data-testid="speak-original"
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-emerald-400">Phonétique Vida</p>
                    <p className="mt-1 font-mono text-3xl font-bold tracking-wide text-emerald-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] md:text-4xl">
                      {result.layers[activeLayer].phonetic_vida}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Sens</p>
                    <p className="mt-1 text-lg italic text-[var(--text-secondary)]">
                      {result.layers[activeLayer].micro_translation}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {result.word_breakdown && result.word_breakdown.length > 0 && (
              <Card className="p-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Mot par mot
                </h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {result.word_breakdown.map((w, i) => (
                    <li key={`${w.word}-${i}`} className="flex items-baseline justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{w.word}</p>
                        <p className="font-mono text-xs text-emerald-300">{w.phonetic}</p>
                      </div>
                      <p className="shrink-0 text-xs text-[var(--text-muted)]">{w.meaning}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {result.cultural_note && (
              <Card className="border-violet-500/20 bg-violet-500/5 p-4">
                <p className="text-sm text-violet-200">
                  <span className="mr-1">✨</span>
                  {result.cultural_note}
                </p>
              </Card>
            )}
          </motion.div>
        )}

        {loading && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-12 text-emerald-300"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Vida grave dans ton cerveau…</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
