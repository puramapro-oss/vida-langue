'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Leaf } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'
  const { signIn, signInWithGoogle } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      toast.error('Erreur Google : ' + (error.message ?? 'Connexion impossible'))
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      toast.error('Identifiants incorrects. Vérifie ton email et mot de passe.')
      return
    }
    router.push(next)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/3 h-[480px] w-[480px] rounded-full bg-emerald-500/15 blur-[140px]" />
        <div className="absolute bottom-0 right-1/3 h-[400px] w-[400px] rounded-full bg-teal-400/12 blur-[140px]" />
      </div>

      <div className="px-4 sm:px-8 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
      </div>

      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="glass rounded-3xl border border-emerald-400/15 p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.08)]">
            <div className="mb-7 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center shadow-[0_0_24px_rgba(16,185,129,0.45)]">
                  <Leaf className="h-4 w-4 text-emerald-950" strokeWidth={2.5} />
                </div>
                <span className="font-[family-name:var(--font-display)] text-2xl font-bold gradient-text">
                  Vida Langue
                </span>
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">
                Content de te revoir 🌱
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Reprends ton fil de vie là où tu l&apos;as laissé.
              </p>
            </div>

            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              loading={googleLoading}
              data-testid="google-login"
              onClick={handleGoogleLogin}
              icon={
                !googleLoading ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                ) : undefined
              }
            >
              Continuer avec Google
            </Button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-emerald-400/10" />
              <span className="text-xs text-[var(--text-muted)]">ou avec email</span>
              <div className="h-px flex-1 bg-emerald-400/10" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                id="email"
                label="Adresse email"
                type="email"
                placeholder="toi@exemple.fr"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="email-input"
                required
              />
              <Input
                id="password"
                label="Mot de passe"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="password-input"
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-emerald-400"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    data-testid="remember-me"
                  />
                  Rester connecté
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-emerald-300 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="mt-2 w-full"
                loading={loading}
                disabled={!email || !password}
                data-testid="login-button"
              >
                Se connecter
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
              Pas encore de compte ?{' '}
              <Link href="/signup" className="font-medium text-emerald-300 hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass w-full max-w-md rounded-3xl p-8 text-center text-[var(--text-muted)]">
          Chargement...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
