import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { streamClaude, getSystemPrompt } from '@/lib/claude'
import { PLAN_LIMITS, SUPER_ADMIN_EMAIL } from '@/lib/constants'
import type { Plan } from '@/types'

export const runtime = 'nodejs'
export const maxDuration = 120

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = (await req.json()) as { messages: ChatMessage[]; conversationId?: string; model?: string }
    const { messages, conversationId, model: requestedModel } = body
    const akashaModel = requestedModel && ['akasha-sonnet', 'akasha-opus', 'akasha-haiku'].includes(requestedModel)
      ? requestedModel
      : 'akasha-sonnet'
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 })
    }

    const service = createServiceClient()

    // Get profile for plan
    const { data: profile } = await service
      .from('profiles')
      .select('plan, daily_questions, email')
      .eq('id', user.id)
      .single()

    const plan = (profile?.plan ?? 'free') as Plan
    const isSuperAdmin = profile?.email === SUPER_ADMIN_EMAIL

    // Quota check (skip for super admin)
    if (!isSuperAdmin) {
      const today = new Date().toISOString().split('T')[0]
      const { data: usage } = await service
        .from('usage_daily')
        .select('chat_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()

      const used = usage?.chat_count ?? 0
      const planLimits = PLAN_LIMITS[plan]
      const limit: number = planLimits?.daily_questions ?? 10

      if (limit !== -1 && used >= limit) {
        return NextResponse.json({ error: 'Quota exceeded', limit, used }, { status: 429 })
      }
    }

    // Create or use existing conversation
    let currentConvId = conversationId
    if (!currentConvId) {
      const firstMsg = messages.find(m => m.role === 'user')?.content ?? 'Nouvelle conversation'
      const { data: newConv } = await service
        .from('conversations')
        .insert({
          user_id: user.id,
          title: firstMsg.slice(0, 60),
          model: akashaModel,
        })
        .select('id')
        .single()
      currentConvId = newConv?.id ?? undefined
    }

    // Save user message
    const lastUserMsg = messages[messages.length - 1]
    if (lastUserMsg?.role === 'user' && currentConvId) {
      await service.from('messages').insert({
        conversation_id: currentConvId,
        role: 'user',
        content: lastUserMsg.content,
      })
    }

    // Increment usage
    if (!isSuperAdmin) {
      const today = new Date().toISOString().split('T')[0]
      const { data: currentUsage } = await service
        .from('usage_daily')
        .select('chat_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()

      if (currentUsage) {
        await service
          .from('usage_daily')
          .update({ chat_count: (currentUsage.chat_count ?? 0) + 1 })
          .eq('user_id', user.id)
          .eq('date', today)
      } else {
        await service
          .from('usage_daily')
          .insert({ user_id: user.id, date: today, chat_count: 1 })
      }
    }

    // Stream response
    const encoder = new TextEncoder()
    let fullResponse = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (currentConvId) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ conversationId: currentConvId })}\n\n`))
          }
          for await (const chunk of streamClaude(messages, plan, getSystemPrompt(), akashaModel)) {
            fullResponse += chunk
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
          }
          // Save assistant message
          if (currentConvId && fullResponse) {
            await service.from('messages').insert({
              conversation_id: currentConvId,
              role: 'assistant',
              content: fullResponse,
              model: akashaModel,
            })
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Stream error'
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
