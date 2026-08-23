'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, X, Bot, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/constants'
import AIDisclosure from '@/lib/legal/components/AIDisclosure'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  open: boolean
  onClose: () => void
  onShowEscalation: () => void
}

export default function ChatPanel({ open, onClose, onShowEscalation }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/aide/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error ?? 'Desole, une erreur est survenue. Reessaie !' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connexion perdue. Verifie ta connexion internet et reessaie.' }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages])

  if (!open) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-nebula)] shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[var(--green)] to-[var(--purple)]">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Coach VEDA</p>
            <p className="text-xs text-[var(--green)]">En ligne</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
          aria-label="Fermer le chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <AIDisclosure appName={APP_NAME} className="border-b border-[var(--border)] px-4 py-2 text-[11px] text-[var(--text-muted)]" />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="mx-auto h-10 w-10 text-[var(--green)]" />
            <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">Salut ! Pret a parler une nouvelle langue ?</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Pose-moi tes questions sur VEDA 🌱</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['Comment marche Natif Instinct ?', 'Combien coute VEDA ?', 'Comment fonctionne le parrainage ?'].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
              msg.role === 'user'
                ? 'ml-auto bg-gradient-to-r from-[var(--green)] to-[var(--purple)] text-white'
                : 'bg-white/5 text-[var(--text-primary)]'
            )}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2.5">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--green)]" />
            <span className="text-sm text-[var(--text-secondary)]">Reflexion en cours...</span>
          </div>
        )}

        {messages.length >= 3 && (
          <div className="text-center py-2">
            <button
              onClick={onShowEscalation}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--green)] transition-colors underline"
              data-testid="btn-escalade"
            >
              Le chatbot ne resout pas ton probleme ? Contacte un humain
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-[var(--border)] p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
            placeholder="Tape ta question..."
            className="flex-1 rounded-xl border border-[var(--border)] bg-white/5 px-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--green)] focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={() => void sendMessage()}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[var(--green)] to-[var(--purple)] text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
            aria-label="Envoyer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
