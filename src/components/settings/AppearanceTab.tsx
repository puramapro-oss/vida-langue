'use client'

import { Check, Globe } from 'lucide-react'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

const ACCENT_COLORS = [
  { name: 'Cyan', value: '#00d4ff', class: 'bg-[#00d4ff]' },
  { name: 'Violet', value: '#8b5cf6', class: 'bg-[#8b5cf6]' },
  { name: 'Rose', value: '#ec4899', class: 'bg-[#ec4899]' },
  { name: 'Vert', value: '#10b981', class: 'bg-[#10b981]' },
  { name: 'Or', value: '#f59e0b', class: 'bg-[#f59e0b]' },
  { name: 'Orange', value: '#f97316', class: 'bg-[#f97316]' },
]

interface AppearanceTabProps {
  theme: 'dark' | 'light'
  accentColor: string
  locales: string[]
  localeNames: Record<string, string>
  onThemeChange: (theme: 'dark' | 'light') => void
  onAccentChange: (color: string) => void
}

export default function AppearanceTab({
  theme,
  accentColor,
  locales,
  localeNames,
  onThemeChange,
  onAccentChange,
}: AppearanceTabProps) {
  const currentLocale = (typeof document !== 'undefined' ? document.cookie.match(/locale=(\w+)/)?.[1] : 'fr') ?? 'fr'

  const handleLocaleChange = async (locale: string) => {
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale }),
    })
    window.location.reload()
  }

  return (
    <div className="flex flex-col gap-4" data-testid="appearance-tab">
      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-[var(--text-primary)]">Mode d&apos;affichage</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onThemeChange('dark')}
            data-testid="theme-dark"
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all',
              theme === 'dark'
                ? 'border-[var(--cyan)] bg-[var(--cyan)]/10'
                : 'border-[var(--border)] hover:border-[var(--border-glow)]'
            )}
          >
            <div className="h-12 w-full rounded-lg bg-[#0a0a0f] border border-white/10" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Sombre</span>
          </button>
          <button
            onClick={() => onThemeChange('light')}
            data-testid="theme-light"
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all',
              theme === 'light'
                ? 'border-[var(--cyan)] bg-[var(--cyan)]/10'
                : 'border-[var(--border)] hover:border-[var(--border-glow)]'
            )}
          >
            <div className="h-12 w-full rounded-lg bg-[#f8fafc] border border-black/10" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Clair</span>
          </button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-[var(--text-primary)]">Couleur d&apos;accent</h2>
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => onAccentChange(c.value)}
              title={c.name}
              data-testid={`accent-${c.name.toLowerCase()}`}
              className={cn(
                'relative h-9 w-9 rounded-full transition-transform hover:scale-110',
                c.class,
                accentColor === c.value && 'ring-2 ring-white ring-offset-2 ring-offset-[var(--bg)]'
              )}
            >
              {accentColor === c.value && (
                <Check className="absolute inset-0 m-auto h-4 w-4 text-black" />
              )}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-3 font-semibold text-[var(--text-primary)]">Langue de l&apos;interface</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {locales.map((locale) => {
            const isActive = locale === currentLocale
            return (
              <button
                key={locale}
                onClick={() => void handleLocaleChange(locale)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all',
                  isActive
                    ? 'border-[var(--cyan)] bg-[var(--cyan)]/10 text-[var(--cyan)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                )}
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{localeNames[locale]}</span>
                {isActive && <Check className="h-3.5 w-3.5 shrink-0 ml-auto" />}
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          VEDA répond automatiquement dans la langue de ta question.
        </p>
      </Card>
    </div>
  )
}
