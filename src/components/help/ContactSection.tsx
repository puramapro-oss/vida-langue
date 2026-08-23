'use client'

import Link from 'next/link'
import { Bot, MessageSquare } from 'lucide-react'

interface Props {
  onOpenChat: () => void
}

export default function ContactSection({ onOpenChat }: Props) {
  return (
    <div className="mt-12 rounded-2xl bg-gradient-to-r from-[var(--green)]/10 to-[var(--purple)]/10 p-8 text-center">
      <h2 className="text-xl font-bold text-[var(--text-primary)]">
        Tu n&apos;as pas trouve ta reponse ?
      </h2>
      <p className="mt-2 text-[var(--text-secondary)]">Notre equipe est la pour t&apos;aider</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onOpenChat}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--green)] to-[var(--purple)] px-6 py-3 font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Bot className="h-4 w-4" /> Assistant IA
        </button>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white/5 px-6 py-3 font-medium text-[var(--text-primary)] hover:bg-white/10 transition-colors"
        >
          <MessageSquare className="h-4 w-4" /> Nous contacter
        </Link>
      </div>
    </div>
  )
}
