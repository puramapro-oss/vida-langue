import Link from 'next/link'
import { CheckCircle2, Sparkles, Clock, Gift } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'

export const metadata = {
  title: 'Bienvenue dans VEDA · Confirmation',
  description: `Ton abonnement ${APP_NAME} est activé. Essai 14 jours offert + prime de bienvenue 20€ débloquée dans 30 jours.`,
}

// Page de confirmation post-checkout Stripe.
// Célébration + info prime + L221-28 rappel (déjà accepté implicitement au clic).
export default function ConfirmationPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg-void)] py-16 px-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-20 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 p-10 text-center backdrop-blur-2xl shadow-[0_20px_80px_rgba(16,185,129,0.25)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
            <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
          </div>
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
            Bienvenue dans VEDA 🌱
          </h1>
          <p className="mt-3 text-sm text-emerald-100/90">
            Ton abonnement est activé. NAMA-Polyglotte t&apos;attend.
          </p>

          <div className="mt-8 space-y-3 text-left">
            <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-white">14 jours d&apos;essai offerts</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  Aucun prélèvement pendant 14 jours. Annule en 1 clic depuis ton espace.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <Gift className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-white">
                  Prime de bienvenue · 20 €
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  Débloquée après 30 jours d&apos;abonnement continu (anti-abus, 1/compte à vie).
                  Utilisable ensuite en retrait IBAN ou boutique VEDA.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-white">50+ langues · 8 modes</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  Commence par Natif Instinct™ pour ancrer la phonétique, puis ouvre HoloTalk.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-emerald-950 shadow-[0_8px_32px_rgba(16,185,129,0.25)] hover:bg-emerald-50 transition-colors"
          >
            Entrer dans mon espace →
          </Link>

          {/* Notice L221-28 3° Code de la conso : waiver implicite par clic.
              Pas de checkbox — l'utilisateur a déjà cliqué "Activer l'essai / S'abonner" à l'étape Stripe. */}
          <p className="mt-10 text-[11px] leading-relaxed text-[var(--text-muted)]">
            En activant ton abonnement, tu as demandé l&apos;accès immédiat au service numérique VEDA
            (art. L221-28 3° C. conso.). Tu reconnais que l&apos;exécution immédiate fait perdre le
            droit de rétractation de 14 jours. La prime de bienvenue est conditionnée à 30 jours
            d&apos;abonnement continu : annulation avant J+30 = prime récupérée (aucune autre retenue).
          </p>
        </div>
      </div>
    </main>
  )
}
