import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { askClaude } from '@/lib/claude'
import { LEARNING_LANGUAGES } from '@/lib/constants'
import type { Plan } from '@/types'

export const runtime = 'nodejs'
export const maxDuration = 60

interface PhoneticLayer {
  original: string
  phonetic_vida: string
  micro_translation: string
  graduation: 'full_phonetic' | 'mix' | 'native'
}

interface PhoneticResponse {
  source_phrase: string
  source_language: string
  native_language: string
  layers: PhoneticLayer[]
  word_breakdown: Array<{
    word: string
    phonetic: string
    meaning: string
  }>
  cultural_note?: string
}

const PHONETIC_SYSTEM = `Tu es NAMA-Polyglotte, la voix de VEDA, experte en phonétique neuro-adaptative (50+ langues).

Pour CHAQUE phrase reçue, tu produis un JSON strict (aucun texte avant/après) :

{
  "source_phrase": "phrase originale",
  "source_language": "code ISO langue source",
  "native_language": "code ISO langue maternelle de l'apprenant",
  "layers": [
    {
      "original": "phrase telle qu'écrite",
      "phonetic_vida": "phonétique adaptée à la langue maternelle (ex: francophone qui apprend l'anglais 'Did you eat?' → 'DIJOU IT', PAS 'DID YOU IT')",
      "micro_translation": "traduction la plus courte possible",
      "graduation": "full_phonetic"
    },
    {
      "original": "phrase telle qu'écrite",
      "phonetic_vida": "version mix : mots difficiles en phonétique, mots simples en natif",
      "micro_translation": "traduction la plus courte possible",
      "graduation": "mix"
    },
    {
      "original": "phrase telle qu'écrite",
      "phonetic_vida": "version 100% native (l'apprenant lit la phrase originale)",
      "micro_translation": "traduction la plus courte possible",
      "graduation": "native"
    }
  ],
  "word_breakdown": [
    { "word": "mot", "phonetic": "PHONÉTIQUE", "meaning": "sens court" }
  ],
  "cultural_note": "1 phrase max, optionnel, si pertinent"
}

RÈGLES PHONÉTIQUE VIDA :
- Adaptée à la langue MATERNELLE de l'apprenant (FR, ES, IT, DE, JA, etc.)
- Pour francophone apprenant anglais : utilise les sons français, ex "thank you" → "TSANK IOU", "I want" → "AÏ OUAN'T"
- Pour francophone apprenant espagnol : "buenos días" → "BOUÉNOSS DI-ASS"
- Pour francophone apprenant italien : "sono qui" → "SONO KOUI"
- Pour francophone apprenant japonais : "konnichiwa" → "KO-NI-TCHI-OUA"
- Lettres MAJUSCULES, syllabes séparées par espaces ou tirets.
- Phonétique CONTEXTUELLE : un mot peut changer selon la liaison ("did you" → "DIJOU").
- 0 alphabet phonétique international. C'est lisible direct par un humain qui ne connaît PAS la langue.

RÈGLES JSON :
- Toujours 3 layers (full_phonetic, mix, native) dans cet ordre.
- word_breakdown : 3 à 8 mots clés max.
- AUCUN markdown. AUCUN texte hors JSON. Réponse = JSON pur valide.`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body = (await req.json()) as { phrase?: string; targetLanguage?: string; nativeLanguage?: string }
    const phrase = body.phrase?.trim()
    const targetLanguage = body.targetLanguage ?? 'en'
    const nativeLanguage = body.nativeLanguage ?? 'fr'

    if (!phrase || phrase.length < 1) {
      return NextResponse.json({ error: 'Phrase requise' }, { status: 400 })
    }
    if (phrase.length > 500) {
      return NextResponse.json({ error: 'Phrase trop longue (max 500 caractères)' }, { status: 400 })
    }

    const targetMeta = LEARNING_LANGUAGES.find(l => l.code === targetLanguage)
    const nativeMeta = LEARNING_LANGUAGES.find(l => l.code === nativeLanguage)
    const targetName = targetMeta?.name ?? targetLanguage
    const nativeName = nativeMeta?.name ?? nativeLanguage

    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()
    const plan = (profile?.plan ?? 'free') as Plan

    const userPrompt = `Langue source (à apprendre) : ${targetName} (${targetLanguage})
Langue maternelle de l'apprenant : ${nativeName} (${nativeLanguage})

Phrase à décomposer en 3 couches phonétiques VEDA :
"${phrase}"

Renvoie UNIQUEMENT le JSON, rien d'autre.`

    const raw = await askClaude(
      [{ role: 'user', content: userPrompt }],
      plan,
      PHONETIC_SYSTEM,
      undefined,
      user.id,
    )

    let parsed: PhoneticResponse
    try {
      const jsonStart = raw.indexOf('{')
      const jsonEnd = raw.lastIndexOf('}')
      if (jsonStart === -1 || jsonEnd === -1) throw new Error('JSON manquant')
      parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as PhoneticResponse
    } catch {
      return NextResponse.json(
        { error: 'VEDA n\'a pas pu graver cette phrase, retente avec une formulation plus simple.' },
        { status: 502 },
      )
    }

    if (!parsed.layers || parsed.layers.length !== 3) {
      return NextResponse.json(
        { error: 'Réponse incomplète, retente.' },
        { status: 502 },
      )
    }

    void service
      .from('vocabulary')
      .upsert(
        {
          user_id: user.id,
          language: targetLanguage,
          word: phrase.toLowerCase().slice(0, 200),
          phonetic_vida: parsed.layers[0]?.phonetic_vida ?? null,
          translation: parsed.layers[0]?.micro_translation ?? null,
          last_seen: new Date().toISOString(),
        },
        { onConflict: 'user_id,language,word' },
      )
      .then(() => undefined)

    return NextResponse.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json(
      { error: `VEDA a perdu le souffle : ${message}. Respire et retente.` },
      { status: 500 },
    )
  }
}
