import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { CURRENT_LEGAL_VERSIONS } from '@/lib/legal/versions'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Attribution parrainage server-side (cookies httpOnly inaccessibles côté client)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const cookieStore = await cookies()
        const refCode = cookieStore.get('vida_ref')?.value
        const infId = cookieStore.get('vida_inf')?.value

        if (user) {
          // Preuve d'acceptation CGU/CGV/confidentialité pour les comptes créés via OAuth
          // (pas de passage par le formulaire signup — cf LegalAcceptanceNotice). Idempotent
          // (upsert onConflict user_id,doc_type) : sûr à rappeler à chaque connexion Google.
          await Promise.all(
            (['cgu', 'cgv', 'confidentialite'] as const).map((docType) =>
              supabase.from('legal_acceptances').upsert(
                {
                  user_id: user.id,
                  doc_type: docType,
                  version: CURRENT_LEGAL_VERSIONS[docType],
                  ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
                  user_agent: request.headers.get('user-agent'),
                },
                { onConflict: 'user_id,doc_type' }
              )
            )
          )
        }

        if (user && refCode) {
          const db = createServiceClient()
          const { data: me } = await db
            .from('profiles')
            .select('id, referred_by')
            .eq('id', user.id)
            .single()

          if (me && !me.referred_by) {
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

            if (referrerId && referrerId !== user.id) {
              await db.from('profiles').update({ referred_by: referrerId }).eq('id', user.id)
              await db.from('referrals').insert({
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
            }
          }
          cookieStore.delete('vida_ref')
          cookieStore.delete('vida_inf')
        }
      } catch {
        // Attribution non bloquante — l'utilisateur peut toujours se logger
      }

      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', origin))
}
