import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: 'akasha_ai' } }
)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Cle API manquante. Utilise Authorization: Bearer <API_KEY>' }, { status: 401 })
    }

    const apiKey = authHeader.slice(7)
    const keyPrefix = apiKey.slice(0, 8)

    // Validate API key
    const { data: keyRecord } = await supabase
      .from('api_keys')
      .select('id, user_id, is_active')
      .eq('key_prefix', keyPrefix)
      .eq('is_active', true)
      .single()

    if (!keyRecord) {
      return NextResponse.json({ error: 'Cle API invalide ou desactivee' }, { status: 401 })
    }

    const body = await request.json()
    const { message, model = 'claude-sonnet-4-20250514', max_tokens = 4096 } = body

    if (!message) {
      return NextResponse.json({ error: 'Le champ "message" est requis' }, { status: 400 })
    }

    const start = Date.now()
    const response = await anthropic.messages.create({
      model,
      max_tokens,
      messages: [{ role: 'user', content: message }],
    })

    const latency = Date.now() - start

    // Log API usage
    await supabase.from('api_logs').insert({
      api_key_id: keyRecord.id,
      endpoint: '/v1/chat',
      status: 200,
      latency_ms: latency,
    })

    // Increment API usage
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('usage_daily').upsert(
      { user_id: keyRecord.user_id, date: today, api_count: 1 },
      { onConflict: 'user_id,date' }
    )

    const textContent = response.content.find(c => c.type === 'text')

    return NextResponse.json({
      id: response.id,
      model: response.model,
      content: textContent?.text ?? '',
      usage: response.usage,
      latency_ms: latency,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
