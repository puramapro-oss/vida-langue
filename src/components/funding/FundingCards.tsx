'use client'

import { useState } from 'react'
import { ExternalLink, ChevronDown } from 'lucide-react'
import Card from '@/components/ui/Card'

interface Aide {
  id: string
  nom: string
  type_aide: string
  montant_max: number | null
  url_officielle: string | null
  description: string | null
  region: string | null
}

interface Props {
  aides: Aide[]
  cumul: number
  typeLabels: Record<string, string>
}

export default function FundingCards({ aides, cumul, typeLabels }: Props) {
  const [expandedAide, setExpandedAide] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      <Card className="p-6 text-center bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
        <p className="text-sm text-[var(--text-secondary)] mb-1">
          Vous pouvez potentiellement obtenir jusqu&apos;à
        </p>
        <p className="text-4xl font-bold text-emerald-400 mb-1">
          {cumul.toLocaleString('fr-FR')} euros
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          en cumulant {aides.length} aide{aides.length > 1 ? 's' : ''} identifiee
          {aides.length > 1 ? 's' : ''}
        </p>
      </Card>

      <div className="space-y-3">
        {aides.map((aide) => (
          <Card key={aide.id} className="p-4">
            <button
              onClick={() => setExpandedAide(expandedAide === aide.id ? null : aide.id)}
              className="w-full text-left"
              data-testid={`aide-${aide.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {typeLabels[aide.type_aide] ?? aide.type_aide}
                    </span>
                    {aide.region && (
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {aide.region}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-[var(--text-primary)] mb-1">{aide.nom}</p>
                  {aide.montant_max !== null && (
                    <p className="text-sm font-bold text-emerald-400">
                      Jusqu&apos;à {aide.montant_max.toLocaleString('fr-FR')} €
                    </p>
                  )}
                </div>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-[var(--text-secondary)] transition-transform ${expandedAide === aide.id ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {expandedAide === aide.id && (
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  {aide.description || 'Pas de description disponible.'}
                </p>
                {aide.url_officielle && (
                  <a
                    href={aide.url_officielle}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    Voir sur le site officiel <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
