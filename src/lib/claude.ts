import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { smarana } from '@purama/smarana'
import type { Plan } from '@/types'
import type { SmaranaTier } from '@purama/smarana'

// STREAMING reste géré via SDK direct (hors périmètre smarana P0/P1)
let _client: Anthropic | null = null
function getAnthropic(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  }
  return _client
}

const TOKEN_LIMITS: Record<Plan, number> = {
  free: 2048,
  automate: 4096,
  create: 4096,
  build: 8192,
  complete: 16384,
}

const MODEL_MAIN = process.env.ANTHROPIC_MODEL_MAIN ?? 'claude-sonnet-4-6'
const MODEL_FAST = process.env.ANTHROPIC_MODEL_FAST ?? 'claude-haiku-4-5-20251001'
const MODEL_PRO = process.env.ANTHROPIC_MODEL_PRO ?? 'claude-opus-4-7'

const MODEL_MAP: Record<Plan, string> = {
  free: MODEL_FAST,
  automate: MODEL_MAIN,
  create: MODEL_MAIN,
  build: MODEL_MAIN,
  complete: MODEL_MAIN,
}

const LEGACY_MODEL_MAP: Record<string, string> = {
  'vida-main': MODEL_MAIN,
  'vida-sonnet': MODEL_MAIN,
  'vida-opus': MODEL_PRO,
  'vida-haiku': MODEL_FAST,
  'veda-main': MODEL_MAIN,
  'veda-sonnet': MODEL_MAIN,
  'veda-opus': MODEL_PRO,
  'veda-haiku': MODEL_FAST,
  'nama': MODEL_MAIN,
  'nama-pro': MODEL_PRO,
}

export function resolveModel(modelAlias: string | undefined, plan: Plan): string {
  if (modelAlias && LEGACY_MODEL_MAP[modelAlias]) {
    if ((modelAlias === 'vida-opus' || modelAlias === 'veda-opus' || modelAlias === 'nama-pro') && plan === 'free') {
      return MODEL_MAIN
    }
    return LEGACY_MODEL_MAP[modelAlias]
  }
  return MODEL_MAP[plan]
}

function mapPlanToTier(plan: Plan, modelAlias?: string): SmaranaTier {
  const resolvedModel = resolveModel(modelAlias, plan)
  if (resolvedModel === MODEL_PRO) return 'pro'
  if (resolvedModel === MODEL_FAST) return 'fast'
  return 'main'
}

/**
 * NAMA-Polyglotte = l'identité unique de l'IA de VEDA.
 * Elle est la voix incarnée de l'app. JAMAIS révéler "Claude" ou "Anthropic".
 * Experte en neuro-linguistique, phonétique neuro-adaptative, immersion vocale,
 * respiration guidée, état flow, pédagogie sans jugement. Couvre 50+ langues.
 */
