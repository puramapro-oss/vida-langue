'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Volume2, Mic, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Card from '@/components/ui/Card'
import { LEARNING_LANGUAGES } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'
import { speakWithElevenLabs } from '@/lib/elevenlabs-client'

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

const PERSONAS = [
  { id: 'vendor', name: 'Vendeur de marché', emoji: '🥭', desc: 'Chaleureux, négocie, plaisante.' },
  { id: 'grandma', name: 'Mamie', emoji: '👵', desc: 'Lente, tendre, pleine d\'expressions.' },
  { id: 'friend', name: 'Ami proche', emoji: '🤙', desc: 'Argot, humour, vie quotidienne.' },
  { id: 'cop', name: 'Policier', emoji: '👮', desc: 'Formel, questions précises.' },
  { id: 'boss', name: 'Patron', emoji: '💼', desc: 'Pro, réunions, projets.' },
  { id: 'flirt', name: 'Premier rendez-vous', emoji: '💘', desc: 'Sympa, écoute, taquine.' },
] as const

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US', es: 'es-ES', it: 'it-IT', de: 'de-DE', pt: 'pt-PT',
  ja: 'ja-JP', zh: 'zh-CN', ko: 'ko-KR', ar: 'ar-SA', ru: 'ru-RU',
  hi: 'hi-IN', tr: 'tr-TR', nl: 'nl-NL', pl: 'pl-PL', sv: 'sv-SE', fr: 'fr-FR',
}

export default function HoloTalkPage() {
  const { profile } = useAuth()
  const [persona, setPersona] = useState<string>('friend')
  const [target, setTarget] = useState('en')
  const [native, setNative] = useState('fr')
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const p = profile as unknown as { language_native?: string; languages_learning?: string[] } | null
    if (p?.language_native) setNative(p.language_native)
    if (p?.languages_learning?.[0]) setTarget(p.languages_learning[0])
  }, [profile])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function speak(text: string) {
    void speakWithElevenLabs(text, target)
  }

  async function send(e?: React.FormEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || streaming) return

    const userMsg: Msg = { role: 'user', content: text }
    const newMessages: Msg[] = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)

    const placeholderIdx = newMessages.length
    setMessages([...newMessages, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/holotalk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          persona,
          targetLanguage: target,
          nativeLanguage: native,
        }),
      })
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: 'Erreur' }))
        toast.error(err.error ?? 'VEDA a perdu le souffle.')
        setMessages(newMessages)
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const next = [...prev]
          next[placeholderIdx] = { role: 'assistant', content: acc }
          return next
        })
      }

      if (acc) {
        speak(acc)
        void fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'holotalk',
            language: target,
            duration_seconds: 30,
          }),
        })
      }
    } catch {
      toast.error('Connexion perdue.')
      setMessages(newMessages)
    } finally {
      setStreaming(false)
    }
  }

  function startVoiceInput() {
    if (typeof window === 'undefined') return
    type SRCtor = new () => {
      lang: string
      interimResults: boolean
      onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null
      onerror: (() => void) | null
      start: () => void
    }
    const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor }
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SR) {
      toast.message('Reconnaissance vocale non disponible sur ce navigateur.')
      return
    }
    const rec = new SR()
    rec.lang = LOCALE_MAP[target] ?? 'en-US'
    rec.interimResults = false
    rec.onresult = (e) => {
      const t = e.results[0]?.[0]?.transcript ?? ''
      if (t) setInput(t)
    }
    rec.onerror = () => toast.error('VEDA n\'a pas capté ta voix.')
    rec.start()
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-4xl flex-col gap-4" data-testid="holotalk">
      <Link
        href="/dashboard/sessions"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-violet-300"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux sessions
      </Link>

      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
          <Sparkles className="h-3 w-3" /> HoloTalk™
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight md:text-3xl">
          Choisis qui tu rencontres
        </h1>
      </header>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {PERSONAS.map(p => (
          <button
            key={p.id}
            onClick={() => setPersona(p.id)}
            className={`rounded-2xl border p-2.5 text-left transition-all ${
              persona === p.id
                ? 'border-violet-400/60 bg-violet-500/15 text-violet-100'
                : 'border-white/10 bg-white/[0.03] hover:border-white/20'
            }`}
            data-testid={`persona-${p.id}`}
          >
            <div className="text-2xl">{p.emoji}</div>
            <div className="mt-1 text-xs font-medium">{p.name}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={native}
          onChange={(e) => setNative(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
          aria-label="Langue maternelle"
          data-testid="holo-native"
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
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
          aria-label="Langue à pratiquer"
          data-testid="holo-target"
        >
          {LEARNING_LANGUAGES.map(l => (
            <option key={l.code} value={l.code} className="bg-zinc-900">
              Je parle : {l.flag} {l.name}
            </option>
          ))}
        </select>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden p-0">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-[var(--text-muted)]">
              <p>Lance la conversation. VEDA t&apos;écoute.</p>
              <p className="text-xs">Si tu écris dans ta langue, VEDA répondra dans la langue cible et te traduira.</p>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`msg-${i}`}
              >
                <div
                  className={`group relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === 'user'
                      ? 'bg-violet-500/20 text-violet-50'
                      : 'border border-white/10 bg-white/[0.03] text-[var(--text-primary)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content || (streaming && i === messages.length - 1 ? '…' : '')}</p>
                  {m.role === 'assistant' && m.content && (
                    <button
                      onClick={() => speak(m.content)}
                      className="absolute -right-2 -top-2 rounded-full border border-violet-400/30 bg-zinc-900 p-1.5 text-violet-300 opacity-0 transition-opacity hover:bg-violet-500/20 group-hover:opacity-100"
                      aria-label="Réécouter"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <form onSubmit={send} className="flex items-center gap-2 border-t border-white/5 p-3">
          <button
            type="button"
            onClick={startVoiceInput}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-violet-300 hover:bg-violet-500/15"
            aria-label="Parler"
            data-testid="voice-input"
          >
            <Mic className="h-4 w-4" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tape ou clique sur le micro…"
            disabled={streaming}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none disabled:opacity-50"
            data-testid="holo-input"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white disabled:opacity-50"
            aria-label="Envoyer"
            data-testid="holo-send"
          >
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </Card>
    </div>
  )
}
