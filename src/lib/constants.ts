export const SUPER_ADMIN_EMAIL = 'matiss.frasne@gmail.com'

export const APP_NAME = 'VEDA'
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
// VEDA n'expose qu'un seul abonnement + trial, mais on garde ce mapping comme
// compat pour éviter de toucher toutes les routes API dans P1.
// Interprétation VEDA :
//   free     → navigation libre (aucune action)
//   automate → essai 14 jours
//   create   → mensuel (12,90€)
//   build    → annuel (108€, -30% vs mensuel)
//   complete → annuel + bonus (moitié prix à vie)
export const PLAN_LIMITS = {
  free: { daily_questions: 10, label: 'Libre', price: 0, display: 'Libre (navigation)' },
  automate: { daily_questions: -1, label: 'Essai 14 jours', price: 0, display: '14 jours offerts' },
  create: { daily_questions: -1, label: 'VEDA Mensuel', price: 1290, display: 'Mensuel' },
  build: { daily_questions: -1, label: 'VEDA Annuel', price: 10800, display: 'Annuel -30%' },
  complete: { daily_questions: -1, label: 'VEDA à vie moitié prix', price: 645, display: 'Moitié prix à vie' },
} as const

export const TRIAL_DAYS = 14
export const WALLET_MIN_WITHDRAWAL = 5
export const ASSO_PERCENTAGE = 10

