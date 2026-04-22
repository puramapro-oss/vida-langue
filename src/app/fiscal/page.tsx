import Link from 'next/link'
import { ArrowRight, Calculator, FileText, Shield, Info } from 'lucide-react'
import { COMPANY_INFO } from '@/lib/constants'

export const metadata = {
  title: 'Guide fiscal VEDA · Seuils & déclaration',
  description: 'Guide fiscal clair pour les apprenants VEDA qui perçoivent des récompenses : seuils 1500€ / 2500€ / 3000€, régimes, PDF annuel automatique.',
}

const THRESHOLDS = [
  {
    cents: 150000,
    label: '1 500 €',
    regime: 'Micro-BNC simplifié',
    description: 'Pas de déclaration spécifique. Tes gains sont couverts par le forfait forfaitaire.',
    color: 'emerald',
  },
  {
    cents: 250000,
    label: '2 500 €',
    regime: 'Déclaration 2042 C PRO',
    description: 'À déclarer dans la case "Revenus non salariés non professionnels".',
    color: 'cyan',
  },
  {
    cents: 300000,
    label: '3 000 €',
    regime: 'Régime réel recommandé',
    description: 'Au-delà, bascule sur régime réel ou micro-entreprise pour optimiser.',
    color: 'amber',
  },
]

export default function FiscalPage() {
  return (
    <main className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg-void)] pb-20 pt-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
            <Calculator className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Guide fiscal VEDA
          </h1>
          <p className="mt-4 text-base text-[var(--text-secondary)] sm:text-lg">
            Clair. Honnête. Sans angoisse. Tu gagnes de quoi déclarer ?
            On te dit exactement quoi faire, selon ton seuil.
          </p>
        </header>

        {/* Seuils */}
        <section className="mt-16 space-y-4">
          <h2 className="text-xs uppercase tracking-wider text-emerald-300">Les 3 paliers</h2>
          {THRESHOLDS.map((t) => (
            <article
              key={t.cents}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 backdrop-blur-xl"
            >
              <div className="flex items-baseline justify-between">
                <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
                  {t.label}
                </p>
                <span className="text-xs uppercase tracking-wider text-emerald-300">
                  /an cumulés
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{t.regime}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{t.description}</p>
            </article>
          ))}
        </section>

        {/* Note info */}
        <section className="mt-10 rounded-2xl border border-cyan-400/25 bg-cyan-500/[0.04] p-6">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-300" />
            <div>
              <p className="text-sm font-semibold text-cyan-100">Bon à savoir</p>
              <p className="mt-2 text-sm text-cyan-200/80">
                Les seuils indiqués sont des repères pratiques adaptés au profil typique d&apos;un
                apprenant VEDA. Pour une situation particulière (auto-entrepreneur, étudiant boursier,
                bénéficiaire RSA, société), consulte ton centre des impôts ou un expert-comptable.
              </p>
              <p className="mt-2 text-sm text-cyan-200/80">
                VEDA <strong>n&apos;est pas</strong> ton expert-comptable : nous générons les documents, tu déclares.
                {' '}
                {COMPANY_INFO.name} agit comme <em>tiers déclarant</em> (mandat utilisateur) lorsque tu
                actives cette option depuis ton espace.
              </p>
            </div>
          </div>
        </section>

        {/* PDF auto */}
        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <FileText className="h-6 w-6 text-emerald-300" strokeWidth={1.8} />
            <h3 className="mt-4 text-base font-semibold text-white">PDF annuel automatique</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Chaque 1er janvier, VEDA génère ton récapitulatif de l&apos;année précédente.
              Total gains + ventilation (parrainage, missions, concours, prime) + hash blockchain OpenTimestamps.
            </p>
          </article>
          <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <Shield className="h-6 w-6 text-emerald-300" strokeWidth={1.8} />
            <h3 className="mt-4 text-base font-semibold text-white">Horodatage Bitcoin</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Chaque PDF est scellé via OpenTimestamps sur la blockchain Bitcoin.
              Preuve d&apos;immuabilité recevable en cas de contrôle fiscal.
            </p>
          </article>
        </section>

        {/* CTA */}
        <section className="mt-12 text-center">
          <Link
            href="/dashboard/fiscal"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-emerald-950 hover:bg-emerald-50 transition-colors"
          >
            Voir mon récap fiscal <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Connexion requise · Récap disponible dès le 1er gain
          </p>
        </section>
      </div>
    </main>
  )
}
