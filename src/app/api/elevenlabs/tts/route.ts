import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * ElevenLabs TTS proxy — Multilingual v2 (50+ langues).
 *
 * Sécurité :
 * - Auth Supabase obligatoire (sinon 401)
 * - Zod validation (text 1-2000 chars)
 * - Rate limit memory-based 100 req/h/user (Upstash optionnel)
 * - Timeout 30s sur fetch ElevenLabs
 *
 * Cache : audio identique = même résultat → max-age=86400.
 */

// Default voice : Sarah (multilingual v2 EXAVITQu4vr4xnSDxMaL)
const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'

const Schema = z.object({
  text: z.string().min(1, 'Texte vide').max(2000, 'Texte trop long (2000 max)'),
  language: z
    .string()
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Code langue invalide')
    .optional(),
  voice_id: z.string().min(8).max(50).optional(),
})

// In-memory rate limit (best-effort sans Redis)
const RATE_WINDOW_MS = 60 * 60 * 1000
const RATE_MAX = 100
const rateBucket = new Map<string, { count: number; resetAt: number }>()

function rateLimitOk(userId: string): boolean {
  const now = Date.now()
  const entry = rateBucket.get(userId)
  if (!entry || entry.resetAt < now) {
    rateBucket.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_MAX) return false
  entry.count += 1
  return true
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Voix VEDA non configurée. Réessaie dans un instant.' },
      { status: 503 }
    )
  }

  // 1. Auth obligatoire
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Connecte-toi pour activer la voix immersive.' },
      { status: 401 }
    )
  }

  // 2. Rate limit
  if (!rateLimitOk(user.id)) {
    return NextResponse.json(
      { error: 'Trop de requêtes vocales. Pause d\'une minute, puis retente.' },
      { status: 429 }
    )
  }

  // 3. Validation Zod
  let body: z.infer<typeof Schema>
  try {
    const raw = await request.json()
    body = Schema.parse(raw)
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message ?? 'Paramètres invalides' : 'Paramètres invalides'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const voiceId = body.voice_id ?? DEFAULT_VOICE_ID

  // 4. Appel ElevenLabs avec timeout
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: body.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.15,
            use_speaker_boost: true,
          },
        }),
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)

    if (!ttsRes.ok || !ttsRes.body) {
      const errText = await ttsRes.text().catch(() => '')
      return NextResponse.json(
        {
          error:
            ttsRes.status === 401
              ? 'Voix VEDA temporairement indisponible.'
              : 'VEDA n\'a pas pu produire la voix. Réessaie.',
          detail: errText.slice(0, 200),
        },
        { status: 502 }
      )
    }

    return new NextResponse(ttsRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    })
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'AbortError'
    return NextResponse.json(
      {
        error: isAbort
          ? 'Voix trop longue à générer. Raccourcis ta phrase.'
          : 'Connexion à la voix perdue. Retente dans un instant.',
      },
      { status: isAbort ? 504 : 500 }
    )
  }
}
