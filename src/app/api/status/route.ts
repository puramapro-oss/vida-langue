import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { LEARNING_LANGUAGES } from '@/lib/constants'

// Route publique : métriques live pour l'homepage (compteurs dynamiques, 0 faux chiffre).
// Cache 60s pour éviter d'exploser la DB en cas de pic de trafic.
export const revalidate = 60

export async function GET() {
  try {
    const supabase = createServiceClient()

    // Head-count only (count='exact') pour éviter le transfert de lignes.
    const [{ count: learners }, { count: sessions }] = await Promise.all([
      supabase.from('profiles').select('id', { head: true, count: 'exact' }),
      supabase.from('sessions').select('id', { head: true, count: 'exact' }),
    ])

    return NextResponse.json({
      status: 'ok',
      app: 'VEDA',
      version: '1.1.0',
      ai: 'NAMA-Polyglotte',
      learners: Math.max(0, learners ?? 0),
      sessions: Math.max(0, sessions ?? 0),
      languages: LEARNING_LANGUAGES.length,
      timestamp: new Date().toISOString(),
    })
  } catch {
    // Jamais 500 sur /api/status — on renvoie 200 avec valeurs neutres.
    return NextResponse.json({
      status: 'degraded',
      app: 'VEDA',
      version: '1.1.0',
      ai: 'NAMA-Polyglotte',
      learners: 0,
      sessions: 0,
      languages: LEARNING_LANGUAGES.length,
      timestamp: new Date().toISOString(),
    })
  }
}
