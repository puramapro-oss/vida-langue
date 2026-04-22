import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 15

const schema = z.object({
  reason: z.string().max(40).optional(),
})

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY manquant')
  return new Stripe(key)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { reason } = schema.parse(body)

    const service = createServiceClient()
    const { data: sub } = await service
      .from('subscriptions')
      .select('id, stripe_subscription_id, status, started_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!sub) return NextResponse.json({ error: 'Aucun abonnement actif.' }, { status: 404 })
    if (sub.status === 'cancelled') {
      return NextResponse.json({ ok: true, note: 'Déjà annulé.' })
    }

    const stripe = getStripe()
    if (sub.stripe_subscription_id) {
      // Schedule cancel at period end (respect des CGV : user garde accès jusqu'à fin période payée).
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: true,
        metadata: { cancel_reason: reason ?? 'unspecified' },
      })
    }

    await service
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        cancellation_reason: reason ?? null,
        cancellation_requested_at: new Date().toISOString(),
      })
      .eq('id', sub.id)

    // Check si prime wallet non débloquée → la marquer récupérée
    const { data: prime } = await service
      .from('welcome_primes')
      .select('id, granted_at, unlocked_at, amount_cents')
      .eq('user_id', user.id)
      .maybeSingle()

    if (prime && prime.granted_at && !prime.unlocked_at) {
      const grantedAt = new Date(prime.granted_at).getTime()
      const daysElapsed = (Date.now() - grantedAt) / (24 * 60 * 60 * 1000)
      if (daysElapsed < 30) {
        await service
          .from('welcome_primes')
          .update({
            cancelled_at: new Date().toISOString(),
            cancelled_reason: 'subscription_cancelled_before_30d',
          })
          .eq('id', prime.id)
        // Débite le wallet du montant de la prime (si elle avait été pré-créditée).
        // RPC optionnelle : on absorbe toute erreur pour ne pas bloquer l'annulation.
        try {
          await service.rpc('wallet_deduct_prime', {
            p_user: user.id,
            p_amount_cents: prime.amount_cents,
          })
        } catch {
          // Fail silently — la fonction RPC peut ne pas être présente sur anciens envs.
        }
      }
    }

    return NextResponse.json({ ok: true, cancel_at_period_end: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Payload invalide.' }, { status: 400 })
    }
    return NextResponse.json(
      { error: `Annulation impossible : ${(err as Error).message}` },
      { status: 500 },
    )
  }
}
