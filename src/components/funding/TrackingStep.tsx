'use client'

import { ClipboardList, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface TrackingStepProps {
  aidesCount: number
  cumul: number
  onBack: () => void
}

export default function TrackingStep({ aidesCount, cumul, onBack }: TrackingStepProps) {
  return (
    <Card className="p-6 md:p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
        <ClipboardList className="w-7 h-7 text-emerald-400" />
      </div>
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">
        Suivi de vos demandes
      </h2>
      <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-md mx-auto">
        Vous avez identifié {aidesCount} aides pour un total potentiel de {cumul.toLocaleString('fr-FR')} €.
        Commencez vos démarches en visitant les sites officiels de chaque aide.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <p className="text-2xl font-bold text-emerald-400">{aidesCount}</p>
          <p className="text-xs text-[var(--text-muted)]">Aides identifiées</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <p className="text-2xl font-bold text-emerald-400">{cumul.toLocaleString('fr-FR')} €</p>
          <p className="text-xs text-[var(--text-muted)]">Cumul potentiel</p>
        </div>
      </div>

      <Button variant="secondary" onClick={onBack} className="mx-auto">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour au dossier
      </Button>
    </Card>
  )
}