// 50+ langues groupées par famille linguistique — NAMA-Polyglotte les couvre toutes.
// L'UI peut filtrer par famille pour ne pas submerger. Langues d'éveil en bas.
export const LEARNING_LANGUAGES = [
  // Latines
  { code: 'fr', name: 'Français', flag: '🇫🇷', family: 'latin' },
  { code: 'es', name: 'Espagnol', flag: '🇪🇸', family: 'latin' },
  { code: 'it', name: 'Italien', flag: '🇮🇹', family: 'latin' },
  { code: 'pt', name: 'Portugais', flag: '🇵🇹', family: 'latin' },
  { code: 'ro', name: 'Roumain', flag: '🇷🇴', family: 'latin' },
  { code: 'ca', name: 'Catalan', flag: '🏴󠁥󠁳󠁣󠁴󠁿', family: 'latin' },
  { code: 'gl', name: 'Galicien', flag: '🏴󠁥󠁳󠁧󠁡󠁿', family: 'latin' },
  { code: 'oc', name: 'Occitan', flag: '🇫🇷', family: 'latin' },
  // Germaniques
  { code: 'en', name: 'Anglais', flag: '🇬🇧', family: 'germanic' },
  { code: 'de', name: 'Allemand', flag: '🇩🇪', family: 'germanic' },
  { code: 'nl', name: 'Néerlandais', flag: '🇳🇱', family: 'germanic' },
  { code: 'sv', name: 'Suédois', flag: '🇸🇪', family: 'germanic' },
  { code: 'no', name: 'Norvégien', flag: '🇳🇴', family: 'germanic' },
  { code: 'da', name: 'Danois', flag: '🇩🇰', family: 'germanic' },
  { code: 'is', name: 'Islandais', flag: '🇮🇸', family: 'germanic' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦', family: 'germanic' },
  // Slaves
  { code: 'ru', name: 'Russe', flag: '🇷🇺', family: 'slavic' },
  { code: 'pl', name: 'Polonais', flag: '🇵🇱', family: 'slavic' },
  { code: 'uk', name: 'Ukrainien', flag: '🇺🇦', family: 'slavic' },
  { code: 'cs', name: 'Tchèque', flag: '🇨🇿', family: 'slavic' },
  { code: 'sk', name: 'Slovaque', flag: '🇸🇰', family: 'slavic' },
  { code: 'bg', name: 'Bulgare', flag: '🇧🇬', family: 'slavic' },
  { code: 'hr', name: 'Croate', flag: '🇭🇷', family: 'slavic' },
  { code: 'sr', name: 'Serbe', flag: '🇷🇸', family: 'slavic' },
  { code: 'sl', name: 'Slovène', flag: '🇸🇮', family: 'slavic' },
  // Sino-tibétaines
  { code: 'zh', name: 'Chinois (mandarin)', flag: '🇨🇳', family: 'sino' },
  { code: 'yue', name: 'Cantonais', flag: '🇭🇰', family: 'sino' },
  { code: 'my', name: 'Birman', flag: '🇲🇲', family: 'sino' },
  { code: 'bo', name: 'Tibétain', flag: '🏔️', family: 'sino' },
  // Japonaise / Coréenne
  { code: 'ja', name: 'Japonais', flag: '🇯🇵', family: 'japonic' },
  { code: 'ko', name: 'Coréen', flag: '🇰🇷', family: 'koreanic' },
  // Arabo-sémitiques
  { code: 'ar', name: 'Arabe', flag: '🇸🇦', family: 'semitic' },
  { code: 'he', name: 'Hébreu', flag: '🇮🇱', family: 'semitic' },
  { code: 'am', name: 'Amharique', flag: '🇪🇹', family: 'semitic' },
  { code: 'mt', name: 'Maltais', flag: '🇲🇹', family: 'semitic' },
  // Indo-iraniennes
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', family: 'indic' },
  { code: 'ur', name: 'Ourdou', flag: '🇵🇰', family: 'indic' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩', family: 'indic' },
  { code: 'pa', name: 'Pendjabi', flag: '🇮🇳', family: 'indic' },
  { code: 'ta', name: 'Tamoul', flag: '🇮🇳', family: 'indic' },
  { code: 'te', name: 'Télougou', flag: '🇮🇳', family: 'indic' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳', family: 'indic' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳', family: 'indic' },
  { code: 'fa', name: 'Persan', flag: '🇮🇷', family: 'iranic' },
  // Turques
  { code: 'tr', name: 'Turc', flag: '🇹🇷', family: 'turkic' },
  { code: 'az', name: 'Azéri', flag: '🇦🇿', family: 'turkic' },
  { code: 'uz', name: 'Ouzbek', flag: '🇺🇿', family: 'turkic' },
  { code: 'kk', name: 'Kazakh', flag: '🇰🇿', family: 'turkic' },
  // Africaines
  { code: 'sw', name: 'Swahili', flag: '🇰🇪', family: 'bantu' },
  { code: 'zu', name: 'Zoulou', flag: '🇿🇦', family: 'bantu' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬', family: 'niger' },
  { code: 'ha', name: 'Haoussa', flag: '🇳🇬', family: 'afroasiatic' },
  { code: 'so', name: 'Somali', flag: '🇸🇴', family: 'afroasiatic' },
  // Austronésiennes / Asie SE
  { code: 'id', name: 'Indonésien', flag: '🇮🇩', family: 'austronesian' },
  { code: 'ms', name: 'Malais', flag: '🇲🇾', family: 'austronesian' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭', family: 'austronesian' },
  { code: 'vi', name: 'Vietnamien', flag: '🇻🇳', family: 'austroasiatic' },
  { code: 'th', name: 'Thaï', flag: '🇹🇭', family: 'taikadai' },
  { code: 'km', name: 'Khmer', flag: '🇰🇭', family: 'austroasiatic' },
  // Autres / Europe
  { code: 'el', name: 'Grec', flag: '🇬🇷', family: 'hellenic' },
  { code: 'fi', name: 'Finnois', flag: '🇫🇮', family: 'uralic' },
  { code: 'hu', name: 'Hongrois', flag: '🇭🇺', family: 'uralic' },
  { code: 'et', name: 'Estonien', flag: '🇪🇪', family: 'uralic' },
  // Langues des signes
  { code: 'lsf', name: 'Langue des signes FR', flag: '🤟', family: 'sign' },
  { code: 'asl', name: 'Langue des signes US', flag: '🤟', family: 'sign' },
  // Langues d'éveil (BRIEF spirituel)
  { code: 'angels', name: 'Langue des anges', flag: '✨', family: 'awakening' },
  { code: 'light', name: 'Langue de lumière', flag: '🌟', family: 'awakening' },
  { code: 'kundalini', name: 'Yatra Kundalini', flag: '🕉️', family: 'awakening' },
] as const

export const LANGUAGE_FAMILIES = [
  { id: 'latin', name: 'Latines', emoji: '🏛️' },
  { id: 'germanic', name: 'Germaniques', emoji: '🌲' },
  { id: 'slavic', name: 'Slaves', emoji: '❄️' },
  { id: 'sino', name: 'Sino-tibétaines', emoji: '🏯' },
  { id: 'japonic', name: 'Japonaise', emoji: '🌸' },
  { id: 'koreanic', name: 'Coréenne', emoji: '🏮' },
  { id: 'semitic', name: 'Arabo-sémitiques', emoji: '📜' },
  { id: 'indic', name: 'Indo-aryennes', emoji: '🪷' },
  { id: 'iranic', name: 'Iraniennes', emoji: '🌹' },
  { id: 'turkic', name: 'Turques', emoji: '☪️' },
  { id: 'bantu', name: 'Bantoues', emoji: '🦁' },
  { id: 'niger', name: 'Niger-Congo', emoji: '🥁' },
  { id: 'afroasiatic', name: 'Afro-asiatiques', emoji: '🌍' },
  { id: 'austronesian', name: 'Austronésiennes', emoji: '🌺' },
  { id: 'austroasiatic', name: 'Austro-asiatiques', emoji: '🎋' },
  { id: 'taikadai', name: 'Tai-Kadai', emoji: '🏝️' },
  { id: 'hellenic', name: 'Helléniques', emoji: '🏺' },
  { id: 'uralic', name: 'Ouraliennes', emoji: '🦌' },
  { id: 'sign', name: 'Langues des signes', emoji: '🤟' },
  { id: 'awakening', name: "Langues d'éveil", emoji: '✨' },
] as const

export const LEARNING_MODES = [
  { id: 'neuroflow', name: 'NeuroFlow™', description: 'Session 20-30 min : respiration → immersion double canal → scellage neurologique.', duration: 25, icon: 'brain' },
  { id: 'holotalk', name: 'HoloTalk™', description: 'Conversations vocales avec personnages IA réalistes, voix émotionnelles, mémoire longue.', duration: 10, icon: 'mic' },
  { id: 'phonetic', name: 'Natif Instinct™', description: 'Phonétique neuro-adaptée à ta langue maternelle : phrase → phonétique VEDA → traduction.', duration: 5, icon: 'volume-2' },
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
  '/aide', '/contact', '/financer', '/breathe', '/fiscal', '/confirmation',
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

// AI models — VEDA n'expose pas de choix de modèle mais garde un alias interne pour compat
export const AI_MODELS = [
  { id: 'vida-main', name: 'VEDA', provider: 'vida', badge: 'LIVE', color: '#10B981', description: 'La voix de VEDA.' },
] as const
