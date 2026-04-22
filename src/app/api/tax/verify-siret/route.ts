import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { verifySiret } from '@/lib/insee'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const maxDuration = 15

const schema = z.object({
  siret: z.string().min(9).max(20),
})

export async function POST(req: NextRequest) {
  try {
    // Auth souple : accessible signup/onboarding /financer public,
    // mais on log l'user si connecté pour suivi.
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const { siret } = schema.parse(body)

    const result = await verifySiret(siret)

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 200 })
    }

    return NextResponse.json({
      ok: true,
      displayName: result.displayName,
      address: result.address,
      isActive: result.isActive,
      isAssociation: result.isAssociation,
      siret: result.etablissement.siret,
      siren: result.etablissement.siren,
      dateCreation: result.etablissement.dateCreationEtablissement,
      // meta pour audit
      checkedBy: user?.id ?? null,
      checkedAt: new Date().toISOString(),
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'SIRET invalide (format).' },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { ok: false, error: `Erreur vérification : ${(err as Error).message}` },
      { status: 500 },
    )
  }
}
