'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message ?? 'Tu es inscrit 🌱')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error ?? 'Inscription impossible. Réessaie.')
      }
    } catch {
      setStatus('error')
      setMessage('Connexion perdue. Réessaie.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ton@email.com"
          className="flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm placeholder:text-[var(--text-muted)] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
          aria-label="Adresse email"
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-60 transition-colors"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              S&apos;abonner <Send className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
      {message && (
        <p
          className={`text-xs ${
            status === 'success' ? 'text-emerald-300' : 'text-rose-300'
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  )
}
