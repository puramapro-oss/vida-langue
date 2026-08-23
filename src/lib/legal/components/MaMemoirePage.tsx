'use client';

import { useState } from 'react';
import AccountDeletionButton from './AccountDeletionButton';

export interface LegalAcceptanceRow {
  docType: string;
  version: string;
  acceptedAt: string;
}

export interface MaMemoirePageProps {
  appName: string;
  acceptations: LegalAcceptanceRow[];
  /** true si une suppression est déjà programmée (compte en période de grâce). */
  deletionScheduledFor?: string | null;
  exportEndpoint?: string;
  deleteEndpoint?: string;
  cancelDeleteEndpoint?: string;
}

const DOC_LABELS: Record<string, string> = {
  mentions: 'Mentions légales',
  cgu: 'CGU',
  cgv: 'CGV',
  confidentialite: 'Politique de confidentialité',
};

/**
 * Page « Ma mémoire » (NIYAMA-BRIEF.md §1) : voir/exporter/effacer ses données (RGPD art.
 * 15/17/20). Classes adaptées au design token de cette app (`.glass`, `var(--cyan)`...).
 */
export default function MaMemoirePage({
  appName,
  acceptations,
  deletionScheduledFor,
  exportEndpoint = '/api/legal/my-data',
  deleteEndpoint = '/api/account/delete',
  cancelDeleteEndpoint = '/api/account/delete',
}: MaMemoirePageProps) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch(exportEndpoint);
      if (!res.ok) throw new Error(`Export impossible (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mes-donnees.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "L'export a échoué, réessayez.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-12 px-4">
      <div>
        <h1 className="gradient-text font-[family-name:var(--font-display)] text-3xl font-bold mb-2">
          Ma mémoire
        </h1>
        <p className="text-[var(--text-secondary)]">
          Consulte, exporte ou efface les données que {appName} conserve à ton sujet.
        </p>
      </div>

      <section className="glass rounded-3xl p-6 space-y-3">
        <h2 className="font-semibold text-[var(--text-primary)]">Exporter mes données</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Télécharge une copie complète de tes données au format JSON (droit à la portabilité, art. 20 RGPD).
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          data-testid="ma-memoire-export-btn"
          className="min-h-11 rounded-full bg-[var(--cyan)] px-5 text-sm font-medium text-black disabled:opacity-60"
        >
          {exporting ? 'Préparation…' : 'Exporter mes données (JSON)'}
        </button>
        {exportError && <p className="text-sm text-red-400">{exportError}</p>}
      </section>

      <section className="glass rounded-3xl p-6 space-y-3">
        <h2 className="font-semibold text-[var(--text-primary)]">Mes acceptations légales</h2>
        {acceptations.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Aucune acceptation enregistrée.</p>
        ) : (
          <ul className="text-sm space-y-1 text-[var(--text-secondary)]">
            {acceptations.map((a) => (
              <li key={`${a.docType}-${a.version}`}>
                {DOC_LABELS[a.docType] ?? a.docType} — version {a.version} acceptée le{' '}
                {new Date(a.acceptedAt).toLocaleString('fr-FR')}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass rounded-3xl p-6 space-y-3 border border-red-500/20">
        <h2 className="font-semibold text-red-400">Supprimer mon compte</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          La suppression efface tes données personnelles et ton historique, sous réserve des obligations légales
          de conservation (comptable, fiscale).
        </p>
        <AccountDeletionButton
          deletionScheduledFor={deletionScheduledFor}
          deleteEndpoint={deleteEndpoint}
          cancelEndpoint={cancelDeleteEndpoint}
        />
      </section>
    </div>
  );
}
