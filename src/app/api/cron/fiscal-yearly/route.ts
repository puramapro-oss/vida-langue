import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 300

// CRON 1er janvier : pour chaque user ayant >0€ de gains l'année précédente,
// (1) calcule total + ventilation, (2) upsert fiscal_statements, (3) optionnellement
// appelle /api/fiscal/pdf pour pré-générer le PDF (ici on reste lean : persist stats
// et laisse user cliquer pour le PDF — économise 100x OTS stamps).
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const hdr = req.headers.get('authorization')
  if (hdr && hdr === `Bearer ${secret}`) return true
  const key = req.headers.get('x-cron-key')
  if (key && key === secret) return true
  return false
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient()
  const year = new Date().getFullYear() - 1 // année précédente
  const start = `${year}-01-01`
  const end = `${year + 1}-01-01`

  const { data: rows } = await service
    .from('wallet_transactions')
    .select('user_id, amount, source, type')
    .gt('amount', 0)
    .gte('created_at', start)
    .lt('created_at', end)

  const byUser = new Map<string, { total: number; breakdown: Record<string, number> }>()
  for (const r of rows ?? []) {
    const uid = r.user_id as string
    const cents = Math.round(Number(r.amount ?? 0) * 100)
    const key = (r.source as string) ?? (r.type as string) ?? 'autre'
    const cur = byUser.get(uid) ?? { total: 0, breakdown: {} }
    cur.total += cents
    cur.breakdown[key] = (cur.breakdown[key] ?? 0) + cents
    byUser.set(uid, cur)
  }

  let upserts = 0
  for (const [userId, { total, breakdown }] of byUser) {
    if (total <= 0) continue
    const { error: upErr } = await service.from('fiscal_statements').upsert(
      {
        user_id: userId,
        year,
        total_earnings_cents: total,
        breakdown,
        pdf_url: null,
        stamped_hash: null,
        stamped_proof: null,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,year' },
    )
    if (!upErr) upserts += 1

    // Notification user
    await service.from('notifications').insert({
      user_id: userId,
      type: 'fiscal_yearly_ready',
      title: `Récap fiscal ${year} disponible`,
      body: `${(total / 100).toFixed(2)} € de gains sur ${year}. Télécharge ton PDF : /dashboard/fiscal`,
      read: false,
      metadata: { year, totalCents: total },
    }).then(() => null)
  }

  return NextResponse.json({ ok: true, year, usersProcessed: byUser.size, upserts })
}
