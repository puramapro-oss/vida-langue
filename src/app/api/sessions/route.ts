import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

const VALID_MODES = ['neuroflow', 'holotalk', 'phonetic', 'sleep', 'hypno', 'reality', 'group', 'spiritual'] as const
type Mode = typeof VALID_MODES[number]

const XP_PER_MODE: Record<Mode, number> = {
  neuroflow: 25,
  holotalk: 15,
  phonetic: 10,
  sleep: 8,
  hypno: 20,
  reality: 18,
  group: 30,
  spiritual: 12,
}

interface SessionBody {
  mode?: string
  language?: string
  duration_seconds?: number
  words_learned?: number
  fluency_score?: number
  flow_state_percent?: number
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body = (await req.json()) as SessionBody
    const mode = body.mode as Mode | undefined
    const language = body.language ?? 'en'
    const duration = Math.max(0, Math.min(7200, Math.floor(body.duration_seconds ?? 0)))
    const wordsLearned = Math.max(0, Math.min(500, Math.floor(body.words_learned ?? 0)))

    if (!mode || !VALID_MODES.includes(mode)) {
      return NextResponse.json({ error: 'Mode invalide' }, { status: 400 })
    }

    const xp = XP_PER_MODE[mode]
    const service = createServiceClient()

    const { data: session, error: sessionErr } = await service
      .from('sessions')
      .insert({
        user_id: user.id,
        language,
        mode,
        duration_seconds: duration,
        xp_earned: xp,
        words_learned: wordsLearned,
        fluency_score: body.fluency_score ?? null,
        flow_state_percent: body.flow_state_percent ?? null,
      })
      .select('id, xp_earned')
      .single()

    if (sessionErr) {
      return NextResponse.json({ error: 'Vida n\'a pas pu graver la session' }, { status: 500 })
    }

    const { data: profile } = await service
      .from('profiles')
      .select('xp, total_xp, vida_energy')
      .eq('id', user.id)
      .single()

    if (profile) {
      await service
        .from('profiles')
        .update({
          xp: (profile.xp ?? 0) + xp,
          total_xp: (profile.total_xp ?? 0) + xp,
          vida_energy: Math.min(100, (profile.vida_energy ?? 100) + 1),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
    }

    const { data: thread } = await service
      .from('life_thread')
      .select('total_actions')
      .eq('user_id', user.id)
      .maybeSingle()

    if (thread) {
      await service
        .from('life_thread')
        .update({
          total_actions: (thread.total_actions ?? 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    }

    return NextResponse.json({
      ok: true,
      session_id: session.id,
      xp_earned: xp,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
