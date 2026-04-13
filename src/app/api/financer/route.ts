import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

interface AideRow {
  id: string
  nom: string
  type_aide: string
  profil_eligible: string[]
  situation_eligible: string[]
  montant_max: number | null
  url_officielle: string | null
  description: string | null
  region: string | null
  handicap_only: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      profil?: string
      situation?: string
      region?: string
      handicap?: boolean
    }

    const { profil, situation, region, handicap } = body

    if (!profil || !situation) {
      return NextResponse.json(
        { error: 'Profil et situation sont requis.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    let query = supabase
      .from('aides')
      .select('*')
      .eq('active', true)

    // Filter handicap: if user is not handicapped, exclude handicap-only aids
    if (!handicap) {
      query = query.eq('handicap_only', false)
    }

    // Filter region: include national (null) + matching region
    if (region) {
      query = query.or(`region.is.null,region.eq.${region}`)
    }

    const { data, error } = await query.order('montant_max', { ascending: false, nullsFirst: false })

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la recherche des aides.' }, { status: 500 })
    }

    // Filter by profil + situation eligibility (array contains)
    const aides = (data as AideRow[]).filter((aide) => {
      const profilMatch =
        aide.profil_eligible.length === 0 || aide.profil_eligible.includes(profil)
      const situationMatch =
        aide.situation_eligible.length === 0 || aide.situation_eligible.includes(situation)
      return profilMatch && situationMatch
    })

    // Calculate cumul
    const cumul = aides.reduce((sum, aide) => sum + (aide.montant_max ?? 0), 0)

    return NextResponse.json({ aides, cumul, total: aides.length })
  } catch {
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez reessayer.' },
      { status: 500 }
    )
  }
}
