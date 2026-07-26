import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation — VEDA',
  description: 'CGU de VEDA par SASU PURAMA.',
}

export default function CGU() {
  return (
    <div className="relative z-10 min-h-screen px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors">
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="gradient-text font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl mb-2">
          Conditions Générales d&apos;Utilisation
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-12">Dernière mise à jour : 6 avril 2026</p>

        <div className="glass rounded-3xl p-8 md:p-12 space-y-10 text-[var(--text-secondary)] leading-relaxed">

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--text-primary)] mb-4">
              1. Acceptation des CGU
            </h2>
            <p>
              En accédant et en utilisant la plateforme VEDA (accessible à <strong className="text-[var(--text-primary)]">vidalangue.purama.dev</strong>), vous acceptez sans réserve les présentes Conditions Générales d&apos;Utilisation.
              Si vous n&apos;acceptez pas ces conditions, vous ne devez pas utiliser le service.
            </p>
            <p className="mt-2">
              SASU PURAMA se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle par email ou notification dans l&apos;application. La poursuite de l&apos;utilisation du service vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--text-primary)] mb-4">
              2. Description du service
            </h2>
            <p>
              VEDA est une plateforme SaaS (Software as a Service) d&apos;apprentissage des langues fondée sur la méthode neuro-phonétique propriétaire Natif Instinct™, incluant notamment :
            </p>
            <ul className="mt-3 space-y-1.5 ml-4 list-disc">
              <li>Sessions Natif Instinct™ : phonétique en 3 couches (orthographe, IPA, audible FR)</li>
              <li>HoloTalk : conversations vocales avec personas natifs en streaming</li>
              <li>Vocabulaire à répétition espacée et fil de vie multilingue</li>
              <li>Missions d&apos;immersion linguistique et impact</li>
              <li>16 langues disponibles avec accents régionaux</li>
              <li>Coach IA expert en linguistique neuro-cognitive</li>
            </ul>
            <p className="mt-3">
              Le service est fourni en mode SaaS accessible via navigateur web et application mobile progressive (PWA). SASU PURAMA s&apos;efforce d&apos;assurer une disponibilité maximale du service (objectif SLA 99,5%) mais ne peut garantir une disponibilité ininterrompue.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--text-primary)] mb-4">
              3. Création et gestion du compte
            </h2>
            <p>Pour utiliser VEDA, vous devez créer un compte en fournissant une adresse e-mail valide. Vous pouvez également vous connecter via votre compte Google.</p>
            <p className="mt-2">Vous êtes responsable :</p>
            <ul className="mt-2 space-y-1.5 ml-4 list-disc">
              <li>De la confidentialité de vos identifiants de connexion</li>
              <li>De toutes les activités effectuées depuis votre compte</li>
              <li>De la mise à jour de vos informations si elles changent</li>
            </ul>
            <p className="mt-2">
              Vous devez avoir au moins 16 ans pour créer un compte. Pour les mineurs de moins de 16 ans, le consentement parental est requis.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--text-primary)] mb-4">
              4. Utilisation acceptable
            </h2>
            <p>En utilisant VEDA, vous vous engagez à ne pas :</p>
            <ul className="mt-3 space-y-1.5 ml-4 list-disc">
              <li>Générer, diffuser ou promouvoir du contenu illégal, haineux, violent, pornographique ou discriminatoire</li>
              <li>Utiliser le service pour du spam, du phishing ou toute activité frauduleuse</li>
              <li>Tenter de contourner les limites d&apos;utilisation ou les mesures de sécurité</li>
              <li>Revendre ou redistribuer l&apos;accès au service sans autorisation écrite</li>
              <li>Utiliser le service pour entraîner des modèles d&apos;IA concurrents</li>
              <li>Violer les droits de propriété intellectuelle de tiers</li>
              <li>Usurper l&apos;identité d&apos;une autre personne ou entité</li>
              <li>Utiliser des robots ou scripts automatisés non autorisés pour accéder au service</li>
              <li>Frauder le système de parrainage (multi-comptes, faux filleuls)</li>
            </ul>
            <p className="mt-3">
              SASU PURAMA se réserve le droit de suspendre ou supprimer tout compte en violation de ces règles, sans préavis et sans remboursement dans les cas graves.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--text-primary)] mb-4">
              5. Propriété intellectuelle
            </h2>
            <p>
              <strong className="text-[var(--text-primary)]">Contenu de la plateforme :</strong> L&apos;ensemble du code, des interfaces, des marques, des logos et contenus de VEDA restent la propriété exclusive de SASU PURAMA.
            </p>
            <p className="mt-3">
              <strong className="text-[var(--text-primary)]">Contenu généré :</strong> Les contenus que vous créez via VEDA vous appartiennent, sous réserve des licences des modèles IA utilisés. Vous accordez à SASU PURAMA une licence limitée pour afficher ces contenus dans le cadre du service.
            </p>
            <p className="mt-3">
              <strong className="text-[var(--text-primary)]">Vocabulaire et fil de vie :</strong> Les phrases, mots et notes que vous générez restent les vôtres. VEDA peut conserver ces données pour personnaliser votre apprentissage tant que votre compte est actif.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--text-primary)] mb-4">
              6. Responsabilité limitée
            </h2>
            <p>
              VEDA fournit un service d&apos;apprentissage linguistique à titre éducatif. Les transcriptions phonétiques et les corrections sont fournies à titre indicatif et ne sauraient remplacer une certification linguistique officielle (DELF, TOEFL, IELTS, etc.).
            </p>
            <p className="mt-2">
              SASU PURAMA ne saurait être tenue responsable des décisions prises sur la base des résultats générés par l&apos;IA. La responsabilité de SASU PURAMA est limitée au montant total des sommes versées par l&apos;utilisateur au cours des 12 derniers mois.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--text-primary)] mb-4">
              7. Droit applicable et juridiction
            </h2>
            <p>
              Les présentes CGU sont soumises au droit français. En cas de litige, les parties s&apos;efforceront de trouver une solution amiable. À défaut, les tribunaux compétents seront ceux du ressort du Tribunal de Commerce de Besançon (France), sauf dispositions impératives contraires.
            </p>
            <p className="mt-2">
              Pour les consommateurs résidant dans l&apos;Union Européenne, les dispositions impératives de protection des consommateurs de votre pays de résidence s&apos;appliquent.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--text-primary)] mb-4">
              8. Contact
            </h2>
            <p>
              Pour toute question relative aux présentes CGU : <a href="mailto:matiss.frasne@gmail.com" className="text-[var(--cyan)] hover:underline">matiss.frasne@gmail.com</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
