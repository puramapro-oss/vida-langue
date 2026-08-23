import { APP_DOMAIN, APP_NAME } from '@/lib/constants'
import type { LegalAppConfig, LegalSection } from './types'

/**
 * Config NIYAMA de VEDA (vida-langue). `aPaiement=true` (abonnement Stripe réel,
 * cf src/app/api/stripe/checkout), `aChatIA=true` (HoloTalk + coach, cf src/app/api/holotalk
 * et src/lib/claude.ts). Famille `karma_wellness` : VEDA reverse une part de son CA aux
 * utilisateurs (prime de bienvenue, parrainage, missions/redistribution) et à l'association.
 */
const clausesSpecifiquesCgu: LegalSection[] = [
  {
    titre: "Méthode d'apprentissage et fonctionnalités",
    paragraphes: [
      `${APP_NAME} repose sur la méthode neuro-phonétique propriétaire Natif Instinct™ (phonétique en 3 couches : orthographe, IPA, transcription audible française) et propose notamment : HoloTalk (conversations vocales avec personas IA), un vocabulaire à répétition espacée, un fil de vie multilingue, des missions d'immersion, et un accès à 50+ langues avec accents régionaux.`,
      `Les transcriptions phonétiques et corrections sont fournies à titre indicatif et ne remplacent pas une certification linguistique officielle (DELF, TOEFL, IELTS...).`,
    ],
  },
  {
    titre: "Âge minimum",
    paragraphes: [
      `${APP_NAME} est réservée aux personnes âgées d'au moins 16 ans. Pour les mineurs de moins de 16 ans, le consentement du titulaire de l'autorité parentale est requis avant toute création de compte.`,
    ],
  },
  {
    titre: 'Utilisation acceptable',
    paragraphes: [`En utilisant ${APP_NAME}, tu t'engages à ne pas :`],
    liste: [
      'Générer, diffuser ou promouvoir du contenu illégal, haineux, violent ou discriminatoire',
      "Utiliser le service pour du spam, du phishing ou toute activité frauduleuse",
      'Frauder le programme de parrainage (multi-comptes, faux filleuls)',
      "Utiliser le service pour entraîner des modèles d'IA concurrents",
      'Revendre ou redistribuer l\'accès au service sans autorisation écrite',
    ],
  },
  {
    titre: 'Programme de parrainage et primes',
    paragraphes: [
      "Le parrainage et la prime de bienvenue sont soumis à des règles anti-abus (1 prime par compte à vie, vérification KYC avant tout retrait). Le détail des conditions (montants, délais de déblocage) est affiché dans l'espace « Wallet » du compte et fait foi.",
      `${APP_NAME} se réserve le droit d'annuler toute prime ou commission obtenue frauduleusement.`,
    ],
  },
]

const clausesSpecifiquesCgv: LegalSection[] = [
  {
    titre: 'Tarifs et formules',
    paragraphes: [
      "Les prix sont indiqués en euros, hors taxes (TVA non applicable, art. 293 B du CGI). Les formules disponibles à la date de rédaction :",
    ],
    liste: [
      'VEDA Mensuel : 12,90 €/mois — accès illimité à tous les modes',
      'VEDA Annuel : 108 €/an (soit 9 €/mois) — économie de 30 % vs mensuel',
      'VEDA à vie moitié prix : 6,45 €/mois facturés à vie (offre de fidélisation, conditions affichées à la souscription)',
    ],
  },
  {
    titre: 'Offre et essai gratuit',
    paragraphes: [
      "L'abonnement inclut 14 jours d'essai gratuit sans prélèvement, résiliable à tout moment depuis les paramètres du compte avant la fin de l'essai. Les tarifs des différentes formules (mensuelle, annuelle) sont affichés sur la page /pricing et peuvent évoluer ; le tarif applicable est celui affiché au moment de la souscription.",
      "En validant son abonnement (y compris pendant l'essai), le Client demande expressément l'exécution immédiate du service numérique et reconnaît perdre son droit de rétractation de 14 jours dès le premier accès au contenu (art. L221-28 3° du Code de la consommation).",
    ],
  },
  {
    titre: 'Prime de bienvenue',
    paragraphes: [
      "Une prime de bienvenue (montant affiché à la souscription) est créditée sur le wallet du Client et débloquée après 30 jours d'abonnement continu (1 prime par compte, à vie). Elle est utilisable en retrait (IBAN, sous réserve de vérification d'identité) ou dans la boutique VEDA.",
      "En cas d'annulation de l'abonnement avant le 30ème jour, la prime de bienvenue est retirée sans autre retenue ni pénalité supplémentaire.",
    ],
  },
]

export function buildLegalConfig(): LegalAppConfig {
  return {
    slug: 'vida-langue',
    nom: APP_NAME,
    domaine: APP_DOMAIN,
    famille: 'karma_wellness',
    company: {
      nom: 'SASU PURAMA',
      forme_juridique: 'SASU',
      adresse: '8 Rue de la Chapelle',
      code_postal: '25560',
      commune: 'Frasne',
      pays: 'France',
      siret: process.env.NEXT_PUBLIC_SIRET || '',
      tva_non_applicable: true,
      mention_tva: 'TVA non applicable, art. 293 B du CGI',
      emailContact: 'matiss.frasne@gmail.com',
      directeurPublication: 'Matiss Frasne',
      tribunalCompetent: 'Besançon (25)',
    },
    mediateur: { nom: null, url: null },
    descriptionActivite: `${APP_NAME} est une plateforme SaaS d'apprentissage des langues par phonétique neuro-adaptative et conversations vocales avec IA.`,
    aPaiement: true,
    aChatIA: true,
    clausesSpecifiquesCgu,
    clausesSpecifiquesCgv,
  }
}
