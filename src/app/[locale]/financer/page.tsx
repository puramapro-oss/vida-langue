'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Search, FileText, ClipboardList, Euro, Sparkles, ExternalLink, ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { APP_NAME } from '@/lib/constants'

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
  const [expandedAide, setExpandedAide] = useState<string | null>(null)

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
            {/* Cumul banner */}
            <Card className="p-6 text-center bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
              <Sparkles className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Vous pouvez potentiellement obtenir jusqu&apos;à
              </p>
              <p className="text-4xl font-bold text-emerald-400 mb-1">
                {cumul.toLocaleString('fr-FR')} euros
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                en cumulant {aides.length} aide{aides.length > 1 ? 's' : ''} identifiee{aides.length > 1 ? 's' : ''}
              </p>
            </Card>

            {/* List */}
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
                            {TYPE_LABELS[aide.type_aide] ?? aide.type_aide}
                          </span>
                          {aide.region && (
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {aide.region}
                            </span>
                          )}
                          {aide.handicap_only && (
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              RQTH
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                          {aide.nom}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {aide.montant_max ? (
                          <span className="text-sm font-bold text-emerald-400">
                            {aide.montant_max.toLocaleString('fr-FR')} euros
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">Variable</span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${
                            expandedAide === aide.id ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </button>

                  {expandedAide === aide.id && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                      {aide.description && (
                        <p className="text-sm text-[var(--text-secondary)] mb-3">
                          {aide.description}
                        </p>
                      )}
                      {aide.url_officielle && (
                        <a
                          href={aide.url_officielle}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Voir le site officiel
                        </a>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>

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
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Votre dossier personnalise
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              Voici un recapitulatif de vos {aides.length} aides eligibles. Vous pouvez utiliser cette liste comme guide pour constituer vos demandes.
            </p>

            <div className="space-y-3 mb-6">
              {aides.map((aide, i) => (
                <div key={aide.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-emerald-400">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{aide.nom}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {aide.montant_max ? `Jusqu'a ${aide.montant_max.toLocaleString('fr-FR')} euros` : 'Montant variable'}
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
                Ce montant est indicatif. Les montants reels dependent de votre dossier et des criteres de chaque organisme.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux aides
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1" data-testid="btn-goto-suivi">
                Suivi
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3 : Suivi */}
        {step === 3 && (
          <Card className="p-6 md:p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">
              Suivi de vos demandes
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-md mx-auto">
              Vous avez identifie {aides.length} aides pour un total potentiel de {cumul.toLocaleString('fr-FR')} euros.
              Commencez vos demarches en visitant les sites officiels de chaque aide.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-2xl font-bold text-emerald-400">{aides.length}</p>
                <p className="text-xs text-[var(--text-muted)]">Aides identifiees</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-2xl font-bold text-emerald-400">{cumul.toLocaleString('fr-FR')} euros</p>
                <p className="text-xs text-[var(--text-muted)]">Cumul potentiel</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => setStep(0)} variant="secondary" data-testid="btn-restart">
                Refaire une recherche
              </Button>
              <Link href="/pricing">
                <Button className="w-full" data-testid="btn-back-pricing">
                  Voir les offres {APP_NAME}
                </Button>
              </Link>
            </div>
          </Card>
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
