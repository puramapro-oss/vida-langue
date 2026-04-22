'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Sparkles, Globe2, Compass, Megaphone, Users,
  Wallet, Trophy, Settings, ChevronLeft, ChevronRight,
  LogOut, User, Shield, BookOpen, Heart, Leaf, Wind, ShoppingBag,
  Calculator,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { SUPER_ADMIN_EMAIL, APP_NAME } from '@/lib/constants'
import LocaleSwitcher from '@/components/shared/LocaleSwitcher'

const NAV_ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Maison' },
  { href: '/dashboard/sessions', icon: Sparkles, label: 'Sessions' },
  { href: '/dashboard/univers', icon: Globe2, label: 'Mon Univers' },
  { href: '/dashboard/missions', icon: Compass, label: 'Missions' },
  { href: '/dashboard/impact', icon: Leaf, label: 'Impact' },
  { href: '/dashboard/concours', icon: Trophy, label: 'Concours' },
  { href: '/dashboard/referral', icon: Users, label: 'Parrainage' },
  { href: '/dashboard/ambassadeur', icon: Megaphone, label: 'Ambassadeur' },
  { href: '/dashboard/wallet', icon: Wallet, label: 'Gains' },
  { href: '/dashboard/fiscal', icon: Calculator, label: 'Fiscal' },
  { href: '/dashboard/boutique', icon: ShoppingBag, label: 'Boutique' },
  { href: '/dashboard/gratitude', icon: Heart, label: 'Gratitude' },
  { href: '/breathe', icon: Wind, label: 'Respiration' },
  { href: '/dashboard/guide', icon: BookOpen, label: 'Guide' },
  { href: '/dashboard/profile', icon: User, label: 'Profil' },
  { href: '/dashboard/settings', icon: Settings, label: 'Réglages' },
] as const

const ADMIN_ITEM = { href: '/dashboard/admin', icon: Shield, label: 'Admin' } as const

export default function Sidebar() {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const isSuperAdmin = profile?.email === SUPER_ADMIN_EMAIL || profile?.role === 'super_admin'
  const navItems = isSuperAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 hidden h-screen flex-col border-r border-[var(--border)] bg-[var(--bg-nebula)]/80 backdrop-blur-xl transition-all duration-300 lg:flex',
        collapsed ? 'w-16' : 'w-60'
      )}
      data-testid="sidebar"
    >
      <div className={cn('flex h-16 items-center border-b border-[var(--border)] px-4', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-emerald-400">
              {APP_NAME}
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
          aria-label={collapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
          data-testid="sidebar-toggle"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 scrollbar-thin">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === '/dashboard' ? pathname === '/dashboard' : (pathname === href || pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              href={href}
              data-testid={`nav-${href.split('/').pop()}`}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                collapsed ? 'justify-center' : '',
                active
                  ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]'
                  : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className={cn('h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110', active && 'drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]')} />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-3 space-y-2">
        {!collapsed && <LocaleSwitcher />}
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-semibold text-white">
              {getInitials(profile?.display_name ?? profile?.email ?? null)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                {profile?.display_name ?? profile?.email ?? 'Utilisateur'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Niv. {profile?.level ?? 1} · {profile?.xp_title ?? 'Graine'}
              </p>
            </div>
            <button
              onClick={signOut}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
              aria-label="Se déconnecter"
              data-testid="logout-sidebar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-semibold text-white">
              {getInitials(profile?.display_name ?? profile?.email ?? null)}
            </div>
            <button
              onClick={signOut}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
              aria-label="Se déconnecter"
              data-testid="logout-sidebar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
