'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Loader2, Sparkles, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { LEARNING_LANGUAGES, APP_NAME } from '@/lib/constants'

type Step = 'welcome' | 'native' | 'learning' | 'identity' | 'starting'

const IDENTITY_TEMPLATES: Record<string, string[]> = {
  en: [
    'I am someone who lives in English',
    'I speak English with confidence',
    'I think in English',
  ],
  es: [
    'Soy alguien que vive en español',
    'Hablo español con confianza',
    'Pienso en español',
  ],
  it: ['Sono qualcuno che vive in italiano', 'Parlo italiano con fiducia'],
  de: ['Ich bin jemand, der auf Deutsch lebt', 'Ich spreche fließend Deutsch'],
  pt: ['Eu sou alguém que vive em português', 'Eu falo português com confiança'],
  ja: ['私は日本語で生きている人です', '日本語で考えます'],
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = createClient()
  const [step, setStep] = useState<Step>('welcome')
  const [native, setNative] = useState('fr')
  const [learning, setLearning] = useState<string | null>(null)
  const [identity, setIdentity] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?next=/onboarding')
  }, [authLoading, user, router])

  useEffect(() => {
    if (profile?.onboarding_completed) router.replace('/dashboard')
  }, [profile, router])

  async function finish() {
    if (!user || !learning) return
    setSaving(true)
    setStep('starting')
    try {
      const trialEnd = new Date(Date.now() + 14 * 86400 * 1000).toISOString()
      const { error } = await supabase
        .from('profiles')
        .update({
          language_native: native,
          languages_learning: [learning],
          subscription_status: 'trial',
          subscription_plan: 'monthly',
          trial_ends_at: trialEnd,
          onboarding_completed: true,
          plan: 'automate',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        toast.error('VEDA n\'a pas pu graver ton choix. Retente.')
        setSaving(false)
        setStep('identity')
        return
      }

      void supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          language: learning,
          level: 1,
          fluency_percent: 0,
          phonetic_graduation: 'full_phonetic',
        }, { onConflict: 'user_id,language' as never })

      await new Promise(r => setTimeout(r, 1200))
      router.push('/dashboard')
    } catch {
      toast.error('Connexion perdue. Respire, retente.')
      setSaving(false)
      setStep('identity')
    }
  }

  const learningMeta = LEARNING_LANGUAGES.find(l => l.code === learning)
  const templates = learning ? (IDENTITY_TEMPLATES[learning] ?? IDENTITY_TEMPLATES.en) : []

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-nebula)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-emerald-400/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
                <Heart className="h-8 w-8 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight md:text-5xl">
                Bienvenue sur {APP_NAME}
              </h1>
              <p className="mx-auto mt-4 max-w-md text-[var(--text-secondary)]">
                Pas de cours. Pas de stress. Juste ta voix, ton souffle, et la langue qui se grave.
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-emerald-400">
                14 jours offerts. Aucun engagement.
              </p>
              <Button
                onClick={() => setStep('native')}
                size="lg"
                className="mt-8 !bg-gradient-to-r !from-emerald-500 !to-emerald-600 !text-white"
                data-testid="start-onboarding"
              >
                Commencer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === 'native' && (
            <motion.div
              key="native"
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <div className="mb-6 text-center">
                <p className="text-xs uppercase tracking-wider text-emerald-400">Étape 1 sur 3</p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
                  Quelle langue est ton chez-toi ?
                </h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  VEDA adapte la phonétique à ta langue maternelle.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {LEARNING_LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setNative(l.code)}
                    className={`flex flex-col items-center gap-1 rounded-2xl border p-3 transition-all ${
                      native === l.code
                        ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100 scale-105'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/30'
                    }`}
                    data-testid={`native-${l.code}`}
                  >
                    <span className="text-2xl">{l.flag}</span>
                    <span className="text-xs">{l.name}</span>
                  </button>
                ))}
              </div>
              <Button
                onClick={() => setStep('learning')}
                size="lg"
                className="mt-6 w-full !bg-gradient-to-r !from-emerald-500 !to-emerald-600 !text-white"
                data-testid="next-native"
              >
                Continuer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === 'learning' && (
            <motion.div
              key="learning"
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <div className="mb-6 text-center">
                <p className="text-xs uppercase tracking-wider text-emerald-400">Étape 2 sur 3</p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
                  Quelle langue veux-tu graver ?
                </h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Choisis-en une pour commencer. Tu pourras en ajouter plus tard.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {LEARNING_LANGUAGES.filter(l => l.code !== native).map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLearning(l.code)}
                    className={`flex flex-col items-center gap-1 rounded-2xl border p-3 transition-all ${
                      learning === l.code
                        ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100 scale-105'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/30'
                    }`}
                    data-testid={`learning-${l.code}`}
                  >
                    <span className="text-2xl">{l.flag}</span>
                    <span className="text-xs">{l.name}</span>
                  </button>
                ))}
              </div>
              <Button
                onClick={() => setStep('identity')}
                size="lg"
                disabled={!learning}
                className="mt-6 w-full !bg-gradient-to-r !from-emerald-500 !to-emerald-600 !text-white"
                data-testid="next-learning"
              >
                Continuer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === 'identity' && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <div className="mb-6 text-center">
                <p className="text-xs uppercase tracking-wider text-emerald-400">Étape 3 sur 3</p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
                  Ton identité linguistique
                </h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Choisis ou écris la phrase qui te définit en {learningMeta?.name}. VEDA la grave.
                </p>
              </div>
              <Card className="p-5">
                <div className="space-y-2">
                  {templates.map(t => (
                    <button
                      key={t}
                      onClick={() => setIdentity(t)}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        identity === t
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-100'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                      data-testid={`template-${t}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="Ou écris la tienne…"
                  maxLength={120}
                  className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none"
                  data-testid="identity-input"
                />
              </Card>
              <Button
                onClick={finish}
                size="lg"
                disabled={saving}
                loading={saving}
                className="mt-6 w-full !bg-gradient-to-r !from-emerald-500 !to-emerald-600 !text-white"
                data-testid="finish-onboarding"
              >
                Démarrer mon essai 14 jours <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === 'starting' && (
            <motion.div
              key="starting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
                {saving ? (
                  <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
                ) : (
                  <Check className="h-10 w-10 text-emerald-400" />
                )}
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
                VEDA grave ton univers…
              </h2>
              <p className="mt-2 text-[var(--text-secondary)]">Quelques secondes.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
