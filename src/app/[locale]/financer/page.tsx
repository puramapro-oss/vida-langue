'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Search, FileText, ClipboardList, Euro, ExternalLink } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { APP_NAME } from '@/lib/constants'
import FundingCards from '@/components/funding/FundingCards'
import DossierStep from '@/components/funding/DossierStep'
import TrackingStep from '@/components/funding/TrackingStep'

interface Aide {
  id: string
  nom: string
  type_aide: string
  profil_eligible: string[]
  situation_eligible: string[]
  montant_max: number | null
  url_officielle: string | null
  description: string | null
  region: string | null
  handicap_only: boolean
}

const PROFILS = [
  { value: 'salarie', label: 'Salarie(e)' },
  { value: 'demandeur_emploi', label: 'Demandeur d\'emploi' },
  { value: 'etudiant', label: 'Etudiant(e)' },
  { value: 'independant', label: 'Independant(e) / Auto-entrepreneur' },
  { value: 'jeune', label: 'Jeune (16-25 ans)' },
  { value: 'senior', label: 'Senior (50+)' },
  { value: 'createur', label: 'Createur d\'entreprise' },
  { value: 'fonctionnaire', label: 'Fonctionnaire' },
  { value: 'handicap', label: 'En situation de handicap' },
  { value: 'parent', label: 'Parent' },
  { value: 'benevole', label: 'Benevole / Service civique' },
  { value: 'inactif', label: 'Sans activite' },
]

const SITUATIONS = [
  { value: 'actif', label: 'En poste / actif' },
  { value: 'chomage', label: 'Au chomage' },
  { value: 'reconversion', label: 'En reconversion professionnelle' },
  { value: 'formation', label: 'En formation' },
  { value: 'creation_entreprise', label: 'Creation d\'entreprise' },
  { value: 'etudes', label: 'En etudes' },
  { value: 'etudes_etranger', label: 'Etudes a l\'etranger' },
  { value: 'stage_etranger', label: 'Stage a l\'etranger' },
  { value: 'insertion', label: 'En insertion' },
  { value: 'rsa', label: 'Beneficiaire RSA' },
  { value: 'handicap', label: 'Reconnaissance handicap' },
  { value: 'faibles_revenus', label: 'Faibles revenus' },
  { value: 'mobilite_professionnelle', label: 'Mobilite professionnelle' },
  { value: 'alternance', label: 'En alternance / apprentissage' },
  { value: 'service_civique', label: 'Service civique' },
  { value: 'parent', label: 'Parent en formation' },
  { value: 'activite_partielle', label: 'Activite partielle' },
]

const REGIONS = [
  { value: '', label: 'Toute la France' },
  { value: 'ile-de-france', label: 'Ile-de-France' },
  { value: 'auvergne-rhone-alpes', label: 'Auvergne-Rhone-Alpes' },
  { value: 'nouvelle-aquitaine', label: 'Nouvelle-Aquitaine' },
  { value: 'occitanie', label: 'Occitanie' },
  { value: 'grand-est', label: 'Grand Est' },
  { value: 'dom-tom', label: 'DOM-TOM' },
]

const STEPS = [
  { icon: ClipboardList, label: 'Votre profil' },
  { icon: Search, label: 'Aides trouvees' },
  { icon: FileText, label: 'Votre dossier' },
  { icon: Euro, label: 'Suivi' },
]

const TYPE_LABELS: Record<string, string> = {
  formation: 'Formation',
  emploi: 'Emploi',
  social: 'Social',
  handicap: 'Handicap',
  jeune: 'Jeune',
  senior: 'Senior',
  reconversion: 'Reconversion',
  mobilite: 'Mobilite',
  numerique: 'Numerique',
  culture: 'Culture',
  regional: 'Regional',
}

export default function FinancerPage() {
  const [step, setStep] = useState(0)
  const [profil, setProfil] = useState('')
  const [situation, setSituation] = useState('')
  const [region, setRegion] = useState('')
  const [handicap, setHandicap] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aides, setAides] = useState<Aide[]>([])
  const [cumul, setCumul] = useState(0)

  const handleSearch = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/financer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profil, situation, region: region || undefined, handicap }),
      })
      const data = (await res.json()) as { aides: Aide[]; cumul: number }
      setAides(data.aides)
      setCumul(data.cumul)
      setStep(1)
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-void)] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux offres
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 text-emerald-400 text-sm font-medium mb-4">
            <Euro className="w-3.5 h-3.5" />
            Financez votre formation
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            Trouvez vos aides en 2 minutes
          </h1>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            45 dispositifs analyses. La plupart des apprenants {APP_NAME} ne paient rien grace aux aides publiques.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const active = i === step
            const done = i < step
            return (
              <button
                key={i}
                onClick={() => { if (done) setStep(i) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  active
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : done
                      ? 'bg-white/5 text-emerald-400/60 cursor-pointer hover:bg-white/10'
                      : 'bg-white/[0.02] text-[var(--text-muted)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            )
          })}
        </div>

        {/* Step 0 : Profil */}
        {step === 0 && (
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
              Quel est votre profil ?
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Votre situation professionnelle
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PROFILS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setProfil(p.value)}
                      data-testid={`profil-${p.value}`}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all border min-h-[44px] ${
                        profil === p.value
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'bg-white/[0.03] border-white/[0.06] text-[var(--text-secondary)] hover:bg-white/[0.06]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Votre situation actuelle
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SITUATIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSituation(s.value)}
                      data-testid={`situation-${s.value}`}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all border min-h-[44px] ${
                        situation === s.value
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'bg-white/[0.03] border-white/[0.06] text-[var(--text-secondary)] hover:bg-white/[0.06]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="financer-region" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Votre region
                </label>
                <select
                  id="financer-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  data-testid="region-select"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/[0.06] text-[var(--text-primary)] px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/40 min-h-[44px]"
                >
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={handicap}
                  onChange={(e) => setHandicap(e.target.checked)}
                  data-testid="handicap-check"
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-emerald-500"
                />
                <span className="text-sm text-[var(--text-secondary)]">
                  Je suis en situation de handicap (RQTH)
                </span>
              </label>

              <Button
                onClick={() => void handleSearch()}
                loading={loading}
                disabled={!profil || !situation}
                className="w-full"
                data-testid="btn-search-aides"
              >
                <Search className="w-4 h-4 mr-2" />
                Rechercher mes aides
              </Button>
            </div>
          </Card>
        )}

        {/* Step 1 : Resultats */}
        {step === 1 && (
          <div className="space-y-5">
            <FundingCards aides={aides} cumul={cumul} typeLabels={TYPE_LABELS} />

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(0)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Modifier mon profil
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1" data-testid="btn-goto-dossier">
                Mon dossier
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 : Dossier */}
        {step === 2 && (
          <DossierStep
            aides={aides.map(a => ({ ...a, url_info: a.url_officielle }))}
            typeLabels={TYPE_LABELS}
            onBack={() => setStep(1)}
          />
        )}

        {/* Step 3 : Suivi */}
        {step === 3 && (
          <TrackingStep
            aidesCount={aides.length}
            cumul={cumul}
            onBack={() => setStep(2)}
          />
        )}

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-10 max-w-md mx-auto">
          Les informations sont fournies a titre indicatif et mises a jour regulierement.
          Consultez les sites officiels pour connaitre les conditions exactes d&apos;eligibilite.
        </p>
      </div>
    </main>
  )
}
