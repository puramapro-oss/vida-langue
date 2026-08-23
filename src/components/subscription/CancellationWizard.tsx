'use client'

import { AlertCircle, Clock, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const CANCELLATION_REASONS = [
  { id: 'price', label: 'Trop cher pour moi' },
  { id: 'time', label: 'Je n\'ai pas eu le temps de m\'y mettre' },
  { id: 'result', label: 'Pas vu de progression' },
  { id: 'other_app', label: 'J\'utilise une autre app' },
  { id: 'pause', label: 'Je veux juste faire une pause' },
  { id: 'other', label: 'Autre raison' },
] as const

type Step = 'reason' | 'offer' | 'confirm'

interface CancellationWizardProps {
  step: Step
  reason: string
  busy: boolean
  onReasonChange: (reason: string) => void
  onBack: () => void
  onContinue: () => void
  onAcceptOffer: () => void
  onConfirm: () => void
}

export default function CancellationWizard({
  step,
  reason,
  busy,
  onReasonChange,
  onBack,
  onContinue,
  onAcceptOffer,
  onConfirm,
}: CancellationWizardProps) {
  if (step === 'reason') {
    return (
      <Card className="p-6">
        <p className="text-xs uppercase tracking-wider text-emerald-300">Étape 1/3</p>
        <h2 className="mt-2 text-xl font-bold text-white">Qu&apos;est-ce qui te pousse à partir ?</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Pas d&apos;appel ni de justification. On recueille juste ton retour pour s&apos;améliorer.
        </p>
        <div className="mt-6 space-y-2">
          {CANCELLATION_REASONS.map(({ id, label }) => (
            <label
              key={id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04] has-[:checked]:border-emerald-400/30 has-[:checked]:bg-emerald-500/5"
            >
              <input
                type="radio"
                name="reason"
                value={id}
                checked={reason === id}
                onChange={(e) => onReasonChange(e.target.value)}
                className="h-4 w-4 flex-shrink-0 cursor-pointer border-gray-600 text-emerald-500 focus:ring-emerald-500/30"
              />
              <span className="text-sm text-white">{label}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" onClick={onBack} className="w-full sm:w-auto">
            Annuler
          </Button>
          <Button
            onClick={onContinue}
            disabled={!reason || busy}
            className="w-full sm:flex-1"
          >
            {busy ? 'Chargement…' : 'Continuer'}
          </Button>
        </div>
      </Card>
    )
  }

  if (step === 'offer') {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-emerald-300">Étape 2/3</p>
            <h2 className="mt-2 text-xl font-bold text-white">Offre spéciale : -50% à vie</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              On ne veut pas te perdre. Voici une dernière proposition : garde VEDA pour la moitié du prix, à vie.
            </p>
            <div className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-300">4,99 €</span>
                <span className="text-sm text-[var(--text-muted)] line-through">9,99 €</span>
                <span className="text-sm text-[var(--text-secondary)]">/ mois</span>
              </div>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Prix gelé à vie. Toutes les fonctionnalités. Tu peux annuler quand tu veux.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" onClick={onBack} className="w-full sm:w-auto">
                Retour
              </Button>
              <Button
                onClick={onAcceptOffer}
                disabled={busy}
                className="w-full bg-emerald-600 hover:bg-emerald-700 sm:flex-1"
              >
                {busy ? 'Traitement…' : 'Prendre l\'offre'}
              </Button>
              <Button
                variant="ghost"
                onClick={onContinue}
                disabled={busy}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              >
                Refuser et continuer
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (step === 'confirm') {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/10">
            <AlertCircle className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-amber-300">Étape 3/3 · Confirmation</p>
            <h2 className="mt-2 text-xl font-bold text-white">On est sûrs ?</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Ton abonnement sera annulé. Tu garderas accès jusqu&apos;à la fin de ta période payée.
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-500/5 p-3">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
              <p className="text-xs text-[var(--text-secondary)]">
                Après annulation, tu peux te réabonner à tout moment. Tes données restent 90 jours.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" onClick={onBack} className="w-full sm:w-auto">
                Retour
              </Button>
              <Button
                onClick={onConfirm}
                disabled={busy}
                className="w-full bg-red-600/80 hover:bg-red-600 sm:flex-1"
              >
                {busy ? 'Annulation…' : 'Confirmer l\'annulation'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return null
}
