'use client'

import { ChevronRight } from 'lucide-react'
import type { FaqArticle } from '@/types'

interface Props {
  articles: FaqArticle[]
  loading: boolean
}

export default function FAQSection({ articles, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">Aucun resultat</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Essaie un autre mot-cle ou pose ta question au chatbot
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {articles.map(article => (
        <details key={article.id} className="group glass rounded-xl">
          <summary className="flex cursor-pointer items-center justify-between px-5 py-4">
            <span className="font-medium text-[var(--text-primary)]">{article.question}</span>
            <ChevronRight className="h-5 w-5 text-[var(--text-secondary)] transition-transform group-open:rotate-90" />
          </summary>
          <div className="border-t border-[var(--border)] px-5 py-4 text-sm leading-relaxed text-[var(--text-secondary)]">
            {article.answer}
          </div>
        </details>
      ))}
    </div>
  )
}
