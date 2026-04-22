'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Download, Loader2, Calculator, CheckCircle2, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FiscalBanner from '@/components/fiscal/FiscalBanner'

interface FiscalStatement {
  id: string
  year: number
  total_earnings_cents: number
  breakdown: Record<string, number>
  pdf_url: string | null
  stamped_hash: string | null
  generated_at: string
}

interface FiscalProfile {
  regime: string | null
  siret: string | null
  siret_display_name: string | null
  siret_verified_at: string | null
  declare_in_france: boolean
}

export default function DashboardFiscalPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [statements, setStatements] = useState<FiscalStatement[]>([])
  const [profile, setProfile] = useState<FiscalProfile | null>(null)
  const [currentYearCents, setCurrentYearCents] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [siretInput, setSiretInput] = useState('')
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const [{ data: stmts }, { data: prof }, { data: walletTx }] = await Promise.all([
        supabase.from('fiscal_statements').select('*').eq('user_id', user.id).order('year', { ascending: false }),
        supabase.from('fiscal_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase
          .from('wallet_transactions')
          .select('amount, type, created_at')
          .eq('user_id', user.id)
          .gte('created_at', `${new Date().getFullYear()}-01-01`),
      ])

      if (stmts) setStatements(stmts as FiscalStatement[])
      if (prof) {
        setProfile(prof as FiscalProfile)
        if (prof.siret) setSiretInput(prof.siret)
      }

      const cents = (walletTx ?? []).reduce((acc: number, tx) => {
        // only positive earnings count toward tax threshold
        const amt = Number(tx.amount ?? 0)
        return amt > 0 ? acc + Math.round(amt * 100) : acc
      }, 0)
      setCurrentYearCents(cents)

      setLoading(false)
    }
    void load()
  }, [user, supabase])

  async function verifySiret() {
    if (!siretInput.trim()) return
    setVerifying(true)
    try {
      const res = await fetch('/api/tax/verify-siret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siret: siretInput.trim() }),
      })
      const data = await res.json()
      if (!data.ok) {
        toast.error(data.error ?? 'SIRET invalide.')
        setVerifying(false)
        return
      }

      // Persist dans fiscal_profiles
      await supabase.from('fiscal_profiles').upsert({
        user_id: user!.id,
        siret: data.siret,
        siret_display_name: data.displayName,
        siret_verified_at: new Date().toISOString(),
        regime: data.isAssociation ? 'asso' : 'micro',
      }, { onConflict: 'user_id' })

      setProfile({
        regime: data.isAssociation ? 'asso' : 'micro',
        siret: data.siret,
        siret_display_name: data.displayName,
        siret_verified_at: new Date().toISOString(),
        declare_in_france: true,
      })
      toast.success(`SIRET vérifié : ${data.displayName}`)
    } catch {
      toast.error('Vérification impossible.')
    }
    setVerifying(false)
  }

  async function generateCurrentYearPdf() {
    setGenerating(true)
    try {
      const res = await fetch('/api/fiscal/pdf', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Génération impossible.')
        setGenerating(false)
        return
      }
      toast.success('PDF généré. Consulte la liste ci-dessous.')
      // reload
      const { data: stmts } = await supabase.from('fiscal_statements').select('*').eq('user_id', user!.id).order('year', { ascending: false })
      if (stmts) setStatements(stmts as FiscalStatement[])
    } catch {
      toast.error('Erreur serveur.')
    }
    setGenerating(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-2 py-4">
      <div className="flex items-center gap-3">
        <Calculator className="h-6 w-6 text-emerald-300" />
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white sm:text-3xl">
          Mon espace fiscal
        </h1>
      </div>

      <FiscalBanner totalEarningsCents={currentYearCents} />

      {/* SIRET */}
      <Card className="p-6">
        <p className="text-xs uppercase tracking-wider text-emerald-300">Profil fiscal</p>
        <h2 className="mt-2 text-lg font-semibold text-white">
          {profile?.siret_display_name ?? 'Particulier'}
        </h2>
        {profile?.siret ? (
          <div className="mt-2 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            SIRET vérifié : {profile.siret} · régime {profile.regime}
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Si tu es entrepreneur, association ou étudiant avec activité déclarée, ajoute ton SIRET.
              On le vérifie via l&apos;INSEE (gratuit, officiel).
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                type="text"
                value={siretInput}
                onChange={(e) => setSiretInput(e.target.value)}
                placeholder="SIRET 14 chiffres"
                className="flex-1 min-w-[200px] rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2 text-sm text-white outline-none focus:border-emerald-400/40"
                inputMode="numeric"
                maxLength={20}
              />
              <Button onClick={verifySiret} disabled={verifying || !siretInput.trim()}>
                {verifying ? 'Vérification…' : 'Vérifier SIRET'}
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Récap année en cours */}
      <Card className="p-6">
        <p className="text-xs uppercase tracking-wider text-emerald-300">
          Année en cours · {new Date().getFullYear()}
        </p>
        <div className="mt-2 flex items-baseline justify-between gap-4">
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
            {(currentYearCents / 100).toFixed(2)} €
          </p>
          <Button variant="secondary" onClick={generateCurrentYearPdf} disabled={generating}>
            {generating ? 'Génération…' : 'Générer PDF'}
          </Button>
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Le PDF définitif est généré automatiquement chaque 1er janvier avec horodatage Bitcoin.
        </p>
      </Card>

      {/* Historique */}
      {statements.length > 0 && (
        <Card className="p-6">
          <p className="text-xs uppercase tracking-wider text-emerald-300">Historique</p>
          <ul className="mt-4 space-y-3">
            {statements.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div>
                  <p className="text-sm font-semibold text-white">Année {s.year}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {(s.total_earnings_cents / 100).toFixed(2)} € · généré le {new Date(s.generated_at).toLocaleDateString('fr-FR')}
                  </p>
                  {s.stamped_hash && (
                    <p className="mt-1 text-[11px] font-mono text-emerald-300/70">
                      OTS: {s.stamped_hash.slice(0, 16)}…
                    </p>
                  )}
                </div>
                {s.pdf_url && (
                  <a
                    href={s.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 text-xs font-medium text-white hover:bg-white/[0.08]"
                  >
                    <Download className="h-3.5 w-3.5" /> PDF
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Info guide public */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
          <div>
            <p className="text-sm font-semibold text-white">Besoin de détails ?</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Consulte le <Link href="/fiscal" className="text-emerald-300 hover:text-emerald-200 underline underline-offset-4">guide fiscal public</Link>{' '}
              pour comprendre les 3 paliers (1 500 € / 2 500 € / 3 000 €) et choisir ton régime.
            </p>
          </div>
        </div>
      </Card>
    </main>
  )
}
