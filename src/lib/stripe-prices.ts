import type { Plan, PlanTier } from '@/types'

// Vida Langue n'expose qu'un seul abonnement (mensuel ou annuel) + l'offre
// "moitié prix à vie" anti-désabonnement. Le type Plan/PlanTier hérité
// d'Akasha est conservé pour ne pas casser les routes API existantes —
// les tiers (essential/pro/max) pointent tous vers le même price ID Vida.
//
// Mapping métier (cf. constants.ts PLAN_LIMITS) :
//   automate → essai 14 jours (pas de checkout, on utilise create par défaut)
//   create   → mensuel 12,90€/mois (price_1TL0vC...)
//   build    → annuel 108€/an     (price_1TL0vW...)
//   complete → moitié prix à vie 6,45€/mois (price_1TL0vE...)

export const VIDA_PRICE_MONTHLY = 'price_1TL0vC4Y1unNvKtXhjkRDCsv'
export const VIDA_PRICE_YEARLY = 'price_1TL0vW4Y1unNvKtXhk5PymQt'
export const VIDA_PRICE_HALF_LIFETIME = 'price_1TL0vE4Y1unNvKtXfAh4kghM'

const all = (id: string): Record<PlanTier, string> => ({
  essential: id,
  pro: id,
  max: id,
})

export const STRIPE_PRICE_IDS: Record<Exclude<Plan, 'free'>, Record<PlanTier, string>> = {
  automate: all(VIDA_PRICE_MONTHLY),
  create: all(VIDA_PRICE_MONTHLY),
  build: all(VIDA_PRICE_YEARLY),
  complete: all(VIDA_PRICE_HALF_LIFETIME),
}

export const VIDA_PRICE_TO_PLAN: Record<string, { plan: Exclude<Plan, 'free'>; tier: PlanTier }> = {
  [VIDA_PRICE_MONTHLY]: { plan: 'create', tier: 'essential' },
  [VIDA_PRICE_YEARLY]: { plan: 'build', tier: 'essential' },
  [VIDA_PRICE_HALF_LIFETIME]: { plan: 'complete', tier: 'essential' },
}
