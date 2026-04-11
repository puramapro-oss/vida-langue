import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { PLAN_LIMITS, SUPER_ADMIN_EMAIL } from '@/lib/constants'
import type { Plan } from '@/types'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('plan, email')
      .eq('id', user.id)
      .single()

    const plan = (profile?.plan ?? 'free') as Plan
    const isSuperAdmin = profile?.email === SUPER_ADMIN_EMAIL

    const today = new Date().toISOString().split('T')[0]
    const { data: usage } = await service
      .from('usage_daily')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()

    let limit: number
    if (isSuperAdmin) {
      limit = -1
    } else {
      limit = PLAN_LIMITS[plan]?.daily_questions ?? 10
    }

    return NextResponse.json({
      plan,
      limit,
      used: usage?.chat_count ?? 0,
      remaining: limit === -1 ? -1 : Math.max(0, limit - (usage?.chat_count ?? 0)),
      isSuperAdmin,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
