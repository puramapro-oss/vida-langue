'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, HelpCircle, MessageSquare, CreditCard,
  Users, Sparkles, ArrowLeft, Languages,
  Mic, Leaf, Heart,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import FAQSection from '@/components/help/FAQSection'
import ContactSection from '@/components/help/ContactSection'
import ChatPanel from '@/components/help/ChatPanel'
import type { FaqArticle } from '@/types'

const CATEGORIES: { id: string; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'general', label: 'General', icon: <HelpCircle className="h-5 w-5" />, color: '#10b981' },
  { id: 'apprentissage', label: 'Apprentissage', icon: <Languages className="h-5 w-5" />, color: '#10b981' },
  { id: 'modes', label: 'Modes', icon: <Sparkles className="h-5 w-5" />, color: '#22c55e' },
  { id: 'phonetique', label: 'Natif Instinct', icon: <Mic className="h-5 w-5" />, color: '#84cc16' },
  { id: 'abonnement', label: 'Abonnement', icon: <CreditCard className="h-5 w-5" />, color: '#0ea5e9' },
  { id: 'parrainage', label: 'Parrainage', icon: <Users className="h-5 w-5" />, color: '#ec4899' },
  { id: 'wallet', label: 'Wallet', icon: <CreditCard className="h-5 w-5" />, color: '#3b82f6' },
  { id: 'impact', label: 'Impact', icon: <Leaf className="h-5 w-5" />, color: '#14b8a6' },
  { id: 'compte', label: 'Compte', icon: <Heart className="h-5 w-5" />, color: '#f472b6' },
]

export default function AidePage() {
  const [articles, setArticles] = useState<FaqArticle[]>([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [chatOpen, setChatOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('faq_articles').select('*').order('category')
      .then(({ data }) => {
        if (data) setArticles(data as FaqArticle[])
        setLoading(false)
      })
  }, [supabase])

  const filtered = articles.filter(a => {
    const matchSearch = !search || a.question.toLowerCase().includes(search.toLowerCase()) || a.answer.toLowerCase().includes(search.toLowerCase())
    const matchCat = !activeCategory || a.category === activeCategory
    return matchSearch && matchCat
  })

  return (
    <div className="min-h-screen bg-[var(--bg-void)]">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-nebula)]">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--green)]">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Centre d&apos;aide VEDA</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Trouve une reponse a ta question, ou parle a ton coach</p>

          {/* Search */}
          <div className="relative mx-auto mt-6 max-w-lg">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une question..."
              className="w-full rounded-2xl border border-[var(--border)] bg-white/5 py-3 pl-12 pr-4 text-[var(--text-primary)] outline-none focus:border-[var(--green)] placeholder:text-[var(--text-secondary)]"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Categories */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
              !activeCategory ? 'bg-[var(--green)]/10 text-[var(--green)]' : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
            )}
          >
            Tout
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                activeCategory === cat.id ? 'bg-[var(--green)]/10 text-[var(--green)]' : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <FAQSection articles={filtered} loading={loading} />
        <ContactSection onOpenChat={() => setChatOpen(true)} />
      </div>

      {/* Floating Chatbot Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[var(--green)] to-[var(--purple)] text-white shadow-lg shadow-[var(--green)]/20 hover:scale-105 transition-transform"
          aria-label="Ouvrir l'assistant"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} onShowEscalation={() => {}} />
    </div>
  )
}
