import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

const REVIEW_INTERVALS_DAYS = [1, 2, 4, 8, 15, 30, 60, 120] as const

interface VocabBody {
  word?: string
  language?: string
  phonetic_vida?: string
  translation?: string
  correct?: boolean
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const url = new URL(req.url)
    const language = url.searchParams.get('language') ?? undefined

    const service = createServiceClient()
    let query = service
      .from('vocabulary')
      .select('id, word, phonetic_vida, translation, language, familiarity_score, next_review, last_seen, times_correct, times_wrong')
      .eq('user_id', user.id)
      .order('last_seen', { ascending: false, nullsFirst: false })
      .limit(100)

    if (language) query = query.eq('language', language)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ words: data ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body = (await req.json()) as VocabBody
    const word = body.word?.trim().toLowerCase().slice(0, 200)
    const language = body.language ?? 'en'
    const correct = body.correct !== false

    if (!word) return NextResponse.json({ error: 'Mot requis' }, { status: 400 })

    const service = createServiceClient()
    const { data: existing } = await service
      .from('vocabulary')
      .select('id, familiarity_score, times_correct, times_wrong')
      .eq('user_id', user.id)
      .eq('language', language)
      .eq('word', word)
      .maybeSingle()

    const familiarity = existing?.familiarity_score ?? 0
    const newFamiliarity = Math.max(0, Math.min(100, familiarity + (correct ? 12 : -8)))
    const intervalIdx = Math.min(REVIEW_INTERVALS_DAYS.length - 1, Math.floor(newFamiliarity / 12))
    const nextReview = new Date(Date.now() + REVIEW_INTERVALS_DAYS[intervalIdx] * 86400 * 1000).toISOString()

    const payload = {
      user_id: user.id,
      language,
      word,
      phonetic_vida: body.phonetic_vida ?? null,
      translation: body.translation ?? null,
      familiarity_score: newFamiliarity,
      last_seen: new Date().toISOString(),
      next_review: nextReview,
      times_correct: (existing?.times_correct ?? 0) + (correct ? 1 : 0),
      times_wrong: (existing?.times_wrong ?? 0) + (correct ? 0 : 1),
    }

    const { error } = await service
      .from('vocabulary')
      .upsert(payload, { onConflict: 'user_id,language,word' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, familiarity: newFamiliarity, next_review: nextReview })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
