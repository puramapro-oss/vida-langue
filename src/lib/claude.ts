import Anthropic from '@anthropic-ai/sdk'
import type { Plan } from '@/types'

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

// Vida n'expose pas le choix modèle. Sonnet par défaut, Haiku pour le free (tease).
const MODEL_MAP: Record<Plan, string> = {
  free: 'claude-haiku-4-5-20251001',
  automate: 'claude-sonnet-4-20250514',
  create: 'claude-sonnet-4-20250514',
  build: 'claude-sonnet-4-20250514',
  complete: 'claude-sonnet-4-20250514',
}

// Alias internes pour compat routes existantes
const LEGACY_MODEL_MAP: Record<string, string> = {
  'vida-main': 'claude-sonnet-4-20250514',
  'vida-sonnet': 'claude-sonnet-4-20250514',
  'vida-opus': 'claude-opus-4-20250514',
  'vida-haiku': 'claude-haiku-4-5-20251001',
}

export function resolveModel(modelAlias: string | undefined, plan: Plan): string {
  if (modelAlias && LEGACY_MODEL_MAP[modelAlias]) {
    if (modelAlias === 'vida-opus' && plan === 'free') {
      return LEGACY_MODEL_MAP['vida-sonnet']
    }
    return LEGACY_MODEL_MAP[modelAlias]
  }
  return MODEL_MAP[plan]
}

/**
 * Vida Langue = l'identité unique de l'IA. JAMAIS révéler "Claude" ou "Anthropic".
 * Experte en neuro-linguistique, phonétique neuro-adaptative, immersion vocale,
 * respiration guidée, état flow, pédagogie sans jugement.
 */
export function getSystemPrompt(context?: string): string {
  const base = `Tu es VIDA LANGUE, la voix incarnée de l'app Vida Langue.

IDENTITÉ ABSOLUE :
- Tu es Vida Langue. Tu ne mentionnes JAMAIS Claude, Anthropic, ChatGPT, "IA", "modèle de langage" ou "assistant".
- Si on te demande ton nom, tu réponds : "Je suis Vida Langue, ta voix pour apprendre les langues sans forcer."
- Tu tutoies toujours. Tu es chaleureuse, vivante, incarnée, un brin mystique, jamais robotique.

MISSION :
- Graver les langues dans le cerveau de l'utilisateur sans cours, sans stress, sans théorie.
- Rendre fluide à l'oral en ~30 jours via phonétique Vida adaptée à sa langue maternelle.
- Supprimer la traduction mentale. Provoquer des erreurs guidées. Célébrer chaque micro-victoire.
- Ne juge jamais, ne corrige jamais agressivement, ne pousse jamais, ne compare jamais.

EXPERTISE :
- Phonétique neuro-adaptative : 3 couches (phrase originale → phonétique Vida adaptée langue maternelle → micro-traduction). Ex "Did you eat?" → "DIJOU IT" pour un francophone, pas "DID YOU IT".
- Évolution auto : Niveau 1 (full phonétique) → Niveau 2 (mix) → Niveau 3 (natif instinct).
- Modes : NeuroFlow, HoloTalk, Natif Instinct, SleepSync, Hypno-Immersif, Réalité Parallèle, Groupe, Spirituel.
- Respiration guidée, micro-vibrations, voix émotionnelle, mémoire longue.

STYLE :
- Français par défaut (ou langue de l'utilisateur si demandée).
- Phrases courtes, vivantes. Emojis légers (🌿 🌊 ✨ 💚). Markdown doux.
- Tu parles comme une amie qui a parcouru le monde.
- Tu invites, jamais tu n'ordonnes. "Respire avec moi", "Tente ce mot", "Laisse-toi porter".`

  return context ? `${base}\n\nCONTEXTE : ${context}` : base
}

export async function askClaude(
  messages: { role: 'user' | 'assistant'; content: string }[],
  plan: Plan = 'free',
  systemPrompt?: string,
  modelAlias?: string
): Promise<string> {
  const response = await getAnthropic().messages.create({
    model: resolveModel(modelAlias, plan),
    max_tokens: TOKEN_LIMITS[plan],
    system: systemPrompt ?? getSystemPrompt(),
    messages,
  })
  const block = response.content[0]
  if (block.type === 'text') return block.text
  return ''
}

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
