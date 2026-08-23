import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 15

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY manquant')
  return new Stripe(key)
}

// POST /api/connect/account-session
// Crée une AccountSession pour les Embedded Components Stripe Connect.
// V4.1 : PAS besoin de STRIPE_CONNECT_CLIENT_ID (ca_...) — uniquement SECRET_KEY serveur.
// Le client_secret retourné alimente le composant <ConnectAccountOnboarding /> côté client.
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

    const service = createServiceClient()
    const { data: account } = await service
      .from('stripe_connect_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!account) {
      return NextResponse.json(
        { error: 'Aucun compte Connect. Crée-le d\'abord via POST /api/connect/account.' },
        { status: 404 },
      )
    }

    const stripe = getStripe()
    const session = await stripe.accountSessions.create({
      account: account.stripe_account_id,
      components: {
        account_onboarding: { enabled: true },
        account_management: { enabled: true },
        notification_banner: { enabled: true },
        payouts: { enabled: true },
        balances: { enabled: true },
      },
    })

    return NextResponse.json({
      clientSecret: session.client_secret,
      stripeAccountId: account.stripe_account_id,
      expiresAt: session.expires_at,
    })
  } catch (err) {
    return NextResponse.json(
      { error: `AccountSession impossible : ${(err as Error).message}` },
      { status: 500 },
    )
  }
}
