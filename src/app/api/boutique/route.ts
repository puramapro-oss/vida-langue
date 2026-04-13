import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('point_shop_items')
      .select('*')
      .eq('active', true)
      .order('cost_points', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Impossible de charger la boutique.' }, { status: 500 })
    }

    return NextResponse.json({ items: data })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifie.' }, { status: 401 })
    }

    const body = (await req.json()) as { item_id?: string }
    if (!body.item_id) {
      return NextResponse.json({ error: 'item_id requis.' }, { status: 400 })
    }

    const service = createServiceClient()

    // Get item
    const { data: item, error: itemErr } = await service
      .from('point_shop_items')
      .select('*')
      .eq('id', body.item_id)
      .eq('active', true)
      .single()

    if (itemErr || !item) {
      return NextResponse.json({ error: 'Article introuvable.' }, { status: 404 })
    }

    // Get user points
    const { data: profile } = await service
      .from('profiles')
      .select('purama_points')
      .eq('id', user.id)
      .single()

    const currentPoints = (profile as { purama_points: number } | null)?.purama_points ?? 0
    const cost = (item as { cost_points: number }).cost_points

    if (currentPoints < cost) {
      return NextResponse.json(
        { error: `Points insuffisants. Tu as ${currentPoints} points, il en faut ${cost}.` },
        { status: 400 }
      )
    }

    // Deduct points
    await service
      .from('profiles')
      .update({ purama_points: currentPoints - cost })
      .eq('id', user.id)

    // Record transaction
    await service
      .from('point_transactions')
      .insert({
        user_id: user.id,
        amount: -cost,
        type: 'spend',
        source: 'boutique',
        description: (item as { name: string }).name,
      })

    // Record purchase
    await service
      .from('point_purchases')
      .insert({
        user_id: user.id,
        item_id: body.item_id,
        points_spent: cost,
      })

    return NextResponse.json({
      success: true,
      remaining_points: currentPoints - cost,
      item_name: (item as { name: string }).name,
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
