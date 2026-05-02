import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase'

/**
 * Newsletter subscribe — public endpoint (idempotent).
 * Insert dans vida_langue.newsletter_subscribers, ON CONFLICT DO NOTHING.
 */

const Schema = z.object({
  email: z.string().email('Email invalide').max(254),
})

export async function POST(request: NextRequest) {
  let body: z.infer<typeof Schema>
  try {
    const raw = await request.json()
    body = Schema.parse(raw)
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message ?? 'Email invalide' : 'Email invalide'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { email: body.email.toLowerCase().trim() },
        { onConflict: 'email', ignoreDuplicates: true }
      )

    if (error) {
      // Log côté serveur seulement
      return NextResponse.json(
        { error: 'Inscription temporairement indisponible. Réessaie.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Tu es inscrit à la newsletter VEDA 🌱' },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Inscription temporairement indisponible. Réessaie.' },
      { status: 500 }
    )
  }
}
