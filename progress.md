# VEDA — Progress

## Dernière action (2026-04-23)
**Phase terminée : UPGRADE V7.1 + V4.1 COMPLET (P1 → P5)**

### Résultat final
- **Rebrand VEDA complet** — 0 résidu "Vida Langue" src + mobile + public
- **NAMA-Polyglotte** = nouvelle persona IA (identité unique, 50+ langues, phonétique adaptative par langue maternelle)
- **50+ langues** couvertes (20 familles linguistiques + langues des signes LSF/ASL + langues d'éveil anges/lumière/kundalini)
- **Foundation agentique** `.claude/` locale (agents qa.md 22 checks + security.md 5 niveaux + docs/veda.md)
- **Homepage 3 blocs above-fold** — Hero + 3 modes phares teaser + LiveCounters dynamiques (depuis /api/status)
- **Rename influenceur → ambassadeur** avec 308 permanent redirect + Sidebar + admin stats
- **Paiement V7.1 L221-28** — /confirmation + /settings/abonnement résiliation 3 étapes + prime 20€ wallet 30j
- **OpenTimestamps** — lib/opentimestamps.ts + /api/ots/stamp + /api/ots/verify (horodatage Bitcoin règlements/fiscal)
- **INSEE SIRENE V3.11** — lib/insee.ts + /api/tax/verify-siret (clé universelle INSEE_API_KEY)
- **Stripe Connect Embedded** (V4.1 pas de ca_...) — /api/connect/account + /api/connect/account-session (gated ≥5€ OU prime débloquée)
- **/fiscal** public + **/dashboard/fiscal** user — seuils 1500/2500/3000€ + PDF annuel pdf-lib + OTS stamp + SIRET INSEE
- **Crons fiscal** — /api/cron/fiscal-monthly (alerte seuil) + /api/cron/fiscal-yearly (génère statements 1er janv)
- **Wealth Engine Phase 1 wired** :
  * Flywheel (4 nodes streak/impact/partages/paliers) intégré dashboard home
  * SocialFeed (victoires communauté SANS montants €) intégré dashboard home
  * PrimeTracker (J+X/30 / débloquée / récupérée) intégré /settings/abonnement + /wallet
  * FiscalBanner intégré /wallet + /dashboard/fiscal
  * AmbassadorTier 7 tiers Bronze→Éternel (Bronze/Argent/Or/Platine/Diamant/Légende/Éternel)
- **Migration SQL P3** appliquée VPS : welcome_primes, timestamped_records, fiscal_profiles, fiscal_statements, stripe_connect_accounts + RPC wallet_deduct_prime + subs cancellation columns
- **Shells composants** créés src/components/{engagement,wallet,fiscal}/*.tsx
- **Mobile sync** — mobile/src/lib/constants.ts aligné (AMBASSADOR_TIERS + LANGUAGES_COUNT=60)
- **Playwright V7.1 suite** créée tests/v71-audit.spec.ts (identité, homepage 3 blocs, ambassadeur 308, paiement L221-28, OTS 401/400, INSEE Luhn, /fiscal public, Connect 401, crons 401, console clean, responsive 375px)

### URLs / refs
- Web prod : https://vidalangue.purama.dev
- VPS : 72.62.191.111 (Supabase self-hosted, schema vida_langue)
- Commits : d2b0784 (P1) · 738aed2 (P2) · [P3] · aed3d77 (P4) · [P5]
- Bundle ID mobile : dev.purama.vidalangue

### État global
- **WEB** : 89 routes, tsc 0, build OK, 0 résidu Vida Langue
- **MOBILE** : sync constants aligné web, tsc 0 (P1)
- **DB** : 5 nouvelles tables V7.1 poussées VPS, RLS actif, PostgREST 200
- **Tests** : tests/v71-audit.spec.ts créé (40+ checks V7.1), existants p6-audit (136 tests) à re-valider contre prod post-deploy

### À savoir pour la session suivante
1. OTS lib embarque 7 deps transitives critical/high (LEARNINGS.md 21/04 SUTRA) — acceptées car server-side only, inputs hash-only
2. STRIPE_WEBHOOK_SECRET vérifié `we_1TL2904Y1unNvKtXFHSdorZw` live
3. INSEE_API_KEY universelle dans CLAUDE.md — valable pour VEDA
4. Crons fiscal : configurer Vercel cron ou n8n avec header `x-cron-key: $CRON_SECRET`
5. Stripe Connect Embedded : pas de STRIPE_CONNECT_CLIENT_ID requis (V4.1)
6. Upgrade path next : P6 "POST-DEPLOY" (post-vercel) devrait inclure webhook Stripe Connect `account.updated` pour sync kyc_status + relancer 136+40 tests Playwright

### TERMINÉ ?
- ✅ P1 rename + NAMA + 50+ langues + .claude/
- ✅ P2 ambassadeur + homepage 3 blocs + shells
- ✅ P3 paiement L221-28 + OTS + INSEE + SQL
- ✅ P4 Wealth Engine Phase 1 + Stripe Connect + /fiscal
- ✅ P5 tests + mobile sync + handoff docs
- ⏭️ Deploy prod : `vercel --prod --token $VERCEL_TOKEN --scope puramapro-oss --yes`

## P6 V8 — Refonte Design GOD MODE V5 + ElevenLabs + 3 Blocs ✅ 2026-05-02
### Landing GOD MODE V5
- Hero3D R3F (sphère MeshDistort émeraude + 200 particules teal + Stars 800 + autoRotate)
- CursorGlow follower 350px (mix-blend:screen, hidden touch)
- MagneticButton sur 2 CTAs (spring useSpring 150/15, force 0.3)
- AnimatedCounter stats (0→value 1.5s easeOut, tabular-nums)
- 8 ModeCards palette unique (NeuroFlow violet / HoloTalk émeraude / NatifInstinct cyan / SleepSync bleu / Hypno lavande / Réalité ambre / Groupe rose / Spirituel or) + spotlight hover + tilt 3D + stagger 0.06s
- Method timeline ligne pointillée scroll-draw
- ScrollRevealText "Jour 30. Tu commandes un café. Dans leur langue." mot-par-mot
- FuturePraise désactivé (placeholder flouté + CTA "Rejoins les premiers apprenants")
- FinalCTA section radial gradient teal + magnetic
- NewsletterForm inline footer
- globals.css: aurora-rich, hue-shift, spotlight-card, badgeUnlock, scaleBounce keyframes

### ElevenLabs API (50+ langues)
- /api/elevenlabs/tts proxy Multilingual v2 + auth Supabase 401 + rate limit 100/h + Zod + cache 24h
- /api/newsletter upsert idempotent
- lib/elevenlabs-client.ts cache Map blob + fallback Web Speech
- Remplace speechSynthesis dans GuidedSession + holotalk + natif-instinct
- ELEVENLABS_API_KEY déjà en Vercel prod (22j)

### Dashboard home — 3 BLOCS OBLIGATOIRES
- Bloc 1 Parrainage : lien copiable + share natif + count filleuls + earnings cents
- Bloc 2 Ambassadeur : paliers Bronze→Éternel + progress bar vers prochain palier
- Bloc 3 Cross-promo VEDA→AKASHA WELCOME50 (-50% + 100€ prime)

### Quality
- tsc --noEmit → 0 erreur
- npm run build → 91 routes, 0 warning
- 0 placeholder / TODO / Lorem / console.log final / any TS
- Témoignages désactivés (0 faux contenu)

### Deploy
- Commit 3332e17 → push main → dpl_Gw9P6qFsATQFkNLrNB37nnYwHiwH
- Smoke tests live https://vidalangue.purama.dev : / /pricing /aide /financer /fiscal /api/status → 200, /api/elevenlabs/tts /api/newsletter → 405 (POST only, normal)

### Reste à faire (session suivante)
- Lighthouse > 90 sur Landing/Pricing/Sessions hub (Hero3D peut impacter LCP)
- Playwright re-run 136 tests V7.1 + nouveaux tests Hero3D / 8 modes / ElevenLabs
- Test humain navigation complète : signup → 8 modes → ElevenLabs vraies voix → parrainage end-to-end
