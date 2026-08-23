'use client'

import { Link2, Copy, Check } from 'lucide-react'
import Card from '@/components/ui/Card'

interface LinksTabProps {
  goLink: string
  profileLink: string
  shareTemplates: string[]
  copied: string | null
  onCopy: (text: string, label: string) => void
}

export default function LinksTab({ goLink, profileLink, shareTemplates, copied, onCopy }: LinksTabProps) {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Tes liens</h3>
        <div className="space-y-3">
          {[
            { label: 'Lien promo -50% (7j)', url: goLink },
            { label: 'Page publique', url: profileLink },
          ].map(({ label, url }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 min-w-0">
                <Link2 className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                <code className="flex-1 truncate text-sm text-[var(--green)]">{url}</code>
              </div>
              <button
                onClick={() => onCopy(url, label)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-[var(--text-secondary)] hover:bg-white/[0.06] transition-colors"
              >
                {copied === label ? <Check className="h-4 w-4 text-[var(--green)]" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Templates de partage</h3>
        <div className="space-y-2">
          {shareTemplates.map((text, i) => (
            <div key={i} className="flex items-start gap-2">
              <p className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-[var(--text-secondary)]">
                {text}
              </p>
              <button
                onClick={() => onCopy(text, `Template ${i + 1}`)}
                className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-white/5 transition-colors"
              >
                {copied === `Template ${i + 1}` ? <Check className="h-3.5 w-3.5 text-[var(--green)]" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
