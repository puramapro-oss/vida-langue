import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 60

// CRON mensuel : vérifie pour chaque user qui a dépassé 1500/2500/3000€ dans l'année
// et déclenche une notification (table notifications) s'il n'a pas déjà été alerté.
// Sécurité : vérifie Vercel CRON secret OU header x-cron-key.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const hdr = req.headers.get('authorization')
  if (hdr && hdr === `Bearer ${secret}`) return true
  const key = req.headers.get('x-cron-key')
  if (key && key === secret) return true
  return false
}

const THRESHOLDS = [150000, 250000, 300000]

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient()
  const year = new Date().getFullYear()
  const start = `${year}-01-01`

  // Aggregat par user des gains positifs depuis début année
  const { data: rows } = await service
    .from('wallet_transactions')
    .select('user_id, amount')
    .gt('amount', 0)
    .gte('created_at', start)

  const byUser = new Map<string, number>()
  for (const r of rows ?? []) {
    const uid = r.user_id as string
    const cents = Math.round(Number(r.amount ?? 0) * 100)
    byUser.set(uid, (byUser.get(uid) ?? 0) + cents)
  }

  let alertsSent = 0
  for (const [userId, totalCents] of byUser) {
    const highest = [...THRESHOLDS].reverse().find((t) => totalCents >= t)
    if (!highest) continue

    // Check si déjà alerté pour ce seuil cette année
    const { data: existing } = await service
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'fiscal_threshold')
      .eq('metadata->>threshold', String(highest))
      .eq('metadata->>year', String(year))
      .maybeSingle()
    if (existing) continue

    const { error: insertErr } = await service.from('notifications').insert({
      user_id: userId,
      type: 'fiscal_threshold',
      title: `Tu as franchi ${(highest / 100).toFixed(0)} €`,
      body: 'Ton récap fiscal annuel sera généré automatiquement. Voir /dashboard/fiscal.',
      read: false,
      metadata: { threshold: highest, year, totalCents },
    })
    if (!insertErr) alertsSent += 1
  }

  return NextResponse.json({ ok: true, usersChecked: byUser.size, alertsSent })
}
