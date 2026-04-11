export const SUPER_ADMIN_EMAIL = 'matiss.frasne@gmail.com'

export const APP_NAME = 'Vida Langue'
export const APP_SLUG = 'vida-langue'
export const APP_DOMAIN = 'vidalangue.purama.dev'
export const APP_COLOR = '#10B981'
export const APP_COLOR_SECONDARY = '#34D399'
export const APP_SCHEMA = 'vida_langue'
export const APP_TAGLINE = 'La première app qui grave les langues dans ton cerveau.'
export const APP_PROMISE = 'Deviens fluide à l\'oral en 30 jours, sans cours, sans stress, sans théorie.'

export const COMPANY_INFO = {
  name: 'SASU PURAMA',
  address: '8 Rue de la Chapelle, 25560 Frasne',
  country: 'France',
  taxNote: 'TVA non applicable, art. 293 B du CGI',
  dpo: 'matiss.frasne@gmail.com',
}

// Mapping Plan (type Plan hérité = free|automate|create|build|complete).
// Vida n'expose qu'un seul abonnement + trial, mais on garde ce mapping comme
// compat pour éviter de toucher toutes les routes API dans P1.
// Interprétation Vida :
//   free     → navigation libre (aucune action)
//   automate → essai 14 jours
//   create   → mensuel (12,90€)
//   build    → annuel (108€, -30% vs mensuel)
//   complete → annuel + bonus (moitié prix à vie)
export const PLAN_LIMITS = {
  free: { daily_questions: 10, label: 'Libre', price: 0, display: 'Libre (navigation)' },
  automate: { daily_questions: -1, label: 'Essai 14 jours', price: 0, display: '14 jours offerts' },
  create: { daily_questions: -1, label: 'Vida Mensuel', price: 1290, display: 'Mensuel' },
  build: { daily_questions: -1, label: 'Vida Annuel', price: 10800, display: 'Annuel -30%' },
  complete: { daily_questions: -1, label: 'Vida à vie moitié prix', price: 645, display: 'Moitié prix à vie' },
} as const

export const TRIAL_DAYS = 14
export const WALLET_MIN_WITHDRAWAL = 5
export const ASSO_PERCENTAGE = 10

export const LEARNING_LANGUAGES = [
  { code: 'en', name: 'Anglais', flag: '🇬🇧' },
  { code: 'es', name: 'Espagnol', flag: '🇪🇸' },
  { code: 'it', name: 'Italien', flag: '🇮🇹' },
  { code: 'de', name: 'Allemand', flag: '🇩🇪' },
  { code: 'pt', name: 'Portugais', flag: '🇵🇹' },
  { code: 'ja', name: 'Japonais', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinois', flag: '🇨🇳' },
  { code: 'ko', name: 'Coréen', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabe', flag: '🇸🇦' },
  { code: 'ru', name: 'Russe', flag: '🇷🇺' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'tr', name: 'Turc', flag: '🇹🇷' },
  { code: 'nl', name: 'Néerlandais', flag: '🇳🇱' },
  { code: 'pl', name: 'Polonais', flag: '🇵🇱' },
  { code: 'sv', name: 'Suédois', flag: '🇸🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
] as const

export const LEARNING_MODES = [
  { id: 'neuroflow', name: 'NeuroFlow™', description: 'Session 20-30 min : respiration → immersion double canal → scellage neurologique.', duration: 25, icon: 'brain' },
  { id: 'holotalk', name: 'HoloTalk™', description: 'Conversations vocales avec personnages IA réalistes, voix émotionnelles, mémoire longue.', duration: 10, icon: 'mic' },
  { id: 'phonetic', name: 'Natif Instinct™', description: 'Phonétique neuro-adaptée à ta langue maternelle : phrase → phonétique Vida → traduction.', duration: 5, icon: 'volume-2' },
  { id: 'sleep', name: 'SleepSync™', description: 'Avant dormir. Voix lente, phrases déjà connues, consolidation sommeil léger.', duration: 8, icon: 'moon' },
  { id: 'hypno', name: 'Hypno-Immersif™', description: 'Voix binaurale + micro-vibrations → double canal conscient/inconscient.', duration: 20, icon: 'sparkles' },
  { id: 'reality', name: 'Réalité Parallèle', description: 'Monde virtuel vocal : arriver dans un pays, négocier, gérer un conflit. 100% voix.', duration: 15, icon: 'globe' },
  { id: 'group', name: 'Groupe / Rencontre', description: 'Parle avec une personne réelle proposée par l\'app. Groupes auto-créés.', duration: 30, icon: 'users' },
  { id: 'spiritual', name: 'Spirituel', description: 'Apprentissage + méditation, gratitude, langues sacrées (anges, lumière, yatra kundalini).', duration: 15, icon: 'heart' },
] as const

export const NOTIFICATION_MODES = ['zen', 'focus', 'deep', 'silent', 'custom'] as const

export const PUBLIC_ROUTES = [
  '/', '/pricing', '/how-it-works', '/ecosystem', '/status', '/changelog',
  '/privacy', '/terms', '/legal', '/offline', '/login', '/signup', '/register',
  '/onboarding', '/mentions-legales', '/politique-confidentialite', '/cgv', '/cgu',
  '/aide', '/contact',
]

// Legacy XP_ACTIONS / XP_TITLES kept for compat with dashboard widgets
export const XP_ACTIONS = {
  daily_login: 10,
  chat_message: 2,
  complete_session: 25,
  complete_mission: 50,
  invite_friend: 100,
  streak_7: 50,
  streak_30: 200,
} as const

export const XP_TITLES = [
  { min: 1, max: 10, title: 'Graine' },
  { min: 11, max: 25, title: 'Pousse' },
  { min: 26, max: 50, title: 'Racine' },
  { min: 51, max: 75, title: 'Tronc' },
  { min: 76, max: 100, title: 'Arbre de Vie' },
] as const

// AI models — Vida n'expose pas de choix de modèle mais garde un alias interne pour compat
export const AI_MODELS = [
  { id: 'vida-main', name: 'Vida Langue', provider: 'vida', badge: 'LIVE', color: '#10B981', description: 'La voix de Vida Langue.' },
] as const
