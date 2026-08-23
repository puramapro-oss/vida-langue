'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import MaMemoirePage, { type LegalAcceptanceRow } from '@/lib/legal/components/MaMemoirePage'
import Skeleton from '@/components/ui/Skeleton'
import { APP_NAME } from '@/lib/constants'

export default function MaMemoire() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [acceptations, setAcceptations] = useState<LegalAcceptanceRow[]>([])
  const [deletionScheduledFor, setDeletionScheduledFor] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase
        .from('legal_acceptances')
        .select('doc_type, version, accepted_at')
        .eq('user_id', user.id),
      supabase
        .from('account_deletion_requests')
        .select('scheduled_for')
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .maybeSingle(),
    ]).then(([{ data: acc }, { data: deletion }]) => {
      setAcceptations(
        (acc ?? []).map((a) => ({ docType: a.doc_type, version: a.version, acceptedAt: a.accepted_at }))
      )
      setDeletionScheduledFor(deletion?.scheduled_for ?? null)
      setLoading(false)
    })
  }, [user, supabase])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-12 px-4">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
      </div>
    )
  }

  return (
    <MaMemoirePage
      appName={APP_NAME}
      acceptations={acceptations}
      deletionScheduledFor={deletionScheduledFor}
    />
  )
}
