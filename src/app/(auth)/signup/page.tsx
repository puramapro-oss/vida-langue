'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Check, Leaf, Sparkles, Globe, Heart } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'

function getPasswordStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const STRENGTH_LABELS = ['Trop court', 'Faible', 'Moyen', 'Fort', 'Excellent']
const STRENGTH_COLORS = ['bg-red-500', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500']

export default function SignupPage() {
  const router = useRouter()
  const { signUp, signInWithGoogle } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [cguAccepted, setCguAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const strength = getPasswordStrength(password)
  const passwordsMatch = password === confirmPassword
  const confirmError = confirmPassword && !passwordsMatch ? 'Les mots de passe ne correspondent pas' : ''

  const canSubmit =
    name.trim().length > 0 &&
    email.length > 0 &&
    password.length >= 8 &&
    passwordsMatch &&
    cguAccepted

  async function handleGoogleSignup() {
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      toast.error('Erreur Google : ' + (error.message ?? 'Connexion impossible'))
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    const { error } = await signUp(email, password, name.trim())
    setLoading(false)
    if (error) {
      toast.error('Erreur lors de la création du compte : ' + (error.message ?? 'Réessaie plus tard'))
      return
    }
    try {
      await fetch('/api/referral/attribute', { method: 'POST' })
    } catch {
      // attribution non bloquante
    }
    toast.success('Compte créé ! Bienvenue sur Vida Langue 🌱')
    router.push('/onboarding')
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background ambiance */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-[480px] w-[480px] rounded-full bg-emerald-500/15 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-teal-400/12 blur-[140px]" />
      </div>

      {/* Top bar */}
      <div className="px-4 sm:px-8 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] items-center">
          {/* LEFT — narrative panel (hidden on mobile) */}
          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/5 px-4 py-2 text-xs font-medium text-emerald-300">
              <Leaf className="h-3 w-3" />
              14 jours d&apos;essai gratuit
            </div>
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-5xl xl:text-6xl font-bold tracking-[-0.025em] leading-[1.05]">
              <span className="block text-[var(--text-primary)]">Parle une langue.</span>
              <span className="block gradient-text">Pas l&apos;inverse.</span>
            </h1>
            <p className="mt-5 text-lg text-[var(--text-secondary)] max-w-md leading-relaxed">
              La phonétique Vida s&apos;adapte à ta langue maternelle. Sans cours, sans grammaire, sans honte.
            </p>

            <ul className="mt-8 space-y-3 max-w-md">
              {[
                { icon: Sparkles, text: '8 modes d\'apprentissage — neuro, vocal, immersif, hypno…' },
                { icon: Globe, text: 'Toutes les langues — calibrées sur ta langue maternelle' },
                { icon: Heart, text: '10 % du CA reversé à l\'Association Vida' },
                { icon: Check, text: 'Annulation en 1 clic, à tout moment' },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                  <span className="mt-0.5 grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg border border-emerald-400/20 bg-emerald-500/10">
                    <item.icon className="h-3.5 w-3.5 text-emerald-300" />
                  </span>
                  <span className="leading-relaxed pt-1">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — form card */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <div className="glass rounded-3xl border border-emerald-400/15 p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.08)]">
              <div className="mb-6 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    <Leaf className="h-4 w-4 text-emerald-950" strokeWidth={2.5} />
                  </div>
                  <span className="font-[family-name:var(--font-display)] text-xl font-bold gradient-text">
                    Vida Langue
                  </span>
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">
                  Crée ton compte
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  14 jours offerts. Sans carte bancaire.
                </p>
              </div>

              {/* Google OAuth */}
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                loading={googleLoading}
                data-testid="google-signup"
                onClick={handleGoogleSignup}
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
                  id="name"
                  label="Prénom"
                  type="text"
                  placeholder="Alice"
                  autoComplete="given-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="name-input"
                  required
                />
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
                <div className="flex flex-col gap-1.5">
                  <Input
                    id="password"
                    label="Mot de passe"
                    type="password"
                    placeholder="8 caractères minimum"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="password-input"
                    required
                  />
                  {password.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              'h-1 flex-1 rounded-full transition-all duration-300',
                              strength >= i ? STRENGTH_COLORS[strength] : 'bg-white/10'
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        {STRENGTH_LABELS[strength]}
                      </p>
                    </div>
                  )}
                </div>
                <Input
                  id="confirmPassword"
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  data-testid="confirm-password-input"
                  error={confirmError}
                  required
                />

                <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-emerald-400"
                    checked={cguAccepted}
                    onChange={(e) => setCguAccepted(e.target.checked)}
                    data-testid="cgu-checkbox"
                  />
                  <span className="leading-snug">
                    J&apos;accepte les{' '}
                    <Link href="/cgu" className="text-emerald-300 hover:underline" target="_blank">
                      Conditions Générales
                    </Link>{' '}
                    et la{' '}
                    <Link href="/politique-confidentialite" className="text-emerald-300 hover:underline" target="_blank">
                      Politique de confidentialité
                    </Link>
                  </span>
                </label>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="mt-2 w-full"
                  loading={loading}
                  disabled={!canSubmit}
                  data-testid="signup-button"
                >
                  Créer mon compte
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                Déjà un compte ?{' '}
                <Link href="/login" className="font-medium text-emerald-300 hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
