import { NextResponse, type NextRequest } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { stampBuffer } from '@/lib/opentimestamps'
import { COMPANY_INFO } from '@/lib/constants'

export const runtime = 'nodejs'
export const maxDuration = 60

interface BreakdownRow {
  source: string
  amountCents: number
  count: number
}

async function collectYearBreakdown(
  service: ReturnType<typeof createServiceClient>,
  userId: string,
  year: number,
): Promise<BreakdownRow[]> {
  const start = `${year}-01-01`
  const end = `${year + 1}-01-01`

  const { data: tx } = await service
    .from('wallet_transactions')
    .select('amount, type, source')
    .eq('user_id', userId)
    .gte('created_at', start)
    .lt('created_at', end)

  const byType = new Map<string, { total: number; count: number }>()
  for (const row of tx ?? []) {
    const amt = Number(row.amount ?? 0)
    if (amt <= 0) continue
    const key = (row.source as string) ?? (row.type as string) ?? 'autre'
    const cur = byType.get(key) ?? { total: 0, count: 0 }
    cur.total += Math.round(amt * 100)
    cur.count += 1
    byType.set(key, cur)
  }

  return Array.from(byType.entries()).map(([source, v]) => ({
    source,
    amountCents: v.total,
    count: v.count,
  }))
}

async function buildPdf(params: {
  userEmail: string
  userName: string
  year: number
  totalCents: number
  breakdown: BreakdownRow[]
  siret?: string | null
  siretName?: string | null
  stampHash?: string | null
}): Promise<Buffer> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595.28, 841.89]) // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const green = rgb(16 / 255, 185 / 255, 129 / 255)
  const dark = rgb(0.1, 0.1, 0.12)
  const grey = rgb(0.45, 0.45, 0.5)

  let y = 800

  page.drawText('Récapitulatif fiscal VEDA', { x: 48, y, size: 22, font: fontBold, color: dark })
  y -= 8
  page.drawText(`Année ${params.year}`, { x: 48, y: y - 14, size: 12, font, color: green })
  y -= 40

  page.drawText('Bénéficiaire', { x: 48, y, size: 9, font: fontBold, color: grey })
  y -= 14
  page.drawText(params.userName || 'Utilisateur VEDA', { x: 48, y, size: 11, font, color: dark })
  y -= 13
  page.drawText(params.userEmail, { x: 48, y, size: 10, font, color: grey })
  if (params.siret) {
    y -= 13
    page.drawText(`SIRET : ${params.siret} · ${params.siretName ?? ''}`, { x: 48, y, size: 9, font, color: grey })
  }
  y -= 30

  page.drawText('Total des gains', { x: 48, y, size: 9, font: fontBold, color: grey })
  y -= 20
  page.drawText(`${(params.totalCents / 100).toFixed(2)} €`, { x: 48, y, size: 28, font: fontBold, color: green })
  y -= 30

  page.drawText('Ventilation', { x: 48, y, size: 9, font: fontBold, color: grey })
  y -= 18
  page.drawLine({ start: { x: 48, y }, end: { x: 547, y }, thickness: 0.5, color: grey })
  y -= 14

  for (const row of params.breakdown) {
    page.drawText(row.source, { x: 48, y, size: 10, font, color: dark })
    page.drawText(`${row.count} opérations`, { x: 280, y, size: 9, font, color: grey })
    page.drawText(`${(row.amountCents / 100).toFixed(2)} €`, {
      x: 500,
      y,
      size: 10,
      font: fontBold,
      color: dark,
    })
    y -= 16
    if (y < 140) break
  }
  if (params.breakdown.length === 0) {
    page.drawText('Aucun gain enregistré cette année.', { x: 48, y, size: 10, font, color: grey })
    y -= 16
  }

  y = 120
  page.drawLine({ start: { x: 48, y }, end: { x: 547, y }, thickness: 0.5, color: grey })
  y -= 18
  page.drawText(`Généré par ${COMPANY_INFO.name}`, { x: 48, y, size: 8, font, color: grey })
  y -= 11
  page.drawText(`${COMPANY_INFO.address} · ${COMPANY_INFO.taxNote}`, { x: 48, y, size: 8, font, color: grey })
  y -= 11
  page.drawText(`Document généré le ${new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' })}`, {
    x: 48,
    y,
    size: 8,
    font,
    color: grey,
  })

  if (params.stampHash) {
    y -= 11
    page.drawText(`OpenTimestamps SHA-256 : ${params.stampHash.slice(0, 48)}…`, {
      x: 48,
      y,
      size: 7,
      font,
      color: grey,
    })
  }

  const bytes = await pdf.save()
  return Buffer.from(bytes)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const year: number = typeof body.year === 'number' ? body.year : new Date().getFullYear()

    const service = createServiceClient()

    const [{ data: profile }, { data: fiscalProf }, breakdown] = await Promise.all([
      service.from('profiles').select('email, full_name').eq('id', user.id).maybeSingle(),
      service.from('fiscal_profiles').select('siret, siret_display_name').eq('user_id', user.id).maybeSingle(),
      collectYearBreakdown(service, user.id, year),
    ])

    const totalCents = breakdown.reduce((acc, r) => acc + r.amountCents, 0)

    // Step 1 : build PDF (sans hash)
    const pdfBuffer = await buildPdf({
      userEmail: profile?.email ?? user.email ?? 'inconnu',
      userName: profile?.full_name ?? '',
      year,
      totalCents,
      breakdown,
      siret: fiscalProf?.siret,
      siretName: fiscalProf?.siret_display_name,
    })

    // Step 2 : stamp sur Bitcoin via OpenTimestamps
    let stamp: { hashHex: string; proofBase64: string; stampedAt: string } | null = null
    try {
      stamp = await stampBuffer(pdfBuffer)
    } catch {
      // OTS peut être lent / indispo — on persist sans stamp plutôt que de planter.
    }

    // Step 3 : upsert fiscal_statements (pas d'upload storage dans cette version ;
    // le PDF est renvoyé inline au client et optionnellement re-généré à chaque fois).
    await service.from('fiscal_statements').upsert(
      {
        user_id: user.id,
        year,
        total_earnings_cents: totalCents,
        breakdown: breakdown.reduce((acc, r) => ({ ...acc, [r.source]: r.amountCents }), {}),
        pdf_url: null,
        stamped_hash: stamp?.hashHex ?? null,
        stamped_proof: stamp?.proofBase64 ?? null,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,year' },
    )

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="veda-fiscal-${year}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Génération PDF impossible : ${(err as Error).message}` },
      { status: 500 },
    )
  }
}
