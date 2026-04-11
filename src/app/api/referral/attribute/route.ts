import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

// POST /api/referral/attribute
// Lit les cookies vida_ref / vida_inf posés par /go/[slug] et lie l'utilisateur courant
// au parrain (profiles.referred_by + row referrals). Idempotent : ne réécrit pas si déjà lié.
export async function POST() {
  const auth = await createServerSupabaseClient()
  const { data: { user } } = await auth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const cookieStore = await cookies()
  const refCode = cookieStore.get('vida_ref')?.value
  const infId = cookieStore.get('vida_inf')?.value

  if (!refCode) {
    return NextResponse.json({ ok: true, attributed: false })
  }

  const db = createServiceClient()

  // Profil courant — on ne réattribue jamais
  const { data: me } = await db
    .from('profiles')
    .select('id, referred_by')
    .eq('id', user.id)
    .single()

  if (!me) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
  }
  if (me.referred_by) {
    return NextResponse.json({ ok: true, attributed: false, reason: 'already_attributed' })
  }

  // Cherche le parrain via referral_code (utilisateur) puis fallback influenceur
  let referrerId: string | null = null

  const { data: referrer } = await db
    .from('profiles')
    .select('id')
    .eq('referral_code', refCode)
    .maybeSingle()

  if (referrer) {
    referrerId = referrer.id
  } else {
    const { data: inf } = await db
      .from('influencers')
      .select('user_id')
      .eq('promo_code', refCode)
      .maybeSingle()
    if (inf?.user_id) referrerId = inf.user_id
  }

  if (!referrerId || referrerId === user.id) {
    cookieStore.delete('vida_ref')
    cookieStore.delete('vida_inf')
    return NextResponse.json({ ok: true, attributed: false, reason: 'no_referrer' })
  }

  await db
    .from('profiles')
    .update({ referred_by: referrerId })
    .eq('id', user.id)

  await db
    .from('referrals')
    .insert({
      referrer_id: referrerId,
      referred_id: user.id,
      referral_code: refCode,
      status: 'pending',
    })

  if (infId) {
    await db
      .from('profiles')
      .update({ metadata: { influencer_id: infId, attributed_at: new Date().toISOString() } })
      .eq('id', user.id)
  }

  cookieStore.delete('vida_ref')
  cookieStore.delete('vida_inf')

  return NextResponse.json({ ok: true, attributed: true })
}
