import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { stampString } from '@/lib/opentimestamps'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'

// Runtime Node obligatoire (crypto + lib OTS en CJS).
export const runtime = 'nodejs'
export const maxDuration = 30

const schema = z.object({
  kind: z.enum(['contest_rule', 'engagement', 'fiscal_snapshot']),
  content: z.string().min(1).max(65536),
  reference: z.string().max(200).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

    // Seul le super-admin peut poser des stamps (les stamps pris en charge par l'app
    // sont automatiques via crons — cet endpoint est pour opérations ponctuelles).
    if (user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Action réservée à l\'administrateur VEDA.' }, { status: 403 })
    }

    const body = await req.json()
    const { kind, content, reference } = schema.parse(body)

    const result = await stampString(content)

    // Persist dans timestamped_records (créée par migration P3).
    const service = createServiceClient()
    const { data: record, error: insertErr } = await service
      .from('timestamped_records')
      .insert({
        user_id: user.id,
        kind,
        reference: reference ?? null,
        hash_sha256: result.hashHex,
        proof_base64: result.proofBase64,
        stamped_at: result.stampedAt,
        verified: false,
      })
      .select('id')
      .single()

    if (insertErr) {
      // La proof existe bien dans le réseau OTS ; seul le persist a échoué.
      return NextResponse.json(
        {
          warn: 'Stamp OTS réussi mais persistance DB en erreur. Conserve la proof côté client.',
          hashHex: result.hashHex,
          proofBase64: result.proofBase64,
          stampedAt: result.stampedAt,
        },
        { status: 207 },
      )
    }

    return NextResponse.json({
      id: record?.id,
      hashHex: result.hashHex,
      stampedAt: result.stampedAt,
      message: 'Horodaté sur Bitcoin (attestation dans 1-6h).',
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Payload invalide. kind + content requis.' },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: `Erreur OTS : ${(err as Error).message}` },
      { status: 500 },
    )
  }
}
