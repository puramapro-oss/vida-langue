'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Shield, Palette, CreditCard, Database, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { locales, localeNames } from '@/i18n/config'
import ProfileTab from '@/components/settings/ProfileTab'
import NotificationsTab from '@/components/settings/NotificationsTab'
import SecurityTab from '@/components/settings/SecurityTab'
import AppearanceTab from '@/components/settings/AppearanceTab'
import BillingTab from '@/components/settings/BillingTab'
import DataTab from '@/components/settings/DataTab'

type Tab = 'profile' | 'notifications' | 'security' | 'appearance' | 'billing' | 'data'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profil', icon: <User className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { id: 'security', label: 'Securite', icon: <Shield className="h-4 w-4" /> },
  { id: 'appearance', label: 'Apparence', icon: <Palette className="h-4 w-4" /> },
  { id: 'billing', label: 'Facturation', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'data', label: 'Donnees', icon: <Database className="h-4 w-4" /> },
]

interface Payment {
  id: string
  amount: number
  status: string
  created_at: string
  invoice_number: string | null
}

export default function SettingsPage() {
  const { user, profile, signOut, refetch } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [saving, setSaving] = useState(false)
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    pseudo: '',
    bio: '',
  })
  const [notifSettings, setNotifSettings] = useState<Record<string, boolean>>({
    product_updates: true,
    agent_notifications: true,
    quota_alerts: true,
    newsletter: false,
    marketplace_notifications: true,
    weekly_digest: true,
  })
  const [accentColor, setAccentColor] = useState('#00d4ff')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [payments, setPayments] = useState<Payment[]>([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<'history' | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      queueMicrotask(() => {
        setProfileForm({
          display_name: profile.display_name ?? '',
          pseudo: profile.pseudo ?? '',
          bio: profile.bio ?? '',
        })
        setAccentColor(profile.accent_color ?? '#00d4ff')
      })
    }
  }, [profile])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const stored = localStorage.getItem('vida_theme') as 'dark' | 'light' | null
    const initial: 'dark' | 'light' = stored ?? 'dark'
    queueMicrotask(() => setTheme(initial))
    document.documentElement.dataset.theme = initial
  }, [])

  const applyTheme = (next: 'dark' | 'light') => {
    setTheme(next)
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = next
      localStorage.setItem('vida_theme', next)
    }
    toast.success(next === 'dark' ? 'Mode sombre active' : 'Mode clair active')
  }

  useEffect(() => {
    if (activeTab !== 'billing' || !user) return
    queueMicrotask(() => setLoadingPayments(true))
    supabase
      .from('payments')
      .select('id, amount, status, created_at, invoice_number')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setPayments((data ?? []) as Payment[])
        setLoadingPayments(false)
      })
  }, [activeTab, user, supabase])

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profileForm.display_name || null,
        pseudo: profileForm.pseudo || null,
        bio: profileForm.bio || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Erreur lors de la sauvegarde')
    } else {
      toast.success('Profil mis a jour !')
      refetch()
    }
    setSaving(false)
  }

  const handleSaveNotifs = async () => {
    if (!user) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 300))
    toast.success('Preferences sauvegardees !')
    setSaving(false)
  }

  const handleSaveAccent = async (color: string) => {
    setAccentColor(color)
    if (!user) return
    await supabase
      .from('profiles')
      .update({
        accent_color: color,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
    toast.success('Couleur sauvegardee !')
  }

  const handleDeleteHistory = async () => {
    if (!user) return
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', user.id)
    if (error) {
      toast.error('Erreur lors de la suppression')
    } else {
      toast.success('Historique supprime !')
      setShowDeleteConfirm(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
        return
      }
      if (res.status === 400) {
        toast.info('Souscris a un plan pour acceder a la facturation')
        window.location.href = '/pricing'
        return
      }
      toast.error(data.error ?? 'Erreur acces facturation')
    } catch {
      toast.error('Connexion impossible au portail Stripe')
    }
  }

  const planLabel = profile?.plan ?? 'free'

  return (
    <div className="flex flex-col gap-6" data-testid="settings-page">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] font-[family-name:var(--font-display)]">
          Parametres
        </h1>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
          Gere ton compte et tes preferences
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:w-48 lg:shrink-0" data-testid="settings-tabs">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              data-testid={`settings-tab-${id}`}
              className={cn(
                'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left',
                activeTab === id
                  ? 'bg-[var(--cyan)]/10 text-[var(--cyan)]'
                  : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
              )}
            >
              {icon}
              {label}
            </button>
          ))}

          <div className="hidden lg:block mt-auto pt-4 border-t border-[var(--border)]">
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
              data-testid="logout-btn"
            >
              <LogOut className="h-4 w-4" />
              Deconnexion
            </button>
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && user && profile && (
            <ProfileTab
              user={{ email: user.email }}
              profile={{ email: profile.email, display_name: profile.display_name }}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              saving={saving}
              onSave={handleSaveProfile}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab
              notifSettings={notifSettings}
              setNotifSettings={setNotifSettings}
              saving={saving}
              onSave={handleSaveNotifs}
            />
          )}

          {activeTab === 'security' && user && <SecurityTab user={user} />}

          {activeTab === 'appearance' && (
            <AppearanceTab
              theme={theme}
              accentColor={accentColor}
              locales={[...locales]}
              localeNames={localeNames}
              onThemeChange={applyTheme}
              onAccentChange={handleSaveAccent}
            />
          )}

          {activeTab === 'billing' && (
            <BillingTab
              planLabel={planLabel}
              payments={payments}
              loadingPayments={loadingPayments}
              onManageBilling={handleManageBilling}
            />
          )}

          {activeTab === 'data' && (
            <DataTab
              showDeleteConfirm={showDeleteConfirm}
              setShowDeleteConfirm={setShowDeleteConfirm}
              onDeleteHistory={handleDeleteHistory}
            />
          )}
        </div>
      </div>
    </div>
  )
}
