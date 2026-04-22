import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { verifyProof } from '@/lib/opentimestamps'
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 30

const schema = z.object({
  recordId: z.string().uuid().optional(),
  content: z.string().min(1).max(65536).optional(),
  proofBase64: z.string().min(1).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { recordId, content, proofBase64 } = schema.parse(body)

    let bodyContent = content
    let proof = proofBase64

    if (recordId) {
      const service = createServiceClient()
      const { data: record } = await service
        .from('timestamped_records')
        .select('hash_sha256, proof_base64')
        .eq('id', recordId)
        .single()
      if (!record) {
        return NextResponse.json({ error: 'Record OTS introuvable.' }, { status: 404 })
      }
      proof = record.proof_base64
      // On vérifie via hash — l'appelant doit aussi fournir le contenu original.
      if (!content) {
        return NextResponse.json(
          { error: "Contenu original requis pour vérification (éviter reveal base DB)." },
          { status: 400 },
        )
      }
      bodyContent = content
    }

    if (!bodyContent || !proof) {
      return NextResponse.json(
        { error: 'content + proofBase64 (ou recordId + content) requis.' },
        { status: 400 },
      )
    }

    const buf = Buffer.from(bodyContent, 'utf-8')
    const result = await verifyProof(buf, proof)

    // Met à jour le flag verified si on avait un recordId.
    if (recordId && result.verified && result.bitcoinAttestation) {
      const service = createServiceClient()
      await service
        .from('timestamped_records')
        .update({
          verified: true,
          btc_block_height: result.bitcoinAttestation.blockHeight,
          btc_block_time: result.bitcoinAttestation.blockTime,
        })
        .eq('id', recordId)
    }

    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Payload invalide.' }, { status: 400 })
    }
    return NextResponse.json(
      { error: `Vérification OTS impossible : ${(err as Error).message}` },
      { status: 500 },
    )
  }
}
