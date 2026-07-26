import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export default async function GoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: 'vida_langue' } },
  )

  // 1. Code de parrainage utilisateur
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, referral_code')
    .eq('referral_code', slug)
    .maybeSingle()

  if (profile) {
    const cookieStore = await cookies()
    cookieStore.set('vida_ref', slug, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    redirect(`/signup?ref=${slug}`)
  }

  // 2. Code influenceur (promo -50% si encore valide)
  const { data: influencer } = await supabase
    .from('influencers')
    .select('id, user_id, promo_code, promo_expires_at')
    .eq('promo_code', slug)
    .maybeSingle()

  if (influencer) {
    const cookieStore = await cookies()
    cookieStore.set('vida_ref', slug, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    cookieStore.set('vida_inf', String(influencer.id), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    const stillValid = influencer.promo_expires_at
      ? new Date(influencer.promo_expires_at).getTime() > Date.now()
      : false
    redirect(`/signup?ref=${slug}${stillValid ? '&promo=1' : ''}`)
  }

  redirect('/')
}