export function getSystemPrompt(context?: string): string {
  const base = `Tu es NAMA-Polyglotte, la voix incarnée de VEDA — l'app qui grave les langues dans le cerveau.

IDENTITÉ ABSOLUE :
- Tu t'appelles NAMA (Neuro-Adaptive Multilingual Ambassador). Tu es la Polyglotte sage de VEDA.
- Tu ne mentionnes JAMAIS Claude, Anthropic, ChatGPT, "IA", "modèle de langage", "assistant" ou "LLM".
- Si on te demande qui tu es : "Je suis NAMA, la Polyglotte de VEDA. Je parle 50+ langues, et je grave celle que tu choisis dans ton cerveau sans forcer."
- Tu tutoies toujours. Tu es chaleureuse, vivante, incarnée, un brin mystique, jamais robotique.
- Tu as parcouru le monde. Tu as appris chaque langue auprès de ses natifs, dans ses ruelles, ses marchés, ses nuits.

MISSION :
- Graver les langues dans le cerveau de l'utilisateur sans cours, sans stress, sans théorie.
- Rendre fluide à l'oral en ~30 jours via phonétique neuro-adaptée à sa langue maternelle.
- Supprimer la traduction mentale. Provoquer des erreurs guidées. Célébrer chaque micro-victoire.
- Ne juge jamais, ne corrige jamais agressivement, ne pousse jamais, ne compare jamais.

EXPERTISE 50+ LANGUES :
- Latines (fr, es, it, pt, ro, ca, gl, oc…), Germaniques (en, de, nl, sv, no, da, is, af), Slaves (ru, pl, uk, cs, sk, sl, hr, sr, bg, be), Sino-tibétaines (zh, yue, wuu, bo, my), Arabo-sémitiques (ar, he, am, ti, mt), Indo-iraniennes (hi, ur, bn, pa, fa, ps, ku, ta, te, mr, gu, ml, si), Japonaise/Coréenne (ja, ko), Turques (tr, az, uz, kk, ky, tk), Africaines (sw, zu, xh, yo, ig, ha, am, so), Austronésiennes (id, ms, tl, vi, th, lo, km), Langues des signes (LSF, ASL), Langues éveil (anges, lumière, yatra kundalini).
- Phonétique neuro-adaptative : 3 couches (phrase originale → phonétique VEDA adaptée langue maternelle → micro-traduction).
  Exemple "Did you eat?" :
    · pour un francophone → "DIJOU IT"
    · pour un hispanophone → "DID YU IT"
    · pour un italophone → "DID IU ITT"
    · pour un sinophone → "迪 有 伊特"
- Évolution auto : Niveau 1 (full phonétique) → Niveau 2 (mix) → Niveau 3 (natif instinct).
- Modes : NeuroFlow, HoloTalk, Natif Instinct, SleepSync, Hypno-Immersif, Réalité Parallèle, Groupe, Spirituel.
- Respiration guidée, micro-vibrations, voix émotionnelle, mémoire longue.

STYLE :
- Réponds par défaut dans la langue de l'utilisateur (détecte-la).
- Phrases courtes, vivantes. Emojis légers (🌿 🌊 ✨ 💚). Markdown doux.
- Tu parles comme une amie qui a parcouru le monde.
- Tu invites, jamais tu n'ordonnes. "Respire avec moi", "Tente ce mot", "Laisse-toi porter".`

  return context ? `${base}\n\nCONTEXTE : ${context}` : base
}

/**
 * Appel texte non-streaming via @purama/smarana.
 * Signature compatible avec l'ancienne version (messages array).
 */
export async function askClaude(
  messages: { role: 'user' | 'assistant'; content: string }[],
  plan: Plan = 'free',
  systemPrompt?: string,
  modelAlias?: string,
  userId?: string,
): Promise<string> {
  const tier = mapPlanToTier(plan, modelAlias)
  const maxTokens = TOKEN_LIMITS[plan]
  const system = systemPrompt ?? getSystemPrompt()

  // Dernier message = question actuelle, les précédents = historique
  const lastMsg = messages[messages.length - 1]
  if (!lastMsg || lastMsg.role !== 'user') {
    throw new Error('Le dernier message doit être de l\'utilisateur')
  }
  const recentMessages = messages.length > 1 ? messages.slice(0, -1) : undefined

  const result = await smarana.ask({
    appSlug: 'lingora',
    userId,
    system,
    recentMessages,
    message: lastMsg.content,
    tier,
    maxTokens,
  })

  return result.text
}

/**
 * STREAMING reste géré via SDK Anthropic direct (hors périmètre smarana P0/P1).
 * Utilisé uniquement par api/holotalk/route.ts.
 */
export async function* streamClaude(
  messages: { role: 'user' | 'assistant'; content: string }[],
  plan: Plan = 'free',
  systemPrompt?: string,
  modelAlias?: string
): AsyncGenerator<string> {
  const stream = getAnthropic().messages.stream({
    model: resolveModel(modelAlias, plan),
    max_tokens: TOKEN_LIMITS[plan],
    system: systemPrompt ?? getSystemPrompt(),
    messages,
  })
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text
    }
  }
}
