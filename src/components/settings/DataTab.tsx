'use client'

import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface DataTabProps {
  showDeleteConfirm: 'history' | null
  setShowDeleteConfirm: (value: 'history' | null) => void
  onDeleteHistory: () => void
}

export default function DataTab({ showDeleteConfirm, setShowDeleteConfirm, onDeleteHistory }: DataTabProps) {
  return (
    <div className="flex flex-col gap-4" data-testid="data-tab">
      <Card className="p-6">
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
          <ShieldCheck className="h-4 w-4 text-[var(--cyan)]" />
          Ma memoire (RGPD)
        </h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          Exporte tes donnees au format JSON, consulte tes acceptations legales (CGU/CGV/confidentialite)
          ou programme la suppression de ton compte.
        </p>
        <Link href="/dashboard/ma-memoire">
          <Button variant="secondary" data-testid="ma-memoire-link">
            Ouvrir Ma memoire
          </Button>
        </Link>
      </Card>

      <Card className="p-6">
        <h2 className="mb-2 font-semibold text-[var(--text-primary)]">
          Supprimer mon historique de conversations
        </h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          Efface toutes tes sessions et messages. Cette action est irreversible.
        </p>
        {!showDeleteConfirm ? (
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm('history')}
            data-testid="delete-history-btn"
          >
            Supprimer l&apos;historique
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={onDeleteHistory}
              data-testid="confirm-delete-history-btn"
            >
              Confirmer la suppression
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(null)}
              data-testid="cancel-delete-btn"
            >
              Annuler
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
