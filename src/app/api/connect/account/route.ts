import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 30

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY manquant')
  return new Stripe(key)
}

// POST /api/connect/account
// Crée un compte Stripe Connect Express pour le user connecté (si pas déjà créé).
// Gated : user doit avoir wallet ≥ 5€ OU prime débloquée pour déclencher onboarding.
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

    const service = createServiceClient()

    // Gate : vérifier wallet ≥ 5€ OU prime débloquée
    const { data: profile } = await service
      .from('profiles')
      .select('wallet_balance, email, full_name')
      .eq('id', user.id)
      .maybeSingle()

    const { data: prime } = await service
      .from('welcome_primes')
      .select('unlocked_at')
      .eq('user_id', user.id)
      .maybeSingle()

    const walletEur = Number(profile?.wallet_balance ?? 0)
    const primeUnlocked = Boolean(prime?.unlocked_at)

    if (walletEur < 5 && !primeUnlocked) {
      return NextResponse.json(
        {
          error: 'Onboarding Stripe Connect disponible à partir de 5€ dans le wallet OU prime débloquée (J+30).',
          walletEur,
          primeUnlocked,
        },
        { status: 403 },
      )
    }

    // Check si déjà créé
    const { data: existing } = await service
      .from('stripe_connect_accounts')
      .select('stripe_account_id, kyc_status, payouts_enabled, transfers_enabled')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        stripeAccountId: existing.stripe_account_id,
        kycStatus: existing.kyc_status,
        payoutsEnabled: existing.payouts_enabled,
        transfersEnabled: existing.transfers_enabled,
        created: false,
      })
    }

    const stripe = getStripe()
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email: profile?.email ?? user.email ?? undefined,
      capabilities: {
        transfers: { requested: true },
      },
      metadata: { vida_user_id: user.id },
    })

    await service.from('stripe_connect_accounts').insert({
      user_id: user.id,
      stripe_account_id: account.id,
      kyc_status: 'pending',
      capabilities: (account.capabilities as unknown) ?? {},
      country: 'FR',
    })

    return NextResponse.json({
      stripeAccountId: account.id,
      kycStatus: 'pending',
      payoutsEnabled: false,
      transfersEnabled: false,
      created: true,
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Création compte Connect impossible : ${(err as Error).message}` },
      { status: 500 },
    )
  }
}
