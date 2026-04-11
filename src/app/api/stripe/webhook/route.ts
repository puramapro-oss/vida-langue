import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import type { Plan, PlanTier } from '@/types'

export const runtime = 'nodejs'

// Disable body parsing — we need raw body for signature verification
export const dynamic = 'force-dynamic'

// Map Stripe price IDs back to plan/tier
const PRICE_TO_PLAN: Record<string, { plan: Exclude<Plan, 'free'>; tier: PlanTier }> = {
  'price_1TJ1Qd4Y1unNvKtXg0D4EwNl': { plan: 'automate', tier: 'essential' },
  'price_1TJ1Qd4Y1unNvKtXxPBnMHH6': { plan: 'automate', tier: 'pro' },
  'price_1TJ1Qe4Y1unNvKtXbW6i1dbb': { plan: 'automate', tier: 'max' },
  'price_1TJ1Qf4Y1unNvKtXJ4AermBW': { plan: 'create', tier: 'essential' },
  'price_1TJ1Qg4Y1unNvKtXGDtTEGVI': { plan: 'create', tier: 'pro' },
  'price_1TJ1Qh4Y1unNvKtX9nRkx5iU': { plan: 'create', tier: 'max' },
  'price_1TJ1Qi4Y1unNvKtX5A9jRzzz': { plan: 'build', tier: 'essential' },
  'price_1TJ1Qj4Y1unNvKtXFXeoz1PH': { plan: 'build', tier: 'pro' },
  'price_1TJ1Qk4Y1unNvKtX4cq6L73s': { plan: 'build', tier: 'max' },
  'price_1TJ1Ql4Y1unNvKtXe0NQ6Mws': { plan: 'complete', tier: 'essential' },
  'price_1TJ1Qm4Y1unNvKtXVAlGNlmC': { plan: 'complete', tier: 'pro' },
  'price_1TJ1Qn4Y1unNvKtXXu1OPZNx': { plan: 'complete', tier: 'max' },
}

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
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = createServiceClient()

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

        // Get user profile to link payment
        const { data: profile } = await db
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile?.id) {
          const invoiceNumber = `FA-${new Date().getFullYear()}-${String(invoice.number ?? Date.now()).slice(-6).padStart(6, '0')}`

          await db.from('payments').insert({
            user_id: profile.id,
            stripe_invoice_id: invoice.id,
            invoice_number: invoiceNumber,
            amount: (invoice.amount_paid ?? 0) / 100,
            currency: invoice.currency?.toUpperCase() ?? 'EUR',
            status: 'paid',
            paid_at: new Date(invoice.created * 1000).toISOString(),
          })
        }
        break
      }
    }
  } catch (err) {
    console.error('[stripe/webhook] Event handling error', err)
    // Return 200 to prevent Stripe from retrying non-recoverable errors
  }

  return NextResponse.json({ received: true })
}
