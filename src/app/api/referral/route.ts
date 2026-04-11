import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: 'vida_langue' } },
)

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Connecte-toi pour voir tes parrainages.' }, { status: 401 })
  }

  const [{ data: referrals }, { data: profile }] = await Promise.all([
    supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', userId)
      .single(),
  ])

  const list = referrals ?? []
  const subscribed = list.filter((r) => r.status === 'subscribed').length

  let tier = 'graine'
  if (subscribed >= 100) tier = 'legende'
  else if (subscribed >= 75) tier = 'diamant'
  else if (subscribed >= 50) tier = 'platine'
  else if (subscribed >= 25) tier = 'or'
  else if (subscribed >= 10) tier = 'argent'
  else if (subscribed >= 5) tier = 'bronze'

  const totalEarningsCents = list.reduce(
    (sum, r) => sum + (Number(r.referrer_earning_cents) || 0),
    0,
  )

  return NextResponse.json({
    referral_code: profile?.referral_code,
    total_referrals: list.length,
    subscribed_count: subscribed,
    tier,
    referrals: list,
    total_earnings_cents: totalEarningsCents,
    total_earnings_eur: totalEarningsCents / 100,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { referrer_code?: string; referred_id?: string }
    const referrer_code = body.referrer_code
    const referred_id = body.referred_id

    if (!referrer_code || !referred_id) {
      return NextResponse.json({ error: 'Code de parrainage ou utilisateur manquant.' }, { status: 400 })
    }

    const { data: referrer } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', referrer_code)
      .single()

    if (!referrer) {
      return NextResponse.json({ error: 'Code de parrainage introuvable.' }, { status: 404 })
    }

    if (referrer.id === referred_id) {
      return NextResponse.json({ error: 'Tu ne peux pas te parrainer toi-même.' }, { status: 400 })
    }

    const { error } = await supabase.from('referrals').insert({
      referrer_id: referrer.id,
      referred_id,
      referral_code: referrer_code,
      status: 'pending',
      referrer_earning_cents: 0,
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ce parrainage existe déjà.' }, { status: 409 })
      }
      console.error('[api/referral] insert error', error)
      return NextResponse.json({ error: 'Impossible d\'enregistrer le parrainage. Réessaie.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/referral] POST', err)
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }
}
