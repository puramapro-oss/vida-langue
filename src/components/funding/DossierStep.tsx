'use client'

import { ArrowLeft, FileText, ClipboardList, ExternalLink } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface Aide {
  id: string
  nom: string
  type_aide: string
  organisme: string
  montant_max: number | null
  url_info: string | null
}

interface DossierStepProps {
  aides: Aide[]
  typeLabels: Record<string, string>
  onBack: () => void
}

export default function DossierStep({ aides, typeLabels, onBack }: DossierStepProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-2">
          <ClipboardList className="w-5 h-5 mr-2 inline-block text-emerald-400" />
          Ton dossier de financement
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Voici les aides que tu peux mobiliser. Pour chacune, la démarche est différente. Prends ton temps.
        </p>

        <div className="space-y-3">
          {aides.map((aide, i) => (
            <div
              key={aide.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-emerald-400">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm">{aide.nom}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {typeLabels[aide.type_aide] || aide.type_aide} · {aide.organisme}
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">
                    {aide.montant_max ? `Jusqu'à ${aide.montant_max.toLocaleString('fr-FR')} €` : 'Montant variable'}
                  </p>
                  {aide.url_info && (
                    <a
                      href={aide.url_info}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 text-xs inline-flex items-center gap-1 mt-2"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Voir les démarches
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux résultats
        </Button>
      </div>
    </div>
  )
}
