'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Star, Download, ShieldCheck, Store, X, Globe, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import { formatPrice, getInitials } from '@/lib/utils'

interface Agent {
  id: string
  name: string
  description: string | null
  price: number
  rating: number | null
  installs_count: number
  is_verified: boolean
  is_public: boolean
  user_id: string
  category: string | null
  created_at: string
  creator_name?: string
}

type FilterType = 'all' | 'new' | 'free' | 'premium'

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'Populaires',
  new: 'Nouveaux',
  free: 'Gratuits',
  premium: 'Premium',
}

const ACCENT_COLORS = [
  'bg-[var(--cyan)]', 'bg-[var(--purple)]', 'bg-[var(--pink)]',
  'bg-[var(--green)]', 'bg-[var(--gold)]', 'bg-[var(--orange)]',
]

interface OwnAgent {
  id: string
  name: string
  description: string | null
  is_public: boolean
  icon: string | null
  color: string | null
}

export default function MarketplacePage() {
  const { user } = useAuth()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [installing, setInstalling] = useState<string | null>(null)
  const [showPublish, setShowPublish] = useState(false)
  const [ownAgents, setOwnAgents] = useState<OwnAgent[]>([])
  const [loadingOwn, setLoadingOwn] = useState(false)
  const [publishingId, setPublishingId] = useState<string | null>(null)

  const supabase = createClient()

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_public', true)
      .order('installs_count', { ascending: false })

    if (!error && data) {
      setAgents(data as Agent[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const openPublishModal = useCallback(async () => {
    if (!user) {
      toast.error('Connecte-toi pour publier un agent')
      return
    }
    setShowPublish(true)
    setLoadingOwn(true)
    const { data } = await supabase
      .from('agents')
      .select('id, name, description, is_public, icon, color')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })
    setOwnAgents((data ?? []) as OwnAgent[])
    setLoadingOwn(false)
  }, [user, supabase])

  const handlePublishAgent = async (agentId: string, currentlyPublic: boolean) => {
    setPublishingId(agentId)
    const { error } = await supabase
      .from('agents')
      .update({ is_public: !currentlyPublic })
      .eq('id', agentId)
    if (error) {
      toast.error('Erreur publication')
    } else {
      toast.success(currentlyPublic ? 'Agent retire de la marketplace' : 'Agent publie sur la marketplace !')
      setOwnAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, is_public: !currentlyPublic } : a))
      )
      fetchAgents()
    }
    setPublishingId(null)
  }

  const handleInstall = async (agent: Agent) => {
    if (!user) {
      toast.error('Connecte-toi pour installer cet agent')
      return
    }
    setInstalling(agent.id)
    const { error } = await supabase
      .from('agent_installs')
      .upsert(
        { agent_id: agent.id, user_id: user.id },
        { onConflict: 'agent_id,user_id' }
      )
    if (error) {
      toast.error('Erreur lors de l\'installation')
    } else {
      toast.success(`Agent "${agent.name}" installe !`)
      // Update local installs count optimistically
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agent.id ? { ...a, installs_count: a.installs_count + 1 } : a
        )
      )
    }
    setInstalling(null)
  }

  const filtered = agents.filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.description ?? '').toLowerCase().includes(search.toLowerCase())

    let matchFilter = true
    if (filter === 'free') matchFilter = a.price === 0
    if (filter === 'premium') matchFilter = a.price > 0
    if (filter === 'new') matchFilter = true // order by created_at handled in fetcher

    return matchSearch && matchFilter
  })

  const sortedAgents =
    filter === 'new'
      ? [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      : filtered

  return (
    <div className="flex flex-col gap-6" data-testid="marketplace-page">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-[family-name:var(--font-display)]">
            Marketplace
          </h1>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            Decouvre les agents de la communaute
          </p>
        </div>
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={openPublishModal}
          data-testid="open-publish-btn"
        >
          Publier un agent
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un agent..."
            className="w-full rounded-xl border border-[var(--border)] bg-white/5 py-2.5 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--cyan)] focus:outline-none"
            data-testid="marketplace-search"
          />
        </div>
        <div className="flex gap-1 rounded-xl bg-white/5 p-1">
          {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              data-testid={`filter-${f}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-[var(--cyan)] text-black'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : sortedAgents.length === 0 ? (
        <EmptyState
          icon={<Store className="h-10 w-10" />}
          title={search ? 'Aucun resultat' : 'Aucun agent publie pour le moment'}
          description={
            search
              ? 'Essaie avec d\'autres mots-cles.'
              : 'Sois le premier a publier un agent sur la marketplace.'
          }
          action={
            !search ? (
              <Button onClick={openPublishModal}>
                Publier un agent
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="agents-grid">
          {sortedAgents.map((agent, idx) => (
            <Card key={agent.id} className="flex flex-col gap-4 p-5" data-testid={`agent-card-${agent.id}`}>
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-black ${
                    ACCENT_COLORS[idx % ACCENT_COLORS.length]
                  }`}
                >
                  {getInitials(agent.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-semibold text-[var(--text-primary)]">{agent.name}</p>
                    {agent.is_verified && (
                      <span title="Verifie">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--cyan)]" />
                      </span>
                    )}
                  </div>
                  {agent.creator_name && (
                    <p className="text-xs text-[var(--text-muted)]">par {agent.creator_name}</p>
                  )}
                </div>
              </div>

              <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                {agent.description ?? 'Aucune description disponible.'}
              </p>

              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-[var(--gold)] fill-[var(--gold)]" />
                  {agent.rating != null ? agent.rating.toFixed(1) : '—'}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="h-3.5 w-3.5" />
                  {agent.installs_count} installs
                </span>
                <span className="ml-auto">
                  {agent.price === 0 ? (
                    <Badge variant="green">Gratuit</Badge>
                  ) : (
                    <Badge variant="gold">{formatPrice(agent.price)}</Badge>
                  )}
                </span>
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleInstall(agent)}
                loading={installing === agent.id}
                icon={<Download className="h-3.5 w-3.5" />}
                className="w-full"
                data-testid={`install-agent-${agent.id}`}
              >
                Installer
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Publish modal */}
      {showPublish && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setShowPublish(false)}
          data-testid="publish-modal"
        >
          <Card className="w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Publier un agent</h2>
              <button
                onClick={() => setShowPublish(false)}
                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              Choisis un de tes agents customs a rendre public sur la marketplace.
            </p>

            {loadingOwn ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : ownAgents.length === 0 ? (
              <EmptyState
                title="Aucun agent custom"
                description="Cree d'abord un agent depuis la page Agents."
                action={
                  <Button onClick={() => { setShowPublish(false); window.location.href = '/dashboard/agents' }}>
                    Aller a la page Agents
                  </Button>
                }
              />
            ) : (
              <div className="flex flex-col gap-2">
                {ownAgents.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white/5 p-3"
                    data-testid={`own-agent-${a.id}`}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                      style={{ backgroundColor: (a.color ?? '#00d4ff') + '22' }}
                    >
                      {a.icon ?? '🤖'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{a.name}</p>
                      <p className="truncate text-xs text-[var(--text-muted)]">
                        {a.description ?? 'Pas de description'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={a.is_public ? 'ghost' : 'secondary'}
                      onClick={() => handlePublishAgent(a.id, a.is_public)}
                      loading={publishingId === a.id}
                      icon={<Globe className="h-3.5 w-3.5" />}
                      data-testid={`publish-toggle-${a.id}`}
                    >
                      {a.is_public ? 'Retirer' : 'Publier'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
