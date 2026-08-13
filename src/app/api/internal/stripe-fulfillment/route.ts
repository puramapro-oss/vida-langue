import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { VIDA_PRICE_TO_PLAN } from '@/lib/stripe-prices'
import { createServiceClient } from '@/lib/supabase'
import type { Plan, PlanTier } from '@/types'

export const runtime = 'nodejs'

// Disable body parsing — we need raw body for signature verification
export const dynamic = 'force-dynamic'

const PRICE_TO_PLAN = VIDA_PRICE_TO_PLAN

async function updateProfileByCustomer(
  customerId: string,
  data: Record<string, unknown>
) {
  const db = createServiceClient()
  await db
    .from('profiles')
    .update(data)
    .eq('stripe_customer_id', customerId)
}

async function updateProfileById(
  userId: string,
  data: Record<string, unknown>
) {
  const db = createServiceClient()
  await db
    .from('profiles')
    .update(data)
    .eq('id', userId)
}

export async function POST(req: NextRequest) {
  const body = await req.text()

  // 1. Vérifier le secret interne (karma → app)
  const internalSecret = req.headers.get('x-internal-secret')
  if (internalSecret !== process.env.INTERNAL_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // 2. Défense en profondeur : re-vérifier la signature Stripe originale
  const signature = req.headers.get('x-stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing x-stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[stripe-fulfillment] Signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = createServiceClient()

  // Idempotency — process each event exactly once (unique violation = already done).
  const { error: dupErr } = await db
    .from('stripe_events')
    .insert({ event_id: event.id, type: event.type })
  if (dupErr) {
    if (dupErr.code === '23505') return NextResponse.json({ received: true, duplicate: true })
    return NextResponse.json({ error: 'Erreur idempotence' }, { status: 500 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const userId = session.metadata?.user_id
        const plan = session.metadata?.plan as Exclude<Plan, 'free'> | undefined
        const tier = session.metadata?.tier as PlanTier | undefined

        if (userId && plan && tier) {
          await updateProfileById(userId, {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan,
            plan_tier: tier,
          })
        } else if (customerId && plan && tier) {
          await updateProfileByCustomer(customerId, {
            stripe_subscription_id: subscriptionId,
            plan,
            plan_tier: tier,
          })
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price?.id

        if (priceId && PRICE_TO_PLAN[priceId]) {
          const { plan, tier } = PRICE_TO_PLAN[priceId]
          await updateProfileByCustomer(customerId, {
            stripe_subscription_id: subscription.id,
            plan,
            plan_tier: tier,
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await updateProfileByCustomer(customerId, {
          stripe_subscription_id: null,
          plan: 'free',
          plan_tier: 'essential',
        })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const amountPaidCents = invoice.amount_paid ?? 0

        // Get user profile to link payment
        const { data: profile } = await db
          .from('profiles')
          .select('id, referred_by')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile?.id) {
          const invoiceNumber = `FA-${new Date().getFullYear()}-${String(invoice.number ?? Date.now()).slice(-6).padStart(6, '0')}`

          await db.from('payments').insert({
            user_id: profile.id,
            stripe_invoice_id: invoice.id,
            invoice_number: invoiceNumber,
            amount: amountPaidCents / 100,
            currency: invoice.currency?.toUpperCase() ?? 'EUR',
            status: 'paid',
            paid_at: new Date(invoice.created * 1000).toISOString(),
          })

          // Commission parrainage : 50% du PREMIER paiement uniquement
          if (profile.referred_by && amountPaidCents > 0) {
            const { data: existingReferral } = await db
              .from('referrals')
              .select('id, status, referrer_earning_cents')
              .eq('referrer_id', profile.referred_by)
              .eq('referred_id', profile.id)
              .maybeSingle()

            const isFirstPayment = !existingReferral || existingReferral.status !== 'subscribed'

            if (isFirstPayment) {
              const commissionCents = Math.round(amountPaidCents * 0.5)

              if (existingReferral) {
                await db
                  .from('referrals')
                  .update({
                    status: 'subscribed',
                    referrer_earning_cents: (existingReferral.referrer_earning_cents ?? 0) + commissionCents,
                  })
                  .eq('id', existingReferral.id)
              } else {
                await db.from('referrals').insert({
                  referrer_id: profile.referred_by,
                  referred_id: profile.id,
                  referral_code: '',
                  status: 'subscribed',
                  referrer_earning_cents: commissionCents,
                })
              }

              // Crédite le wallet du parrain (en EUR)
              const { data: referrerProfile } = await db
                .from('profiles')
                .select('wallet_balance')
                .eq('id', profile.referred_by)
                .single()

              if (referrerProfile) {
                await db
                  .from('profiles')
                  .update({
                    wallet_balance: Number(referrerProfile.wallet_balance ?? 0) + commissionCents / 100,
                  })
                  .eq('id', profile.referred_by)
              }
            }
          }
        }
        break
      }
    }
  } catch (err) {
    console.error('[stripe/webhook] Event handling error', err)
    return NextResponse.json({ error: 'Erreur traitement' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
