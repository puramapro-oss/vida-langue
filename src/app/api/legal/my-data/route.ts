/**
 * GET /api/legal/my-data — export complet des données personnelles au format JSON
 * (droit à la portabilité, art. 20 RGPD ; page « Ma mémoire »).
 */
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const EXTRA_TABLES: Array<{ table: string; userIdColumn: string }> = [
  { table: 'subscriptions', userIdColumn: 'user_id' },
  { table: 'payments', userIdColumn: 'user_id' },
  { table: 'invoices', userIdColumn: 'user_id' },
  { table: 'donations', userIdColumn: 'user_id' },
  { table: 'sessions', userIdColumn: 'user_id' },
  { table: 'vocabulary', userIdColumn: 'user_id' },
  { table: 'conversations', userIdColumn: 'user_id' },
  { table: 'user_progress', userIdColumn: 'user_id' },
  { table: 'user_missions', userIdColumn: 'user_id' },
  { table: 'impact_log', userIdColumn: 'user_id' },
  { table: 'life_thread', userIdColumn: 'user_id' },
  { table: 'achievements', userIdColumn: 'user_id' },
  { table: 'streaks', userIdColumn: 'user_id' },
  { table: 'user_earnings', userIdColumn: 'user_id' },
  { table: 'contest_entries', userIdColumn: 'user_id' },
  { table: 'social_posts', userIdColumn: 'user_id' },
  { table: 'social_comments', userIdColumn: 'user_id' },
  { table: 'notifications', userIdColumn: 'user_id' },
  { table: 'notification_settings', userIdColumn: 'user_id' },
  { table: 'contact_messages', userIdColumn: 'user_id' },
  { table: 'withdrawals', userIdColumn: 'user_id' },
  { table: 'awakening_events', userIdColumn: 'user_id' },
  { table: 'gratitude_entries', userIdColumn: 'user_id' },
  { table: 'intentions', userIdColumn: 'user_id' },
  { table: 'breath_sessions', userIdColumn: 'user_id' },
  { table: 'purama_points', userIdColumn: 'user_id' },
  { table: 'point_transactions', userIdColumn: 'user_id' },
  { table: 'point_purchases', userIdColumn: 'user_id' },
  { table: 'support_escalations', userIdColumn: 'user_id' },
  { table: 'welcome_primes', userIdColumn: 'user_id' },
  { table: 'timestamped_records', userIdColumn: 'user_id' },
  { table: 'fiscal_profiles', userIdColumn: 'user_id' },
  { table: 'fiscal_statements', userIdColumn: 'user_id' },
  { table: 'influencers', userIdColumn: 'user_id' },
  { table: 'influencer_sales', userIdColumn: 'buyer_id' },
  { table: 'stripe_connect_accounts', userIdColumn: 'user_id' },
  { table: 'referrals', userIdColumn: 'referrer_id' },
]

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 })

  const [{ data: profile }, { data: acceptances }, { data: cookieConsent }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('legal_acceptances').select('doc_type, version, accepted_at').eq('user_id', user.id),
    supabase.from('cookie_consents').select('*').eq('user_id', user.id).maybeSingle(),
  ])

  const extra: Record<string, unknown> = {}
  for (const { table, userIdColumn } of EXTRA_TABLES) {
    const { data } = await supabase.from(table).select('*').eq(userIdColumn, user.id)
    extra[table] = data ?? []
  }

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    compte: { id: user.id, email: user.email, createdAt: user.created_at },
    profile: profile ?? null,
    acceptationsLegales: acceptances ?? [],
    consentementCookies: cookieConsent ?? null,
    ...extra,
  }

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="mes-donnees.json"',
    },
  })
}
