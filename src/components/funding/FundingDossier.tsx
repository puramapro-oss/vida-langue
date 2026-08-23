'use client'

import { ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface Aide {
  id: string
  nom: string
  montant_max: number | null
  url_officielle: string | null
}

interface Props {
  aides: Aide[]
  cumul: number
  onBack: () => void
  onNext: () => void
}

export default function FundingDossier({ aides, cumul, onBack, onNext }: Props) {
  return (
    <Card className="p-6 md:p-8">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
        Votre dossier personnalise
      </h2>
      <p className="text-[var(--text-secondary)] text-sm mb-6">
        Voici un recapitulatif de vos {aides.length} aides eligibles. Vous pouvez utiliser cette
        liste comme guide pour constituer vos demandes.
      </p>

      <div className="space-y-3 mb-6">
        {aides.map((aide, i) => (
          <div
            key={aide.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-emerald-400">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{aide.nom}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {aide.montant_max
                  ? `Jusqu'a ${aide.montant_max.toLocaleString('fr-FR')} euros`
                  : 'Montant variable'}
              </p>
            </div>
            {aide.url_officielle && (
              <a
                href={aide.url_officielle}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mb-6">
        <p className="text-sm text-emerald-400 font-medium mb-1">
          Cumul potentiel : {cumul.toLocaleString('fr-FR')} euros
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Ce montant est indicatif. Les montants reels dependent de votre dossier et des criteres
          de chaque organisme.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button onClick={onNext} className="flex-1" data-testid="btn-goto-suivi">
          Suivre mes demandes
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Card>
  )
}
