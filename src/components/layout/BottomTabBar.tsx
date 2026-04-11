'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Sparkles, Globe2, Compass, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/dashboard', icon: Home, label: 'Maison' },
  { href: '/dashboard/sessions', icon: Sparkles, label: 'Sessions' },
  { href: '/dashboard/univers', icon: Globe2, label: 'Univers' },
  { href: '/dashboard/missions', icon: Compass, label: 'Missions' },
  { href: '/dashboard/profile', icon: User, label: 'Profil' },
] as const

export default function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--border)] bg-[var(--bg-nebula)]/90 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navigation principale"
    >
      {TABS.map(({ href, icon: Icon, label }) => {
        const active = href === '/dashboard' ? pathname === '/dashboard' : (pathname === href || pathname.startsWith(href + '/'))
        return (
          <Link
            key={href}
            href={href}
            data-testid={`tab-${href.split('/').pop() || 'home'}`}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-all duration-200',
              active
                ? 'text-emerald-400'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            <Icon className={cn(
              'h-5 w-5 transition-transform duration-200',
              active && 'drop-shadow-[0_0_6px_rgba(16,185,129,0.6)] scale-110'
            )} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
