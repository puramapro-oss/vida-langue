'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users, DollarSign, BarChart3, Shield, Search, RefreshCw,
  ChevronDown, ChevronUp, Crown, TrendingUp, BookOpen, Mail,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface AdminStats {
  totalUsers: number
  activeWeek: number
  paidUsers: number
  totalSessions: number
  totalReferrals: number
  totalInfluencers: number
  pendingContact: number
  totalEarningsCents: number
}

interface AdminUser {
  id: string
  email: string | null
  display_name: string | null
  plan: string | null
  plan_tier: string | null
  role: string | null
  level: number | null
  xp: number | null
  wallet_balance: number | null
  streak_count: number | null
  referral_code: string | null
  created_at: string
}

export default function AdminPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<'created_at' | 'level' | 'wallet_balance'>('created_at')
  const [sortAsc, setSortAsc] = useState(false)
  const [showAllUsers, setShowAllUsers] = useState(false)
  const supabase = createClient()

  const isSuperAdmin = profile?.email === SUPER_ADMIN_EMAIL || profile?.role === 'super_admin'

  const loadData = useCallback(async () => {
    if (!isSuperAdmin) return
    setLoading(true)

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [
      { count: totalUsers },
      { count: paidUsers },
      { count: activeWeek },
      { count: totalSessions },
      { count: totalReferrals },
      { count: totalInfluencers },
      { count: pendingContact },
      { data: influencersData },
      { data: usersData },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('plan', 'free'),
      supabase.from('sessions').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('sessions').select('*', { count: 'exact', head: true }),
      supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('status', 'subscribed'),
      supabase.from('influencers').select('*', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('responded', false),
      supabase.from('influencers').select('total_earned_cents'),
      supabase.from('profiles').select('id, email, display_name, plan, plan_tier, role, level, xp, wallet_balance, streak_count, referral_code, created_at').order('created_at', { ascending: false }).limit(100),
    ])

    const totalEarningsCents = (influencersData ?? []).reduce(
      (sum: number, row: { total_earned_cents: number | null }) => sum + Number(row.total_earned_cents ?? 0),
      0,
    )

    setStats({
      totalUsers: totalUsers ?? 0,
      paidUsers: paidUsers ?? 0,
      activeWeek: activeWeek ?? 0,
      totalSessions: totalSessions ?? 0,
      totalReferrals: totalReferrals ?? 0,
      totalInfluencers: totalInfluencers ?? 0,
      pendingContact: pendingContact ?? 0,
      totalEarningsCents,
    })

    setUsers((usersData ?? []) as AdminUser[])
    setLoading(false)
  }, [isSuperAdmin, supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (!isSuperAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-red-400" />
          <h1 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">Acces restreint</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Reservé aux super-administrateurs Vida.</p>
        </div>
      </div>
    )
  }

  const filteredUsers = users
    .filter(u => {
      if (!search) return true
      const q = search.toLowerCase()
      return (u.email?.toLowerCase().includes(q)) || (u.display_name?.toLowerCase().includes(q)) || (u.referral_code?.toLowerCase().includes(q))
    })
    .sort((a, b) => {
      const va = a[sortField]
      const vb = b[sortField]
      if (typeof va === 'number' && typeof vb === 'number') return sortAsc ? va - vb : vb - va
      return sortAsc ? String(va ?? '').localeCompare(String(vb ?? '')) : String(vb ?? '').localeCompare(String(va ?? ''))
    })

  const displayedUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, 20)

  const STAT_CARDS = stats ? [
    { label: 'Apprenants', value: stats.totalUsers, icon: Users, color: 'var(--green)' },
    { label: 'Abonnés payants', value: stats.paidUsers, icon: Crown, color: '#f59e0b' },
    { label: 'Actifs 7 jours', value: stats.activeWeek, icon: TrendingUp, color: '#22c55e' },
    { label: 'Sessions totales', value: stats.totalSessions, icon: BookOpen, color: '#10b981' },
    { label: 'Parrainages convertis', value: stats.totalReferrals, icon: Users, color: '#ec4899' },
    { label: 'Influenceurs actifs', value: stats.totalInfluencers, icon: BarChart3, color: '#8b5cf6' },
    { label: 'Commissions versées', value: `${(stats.totalEarningsCents / 100).toFixed(2)} €`, icon: DollarSign, color: '#0ea5e9' },
    { label: 'Messages contact', value: stats.pendingContact, icon: Mail, color: stats.pendingContact > 0 ? '#f97316' : '#22c55e' },
  ] : []

  function handleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null
    return sortAsc ? <ChevronUp className="ml-1 inline h-3 w-3" /> : <ChevronDown className="ml-1 inline h-3 w-3" />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Administration Vida</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Vue d&apos;ensemble de la plateforme Vida Langue 🌱</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)] transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Actualiser
        </button>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STAT_CARDS.map(card => (
            <div key={card.label} className="glass rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `color-mix(in srgb, ${card.color} 15%, transparent)` }}>
                  <card.icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">{card.label}</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{typeof card.value === 'number' ? card.value.toLocaleString('fr-FR') : card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users Table */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Apprenants ({filteredUsers.length})</h2>
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Email, nom, code..."
              className="w-full rounded-xl border border-[var(--border)] bg-white/5 py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--green)] placeholder:text-[var(--text-secondary)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-secondary)]">
                <th className="pb-3 pr-4">Apprenant</th>
                <th className="pb-3 pr-4">Plan</th>
                <th className="cursor-pointer pb-3 pr-4 select-none" onClick={() => handleSort('level')}>
                  Niveau <SortIcon field="level" />
                </th>
                <th className="cursor-pointer pb-3 pr-4 select-none" onClick={() => handleSort('wallet_balance')}>
                  Wallet <SortIcon field="wallet_balance" />
                </th>
                <th className="pb-3 pr-4">Streak</th>
                <th className="cursor-pointer pb-3 select-none" onClick={() => handleSort('created_at')}>
                  Inscrit <SortIcon field="created_at" />
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map(user => (
                <tr key={user.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-3 pr-4">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{user.display_name ?? 'Sans nom'}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{user.email ?? '—'}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                      user.plan === 'free' ? 'bg-white/5 text-[var(--text-secondary)]' :
                      user.plan === 'complete' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    )}>
                      {user.plan ?? 'free'}
                    </span>
                    {user.role === 'super_admin' && (
                      <span className="ml-1 inline-flex rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">admin</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-[var(--text-primary)]">{user.level ?? 1}</td>
                  <td className="py-3 pr-4 text-[var(--text-primary)]">{Number(user.wallet_balance ?? 0).toFixed(2)} €</td>
                  <td className="py-3 pr-4 text-[var(--text-primary)]">{user.streak_count ?? 0}j</td>
                  <td className="py-3 text-[var(--text-secondary)]">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > 20 && !showAllUsers && (
          <button
            onClick={() => setShowAllUsers(true)}
            className="mt-4 w-full rounded-xl bg-white/5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)] transition-colors"
          >
            Voir les {filteredUsers.length - 20} apprenants restants
          </button>
        )}
      </div>
    </div>
  )
}
