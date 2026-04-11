'use client'

import { useState, useEffect, useCallback, useRef, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, UserPlus, Loader2, X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate, getInitials, cn } from '@/lib/utils'

interface Space {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
}

interface Member {
  id: string
  user_id: string
  role: string
  joined_at: string
  display_name?: string | null
  email?: string | null
}

interface Message {
  id: string
  user_id: string
  content: string
  created_at: string
  display_name?: string | null
}

export default function CollabSpacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [space, setSpace] = useState<Space | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  const endRef = useRef<HTMLDivElement>(null)

  const loadAll = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Space
    const { data: s } = await supabase
      .from('collab_spaces')
      .select('*')
      .eq('id', id)
      .single()
    if (!s) {
      toast.error('Espace introuvable')
      router.push('/dashboard/collab')
      return
    }
    setSpace(s as Space)

    // Members
    const { data: rawMembers } = await supabase
      .from('collab_members')
      .select('id, user_id, role, joined_at')
      .eq('space_id', id)

    let enrichedMembers: Member[] = (rawMembers ?? []) as Member[]
    if (enrichedMembers.length > 0) {
      const userIds = enrichedMembers.map(m => m.user_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', userIds)
      const profMap = new Map((profiles ?? []).map((p: { id: string; display_name: string | null; email: string | null }) => [p.id, p]))
      enrichedMembers = enrichedMembers.map(m => ({
        ...m,
        display_name: profMap.get(m.user_id)?.display_name ?? null,
        email: profMap.get(m.user_id)?.email ?? null,
      }))
    }
    setMembers(enrichedMembers)

    // Messages
    const { data: rawMsgs } = await supabase
      .from('collab_messages')
      .select('*')
      .eq('space_id', id)
      .order('created_at', { ascending: true })
      .limit(200)
    let msgs: Message[] = (rawMsgs ?? []) as Message[]
    if (msgs.length > 0) {
      const ids = Array.from(new Set(msgs.map(m => m.user_id)))
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', ids)
      const profMap = new Map((profiles ?? []).map((p: { id: string; display_name: string | null }) => [p.id, p.display_name]))
      msgs = msgs.map(m => ({ ...m, display_name: profMap.get(m.user_id) ?? null }))
    }
    setMessages(msgs)

    setLoading(false)
  }, [id, supabase, user, router])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Realtime subscription
  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`collab-${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'akasha_ai', table: 'collab_messages', filter: `space_id=eq.${id}` },
        (payload) => {
          const msg = payload.new as Message
          setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]))
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, supabase])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !user || sending) return
    setSending(true)
    const text = input.trim()
    setInput('')
    const { error } = await supabase.from('collab_messages').insert({
      space_id: id,
      user_id: user.id,
      content: text,
    })
    if (error) {
      toast.error('Erreur envoi')
      setInput(text)
    }
    setSending(false)
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !user) return
    setInviting(true)

    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', inviteEmail.trim().toLowerCase())
      .maybeSingle()

    if (!targetProfile) {
      toast.error('Aucun utilisateur AKASHA avec cet email')
      setInviting(false)
      return
    }

    const { error } = await supabase.from('collab_members').insert({
      space_id: id,
      user_id: targetProfile.id,
      role: 'editor',
    })

    if (error) {
      if (error.code === '23505') toast.info('Deja membre')
      else toast.error('Erreur invitation')
    } else {
      toast.success('Membre ajoute !')
      setInviteEmail('')
      setShowInvite(false)
      loadAll()
    }
    setInviting(false)
  }

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await supabase.from('collab_members').delete().eq('id', memberId)
    if (error) toast.error('Erreur suppression')
    else {
      toast.success('Membre retire')
      loadAll()
    }
  }

  const isOwner = space?.owner_id === user?.id

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  if (!space) return null

  return (
    <div className="flex flex-col gap-6" data-testid="collab-space-detail">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/collab"
          className="rounded-xl p-2 text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-[family-name:var(--font-display)]">
            {space.name}
          </h1>
          {space.description && (
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{space.description}</p>
          )}
        </div>
        {isOwner && (
          <Button
            icon={<UserPlus className="h-4 w-4" />}
            onClick={() => setShowInvite(true)}
            data-testid="invite-member-btn"
          >
            Inviter
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Chat */}
        <Card className="flex h-[60vh] flex-col">
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {messages.length === 0 ? (
              <EmptyState
                title="Aucun message"
                description="Lance la conversation avec ton equipe."
              />
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((m) => {
                  const mine = m.user_id === user?.id
                  return (
                    <div
                      key={m.id}
                      className={cn('flex gap-2', mine ? 'flex-row-reverse' : 'flex-row')}
                      data-testid={`collab-msg-${m.id}`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--cyan)] to-[var(--purple)] text-xs font-bold text-black">
                        {getInitials(m.display_name ?? null)}
                      </div>
                      <div className={cn('max-w-[75%] rounded-2xl px-4 py-2 text-sm', mine ? 'bg-[var(--cyan)]/20 border border-[var(--cyan)]/30' : 'bg-white/5 border border-white/10')}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                          {m.display_name ?? 'Anonyme'}
                        </p>
                        <p className="mt-0.5 whitespace-pre-wrap text-[var(--text-primary)]">{m.content}</p>
                      </div>
                    </div>
                  )
                })}
                <div ref={endRef} />
              </div>
            )}
          </div>
          <div className="border-t border-[var(--border)] p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ecris un message a ton equipe..."
                className="flex-1 rounded-xl border border-[var(--border)] bg-white/5 px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--cyan)] focus:outline-none"
                data-testid="collab-input"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                icon={sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                data-testid="collab-send"
              >
                Envoyer
              </Button>
            </div>
          </div>
        </Card>

        {/* Members */}
        <Card className="p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Membres ({members.length + 1})
          </h2>
          <div className="flex flex-col gap-2">
            {/* Owner */}
            <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--cyan)] to-[var(--purple)] text-xs font-bold text-black">
                {getInitials(null)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {space.owner_id === user?.id ? 'Toi' : 'Createur'}
                </p>
                <p className="text-xs text-[var(--cyan)]">Admin</p>
              </div>
            </div>
            {members.filter(m => m.user_id !== space.owner_id).map((m) => (
              <div key={m.id} className="flex items-center gap-2 rounded-xl p-2 hover:bg-white/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple)] to-[var(--pink)] text-xs font-bold text-white">
                  {getInitials(m.display_name ?? m.email ?? null)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {m.display_name ?? m.email ?? 'Membre'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{m.role}</p>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="rounded-lg p-1 text-red-400 hover:bg-red-500/10"
                    aria-label="Retirer le membre"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-[var(--text-muted)]">
            Cree le {formatDate(space.created_at)}
          </p>
        </Card>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setShowInvite(false)}
          data-testid="invite-modal"
        >
          <Card className="w-full max-w-sm p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Inviter un membre</h2>
              <button onClick={() => setShowInvite(false)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                placeholder="email@exemple.com"
                autoFocus
                className="w-full rounded-xl border border-[var(--border)] bg-white/5 px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--cyan)] focus:outline-none"
                data-testid="invite-email-input"
              />
              <p className="text-xs text-[var(--text-muted)]">
                L&apos;utilisateur doit deja avoir un compte AKASHA.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowInvite(false)}>
                  Annuler
                </Button>
                <Button onClick={handleInvite} loading={inviting} disabled={!inviteEmail.trim()} data-testid="confirm-invite-btn">
                  Inviter
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
