export const APP_NAME = 'VEDA';
export const APP_AI_NAME = 'NAMA-Polyglotte';
export const APP_SLUG = 'vida-langue';
export const APP_COLOR = '#10B981';
export const APP_BG = '#0A0A0F';

export const WEB_URL = 'https://vidalangue.purama.dev';
export const API_URL = 'https://vidalangue.purama.dev/api';

export const SUPER_ADMIN_EMAIL = 'matiss.frasne@gmail.com';
export const WALLET_MIN = 5;

export const SESSION_MODES = [
  {
    slug: 'natif-instinct',
    title: 'Natif Instinct™',
    emoji: '🧬',
    duration: 12,
    description:
      'Phonétique 3 couches : décompose chaque mot comme un natif le pense.',
    color: '#10B981',
    available: true,
  },
  {
    slug: 'holotalk',
    title: 'Holotalk',
    emoji: '🎭',
    duration: 15,
    description: 'Conversation libre avec 6 personas natifs, streaming temps réel.',
    color: '#34D399',
    available: true,
  },
  {
    slug: 'neuroflow',
    title: 'Neuroflow',
    emoji: '🌊',
    duration: 25,
    description: 'Respiration → immersion → scellage. Apprentissage en flow profond.',
    color: '#06B6D4',
    available: true,
  },
  {
    slug: 'sleep',
    title: 'Sommeil',
    emoji: '🌙',
    duration: 8,
    description: 'Voix lente, 5 thèmes apaisants. Glisse dans le sommeil avec ta langue cible.',
    color: '#8B5CF6',
    available: true,
  },
  {
    slug: 'hypno',
    title: 'Hypno',
    emoji: '✨',
    duration: 20,
    description: 'Mot-clé répété en 4 contextes — gravé en mémoire long terme.',
    color: '#F59E0B',
    available: true,
  },
  {
    slug: 'reality',
    title: 'Reality',
    emoji: '🌍',
    duration: 15,
    description: '5 scénarios : café, marché, aéroport, taxi, hôtel.',
    color: '#EC4899',
    available: true,
  },
  {
    slug: 'group',
    title: 'Groupe',
    emoji: '👥',
    duration: 30,
    description: 'Simulation d\'un autre apprenant — pratique sociale sans pression.',
    color: '#6366F1',
    available: true,
  },
  {
    slug: 'spiritual',
    title: 'Spirituel',
    emoji: '🕉️',
    duration: 15,
    description: 'Intentions douces, connexion à la langue par le cœur.',
    color: '#A855F7',
    available: true,
  },
] as const;

export type SessionMode = (typeof SESSION_MODES)[number];

export const REFERRAL_TIERS = [
  { slug: 'graine', label: 'Graine 🌱', count: 0, perk: 'Démarrage' },
  { slug: 'pousse', label: 'Pousse 🌿', count: 1, perk: '+5 € bonus' },
  { slug: 'bourgeon', label: 'Bourgeon 🌸', count: 5, perk: '1 mois gratuit' },
  { slug: 'fleur', label: 'Fleur 🌺', count: 15, perk: '3 mois gratuits' },
  { slug: 'arbre', label: 'Arbre 🌳', count: 30, perk: '6 mois gratuits' },
  { slug: 'foret', label: 'Forêt 🌲', count: 75, perk: 'Année gratuite' },
  { slug: 'legende', label: 'Légende ✨', count: 150, perk: 'À vie offert' },
] as const;

// Wealth Engine Phase 1 · Ambassadeur tiers (aligné avec web components/engagement/AmbassadorTier)
export const AMBASSADOR_TIERS = [
  { slug: 'bronze', label: 'Bronze', minConversions: 1, perk: 'VEDA Mensuel offert' },
  { slug: 'argent', label: 'Argent', minConversions: 10, perk: 'VEDA Annuel offert' },
  { slug: 'or', label: 'Or', minConversions: 25, perk: 'Page perso' },
  { slug: 'platine', label: 'Platine', minConversions: 50, perk: 'Coach NAMA dédié' },
  { slug: 'diamant', label: 'Diamant', minConversions: 100, perk: 'VIP événements' },
  { slug: 'legende', label: 'Légende', minConversions: 250, perk: 'Commissions héréditaires' },
  { slug: 'eternel', label: 'Éternel', minConversions: 1000, perk: '1% parts VEDA à vie' },
] as const;

// Les 50+ langues complètes vivent côté web (src/lib/constants.ts).
// Côté mobile, on se contente d'exposer un count minimal pour l'UI marketing.
export const LANGUAGES_COUNT = 60; // indicative only
