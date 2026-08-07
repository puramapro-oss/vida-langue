'use client'

import { useState, useEffect, useCallback } from 'react'
import { Heart, Send, Calendar, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'

interface GratitudeEntry {
  id: string
  content: string
  created_at: string
}

export default function GratitudePage() {
  const { profile } = useAuth()
  const [content, setContent] = useState('')
  const [entries, setEntries] = useState<GratitudeEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingEntries, setLoadingEntries] = useState(true)

  const supabase = createClient()

  const loadEntries = useCallback(async () => {
    if (!profile?.id) return
    setLoadingEntries(true)
    const { data } = await supabase
      .from('gratitude_entries')
      .select('id, content, created_at')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(30)
    setEntries((data as GratitudeEntry[]) ?? [])
    setLoadingEntries(false)
  }, [profile?.id, supabase])

  useEffect(() => {
    void (async () => {
      await loadEntries()
    })()
  }, [loadEntries])

  const todayCount = entries.filter(
    (e) => new Date(e.created_at).toDateString() === new Date().toDateString()
  ).length

  const handleSubmit = async () => {
    if (!content.trim() || !profile?.id) return
    setLoading(true)

    const { error } = await supabase
      .from('gratitude_entries')
      .insert({ user_id: profile.id, content: content.trim() })

    if (error) {
      toast.error('Impossible d\'enregistrer. Reessaie.')
    } else {
      toast.success('Gratitude enregistree 🌿')
      setContent('')
      void loadEntries()
    }
    setLoading(false)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Journal de gratitude
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Prends un instant pour noter ce qui te rend reconnaissant aujourd&apos;hui.
          La gratitude amplifie chaque apprentissage.
        </p>
      </div>

      {/* Today stats */}
      <div className="flex gap-4 mb-6">
        <Card className="flex-1 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--text-primary)]">{todayCount}</p>
            <p className="text-xs text-[var(--text-muted)]">Aujourd&apos;hui</p>
          </div>
        </Card>
        <Card className="flex-1 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--text-primary)]">{entries.length}</p>
            <p className="text-xs text-[var(--text-muted)]">Total (30 derniers)</p>
          </div>
        </Card>
      </div>

      {/* Input */}
      <Card className="p-5 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Heart className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Aujourd'hui, je suis reconnaissant pour..."
              rows={3}
              data-testid="gratitude-input"
              className="w-full bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm resize-none focus:outline-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[var(--text-muted)]">
                {content.length}/500
              </span>
              <Button
                size="sm"
                onClick={() => void handleSubmit()}
                loading={loading}
                disabled={!content.trim() || content.length > 500}
                data-testid="btn-gratitude-submit"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* History */}
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Mes gratitudes
      </h2>

      {loadingEntries ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card className="p-8 text-center">
          <Heart className="w-8 h-8 text-emerald-400/40 mx-auto mb-3" />
          <p className="text-sm text-[var(--text-muted)]">
            Aucune gratitude enregistree. Commence maintenant !
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="p-4">
              <p className="text-sm text-[var(--text-primary)] mb-1.5">{entry.content}</p>
              <p className="text-xs text-[var(--text-muted)]">{formatDate(entry.created_at)}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
