export const REFERRAL_TIERS = [
  { tier: 'graine', min: 0, label: 'Graine', color: '#94a3b8', perk: 'Tu commences ton chemin' },
  { tier: 'bronze', min: 5, label: 'Bronze', color: '#CD7F32', perk: '+5 vida_credits offerts' },
  { tier: 'argent', min: 10, label: 'Argent', color: '#C0C0C0', perk: '1 mois VEDA offert' },
  { tier: 'or', min: 25, label: 'Or', color: '#FFD700', perk: 'Prix gelé à -20% à vie' },
  { tier: 'platine', min: 50, label: 'Platine', color: '#E5E4E2', perk: 'Statut VEDA Voyageur' },
  { tier: 'diamant', min: 75, label: 'Diamant', color: '#B9F2FF', perk: 'Page perso vidalangue.purama.dev/p/' },
  { tier: 'legende', min: 100, label: 'Légende', color: '#10B981', perk: 'Commissions héréditaires + cadeaux' },
] as const

export type ReferralTier = typeof REFERRAL_TIERS[number]
