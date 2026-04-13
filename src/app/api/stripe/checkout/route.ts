import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import {
  STRIPE_PRICE_IDS,
  VIDA_PRICE_MONTHLY,
  VIDA_PRICE_YEARLY,
  VIDA_PRICE_HALF_LIFETIME,
} from '@/lib/stripe-prices'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { TRIAL_DAYS, APP_DOMAIN } from '@/lib/constants'
import type { Plan, PlanTier } from '@/types'

const CheckoutSchema = z.object({
  plan: z.enum(['monthly', 'yearly', 'half_lifetime', 'automate', 'create', 'build', 'complete']),
  tier: z.enum(['essential', 'pro', 'max']).optional(),
})

const VIDA_PRICE_BY_KEY: Record<string, { priceId: string; legacyPlan: Exclude<Plan, 'free'>; trial: boolean }> = {
  monthly: { priceId: VIDA_PRICE_MONTHLY, legacyPlan: 'create', trial: true },
  yearly: { priceId: VIDA_PRICE_YEARLY, legacyPlan: 'build', trial: true },
  half_lifetime: { priceId: VIDA_PRICE_HALF_LIFETIME, legacyPlan: 'complete', trial: false },
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Connecte-toi pour souscrire à Vida Langue.' }, { status: 401 })
    }

    const body = await req.json() as unknown
    const parsed = CheckoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Requête invalide. Réessaie.' }, { status: 400 })
    }

    const { plan, tier } = parsed.data

    let priceId: string
    let legacyPlan: Exclude<Plan, 'free'>
    let withTrial = false

    if (plan in VIDA_PRICE_BY_KEY) {
      const cfg = VIDA_PRICE_BY_KEY[plan]
      priceId = cfg.priceId
      legacyPlan = cfg.legacyPlan
      withTrial = cfg.trial
    } else {
      // Legacy mapping (compat older routes)
      legacyPlan = plan as Exclude<Plan, 'free'>
      priceId = STRIPE_PRICE_IDS[legacyPlan][(tier ?? 'essential') as PlanTier]
      withTrial = legacyPlan === 'create' || legacyPlan === 'build' || legacyPlan === 'automate'
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, display_name')
      .eq('id', user.id)
      .single()

    const serviceClient = createServiceClient()
    let customerId = profile?.stripe_customer_id as string | null

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? profile?.email ?? '',
        name: profile?.display_name ?? undefined,
        metadata: { user_id: user.id, app: 'vida-langue' },
      })
      customerId = customer.id

      await serviceClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const origin = req.headers.get('origin') ?? `https://${APP_DOMAIN}`

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card', 'paypal', 'link'],
      allow_promotion_codes: true,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: withTrial
        ? { trial_period_days: TRIAL_DAYS, metadata: { user_id: user.id, plan: legacyPlan } }
        : { metadata: { user_id: user.id, plan: legacyPlan } },
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      metadata: { user_id: user.id, plan: legacyPlan, tier: tier ?? 'essential' },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout]', err)
    return NextResponse.json({ error: 'Impossible de créer la session de paiement. Réessaie ou contacte le support.' }, { status: 500 })
  }
}
