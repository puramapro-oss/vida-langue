'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Copy, Check, Crown, Sparkles, ArrowRight, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'

// Paliers Ambassadeur — alignés avec /dashboard/ambassadeur
const AMBASSADOR_TIERS = [
  { name: 'Bronze', min: 0, color: '#CD7F32', emoji: '🥉' },
  { name: 'Argent', min: 5, color: '#C0C0C0', emoji: '🥈' },
  { name: 'Or', min: 25, color: '#FFD700', emoji: '🥇' },
  { name: 'Platine', min: 100, color: '#E5E4E2', emoji: '💎' },
  { name: 'Diamant', min: 500, color: '#B9F2FF', emoji: '💠' },
  { name: 'Légende', min: 2000, color: '#FF6B6B', emoji: '👑' },
  { name: 'Éternel', min: 10000, color: '#FFB86C', emoji: '✨' },
] as const

// Cross-promo : VEDA (langue) → AKASHA (multi-IA)
// Mapping depuis design.md §15 : VEDA cohérent avec AKASHA chat IA polyglotte
const CROSS_PROMO = {
  source: 'veda',
  target: { slug: 'akasha', name: 'AKASHA', emoji: '🪐', color: '#00d4ff', desc: 'Multi-IA orchestré pour explorer le monde sans limite.' },
  url: 'https://akasha.purama.dev/go/veda?coupon=WELCOME50',
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function formatBalance(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export default function HomeBlocks() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [referrals, setReferrals] = useState<{ count: number; earningsCents: number }>({ count: 0, earningsCents: 0 })
  const [copied, setCopied] = useState(false)

  const code = profile?.referral_code ?? ''
  const link = code ? `https://vidalangue.purama.dev/go/${code}` : ''

  useEffect(() => {
    if (!profile?.id) return
    let cancelled = false
    void (async () => {
      const { data } = await supabase
        .from('referrals')
        .select('referrer_earning_cents, status')
        .eq('referrer_id', profile.id)
      if (cancelled || !data) return
      const subscribed = data.filter((r) => (r as { status?: string }).status === 'subscribed')
      const earnings = data.reduce((sum, r) => sum + ((r as { referrer_earning_cents?: number }).referrer_earning_cents ?? 0), 0)
      setReferrals({ count: subscribed.length, earningsCents: earnings })
    })()
    return () => { cancelled = true }
  }, [profile?.id, supabase])

  const currentTier = [...AMBASSADOR_TIERS].reverse().find((t) => referrals.count >= t.min) ?? AMBASSADOR_TIERS[0]
  const nextTier = AMBASSADOR_TIERS.find((t) => t.min > referrals.count)
  const progress = nextTier ? Math.min(100, ((referrals.count - currentTier.min) / (nextTier.min - currentTier.min)) * 100) : 100

  const copyLink = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const shareLink = async () => {
    if (!link) return
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'Rejoins-moi sur VEDA',
          text: 'Parle une langue en 30 jours. 14 jours offerts.',
          url: link,
        })
      } catch {
        await copyLink()
      }
    } else {
      await copyLink()
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* BLOC 1 — PARRAINAGE */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} data-testid="home-bloc-referral">
        <Card className="relative h-full overflow-hidden p-5">
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-400/15 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
                <Users className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Parrainage</p>
            </div>

            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              {referrals.count === 0
                ? <>Ton premier filleul te rapporte <span className="font-semibold text-emerald-300">50% du 1er paiement</span> + 10% à vie.</>
                : <><span className="font-semibold text-white">{referrals.count}</span> filleul{referrals.count > 1 ? 's' : ''} actif{referrals.count > 1 ? 's' : ''} · <span className="font-semibold text-emerald-300">{formatBalance(referrals.earningsCents)}</span> gagnés</>
              }
            </p>

            {link && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-2">
                <code className="flex-1 truncate text-xs font-mono text-[var(--text-secondary)]">{link.replace('https://', '')}</code>
                <button
                  onClick={copyLink}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 transition-colors hover:bg-emerald-500/25"
                  aria-label="Copier le lien"
                  type="button"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}

            <button
              onClick={shareLink}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-400"
              type="button"
              data-testid="share-referral-btn"
            >
              Partager mon lien
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </Card>
      </motion.div>

      {/* BLOC 2 — PROGRAMME AMBASSADEUR */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.06 }} data-testid="home-bloc-ambassador">
        <Card className="relative h-full overflow-hidden p-5">
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-400/15 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30">
                <Crown className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Ambassadeur</p>
            </div>

            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              Palier <span className="font-semibold text-white">{currentTier.emoji} {currentTier.name}</span>
              {nextTier && (
                <> — encore <span className="font-semibold text-amber-300">{nextTier.min - referrals.count}</span> filleul{nextTier.min - referrals.count > 1 ? 's' : ''} pour {nextTier.emoji} {nextTier.name}</>
              )}
            </p>

            {nextTier && (
              <div className="mt-4 h-1.5 w-full rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <Link
              href="/dashboard/ambassadeur"
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-300 transition-colors hover:bg-amber-500/20"
              data-testid="apply-ambassador-btn"
            >
              {referrals.count >= 5 ? 'Voir mon dashboard' : 'Postuler comme Ambassadeur'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* BLOC 3 — CROSS-PROMO */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.12 }} data-testid="home-bloc-crosspromo">
        <Card className="relative h-full overflow-hidden p-5">
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl" style={{ background: `${CROSS_PROMO.target.color}20` }} />
          <div className="relative">
            <div className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl ring-1"
                style={{ background: `${CROSS_PROMO.target.color}20`, color: CROSS_PROMO.target.color, borderColor: `${CROSS_PROMO.target.color}40` }}
              >
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: CROSS_PROMO.target.color }}>
                Découvre {CROSS_PROMO.target.name}
              </p>
            </div>

            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              {CROSS_PROMO.target.desc}
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-semibold text-emerald-300">−50% 1er mois</span>
              <span className="rounded-full bg-amber-500/15 px-2.5 py-1 font-semibold text-amber-300">+ 100€ prime</span>
            </div>

            <a
              href={CROSS_PROMO.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors"
              style={{
                background: `${CROSS_PROMO.target.color}15`,
                color: CROSS_PROMO.target.color,
                borderColor: `${CROSS_PROMO.target.color}40`,
              }}
              data-testid="crosspromo-cta"
            >
              Essayer {CROSS_PROMO.target.name} {CROSS_PROMO.target.emoji}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
