'use client'

import { MessageCircle, Mail, Send, Globe } from 'lucide-react'

interface ShareButtonsProps {
  referralLink: string
  shareMessage: string
}

export default function ShareButtons({ referralLink, shareMessage }: ShareButtonsProps) {
  if (!referralLink) return null

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
      </a>
      <a
        href={`sms:?body=${encodeURIComponent(shareMessage)}`}
        className="inline-flex items-center gap-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <MessageCircle className="h-3.5 w-3.5" /> SMS
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <Send className="h-3.5 w-3.5" /> Twitter
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <Globe className="h-3.5 w-3.5" /> Facebook
      </a>
      <a
        href={`mailto:?subject=${encodeURIComponent('VEDA — 14 jours offerts')}&body=${encodeURIComponent(shareMessage)}`}
        className="inline-flex items-center gap-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <Mail className="h-3.5 w-3.5" /> Email
      </a>
    </div>
  )
}
