import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes, createHash } from 'crypto'
import { APP_SCHEMA } from '@/lib/constants'

export async function POST() {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        db: { schema: APP_SCHEMA },
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    // Generate key
    const rawKey = `akasha_live_${randomBytes(24).toString('hex')}`
    const keyPrefix = rawKey.slice(0, 16)
    const keyHash = createHash('sha256').update(rawKey).digest('hex')

    // Deactivate any existing active key
    await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true)

    // Insert new key
    const { error: insertError } = await supabase.from('api_keys').insert({
      user_id: user.id,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      is_active: true,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      return NextResponse.json({ error: 'Erreur lors de la creation' }, { status: 500 })
    }

    return NextResponse.json({ key: rawKey })
  } catch (err) {
    console.error('[api-keys/generate]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
