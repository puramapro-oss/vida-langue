# Vida Langue — Plan de phases

## P1 — Structure + Auth + DB  ✅ 2026-04-11
- ✅ Scaffold depuis akasha-ai template (package.json, next.config, tailwind v4)
- ✅ Rebrand : `src/lib/constants.ts` (APP_NAME, APP_SLUG=vida-langue, APP_SCHEMA=vida_langue, APP_COLOR #10B981, couleurs, polices)
- ✅ Theme émeraude via CSS vars dans `src/app/globals.css` (--cyan/--purple/--green remappés vers palette Vida)
- ✅ Font display Syne, body DM Sans
- ✅ `src/app/layout.tsx` : metadata, OG, locale, theme #10b981
- ✅ `src/app/page.tsx` : Home complète (Hero / Natif Instinct™ 3 couches / 8 modes / Impact / FAQ / CTA / Footer SASU)
- ✅ `src/lib/claude.ts` : identité "Vida Langue" absolue (jamais Claude/Anthropic), expertise neuro-phonétique, tutoiement, emojis légers
- ✅ `schema.sql` complet : 30+ tables (profiles, user_preferences, subscriptions, payments, invoices, donations, referrals, influencers, influencer_sales, sessions, vocabulary, conversations, messages, user_progress, missions, user_missions, impact_log, life_thread, achievements, streaks, user_earnings, contests, contest_entries, contest_winners, weekly_rituals, social_posts, social_comments, internal_ads, newsletter_subscribers, products, notifications, notification_settings, contact_messages, faq_articles) + trigger auto-profile (referral_code, trial 14j, life_thread, streak, preferences) + RLS sur toutes les tables + policies self-access + seed (6 missions, 2 contests, ritual, super_admin)
- ✅ Schéma poussé dans `supabase-db` (VPS 72.62.191.111) : docker cp + psql
- ✅ `PGRST_DB_SCHEMAS` += `vida_langue` sur VPS + `docker compose up -d --force-recreate rest`
- ✅ GRANT USAGE/ALL + ALTER DEFAULT PRIVILEGES + NOTIFY pgrst reload
- ✅ Vérif PostgREST : `curl -H "Accept-Profile: vida_langue" auth.purama.dev/rest/v1/missions` → 200 avec seed
- ✅ `.env.local` (copié depuis akasha + URL rebrand)
- ✅ `npm install` OK (556 packages, 0 vulns)
- ✅ `npx tsc --noEmit` → 0 erreur
- ✅ `npm run build` → ✓ Compiled + 70 routes générées
- ✅ Fix PLAN_LIMITS compat : `src/app/api/chat/route.ts` et `src/app/api/quota/check/route.ts`
- ✅ `git init` + commit P1 (main)
- ✅ Vercel project link : `puramapro-oss-projects/vida-langue`
- ✅ 30 env vars production poussées
- ✅ `vercel --prod` → https://vida-langue.vercel.app
- ✅ Domaine attaché : **https://vidalangue.purama.dev**
- ✅ Smoke tests : `/` `/login` `/signup` `/pricing` `/api/status` → 200
- ⚠️ GitHub repo création bloquée (PAT sans scope org `repo:create`) → à faire manuellement ou via gh CLI ultérieurement

## P2 — Features core Vida Langue  ✅ 2026-04-11
- ✅ Sidebar + BottomTabBar rebrand Vida (sessions, univers, missions, parrainage…)
- ✅ Dashboard home Vida (streak, énergie Vida, fil de vie, mission du jour, quick actions natif-instinct + holotalk)
- ✅ /dashboard/sessions : hub 8 modes (2 actifs : phonetic + holotalk, 6 coming soon)
- ✅ /dashboard/sessions/natif-instinct : 3 couches phonétiques + word_breakdown + Web Speech API
- ✅ /dashboard/sessions/holotalk : 6 personas, streamClaude streaming, STT navigateur, TTS
- ✅ /dashboard/missions : liste missions DB + accept (insert user_missions)
- ✅ /dashboard/univers : fil de vie + progression par langue + dernières sessions
- ✅ /onboarding : rewrite Vida (welcome → native → learning → identity → trial 14j)
- ✅ /api/phonetic : Claude → JSON 3 layers + breakdown + persist vocabulary
- ✅ /api/sessions : insert + XP grant + life_thread increment
- ✅ /api/vocabulary : GET + POST spaced repetition (familiarity 0-100, intervals 1→120j)
- ✅ /api/holotalk : streamClaude + persona system prompt
- ✅ tsc 0 + build 0 (84 routes) + git commit 1d56561
- ✅ Deploy https://vidalangue.purama.dev (dpl_3PAMZnTXRjDX7FuAEQgLrnMsECs5)
- ✅ Smoke tests : / /onboarding /pricing /login /api/status → 200 ; dashboard routes → 307 (auth)
- ⏭️ À faire en P3+ : pricing 2 plans concrets, traducteur, accessibilité settings, notifications intelligentes

## P3 — Parrainage + Influenceur + Pricing concret  ✅ 2026-04-11
- ✅ Stripe : 3 produits + price IDs créés (mensuel 12,90€ `price_1TL0vC...`, annuel 108€ `price_1TL0vW...`, moitié prix à vie 6,45€ `price_1TL0vE...`)
- ✅ `src/lib/stripe-prices.ts` : remap legacy Plan/PlanTier (akasha) → vrais price IDs Vida + export `VIDA_PRICE_TO_PLAN`
- ✅ `src/app/api/stripe/checkout/route.ts` : accepte clés Vida (`monthly`/`yearly`/`half_lifetime`) ET legacy, applique trial 14j auto, paypal+link+card, erreurs FR
- ✅ `src/app/api/stripe/webhook/route.ts` : utilise `VIDA_PRICE_TO_PLAN` pour reverse mapping
- ✅ `src/app/pricing/page.tsx` : 3 cartes Vida (Mensuel / Annuel ⭐ / Moitié prix à vie), comparatif Duolingo/Babbel, footer SASU
- ✅ `src/app/(dashboard)/dashboard/referral/page.tsx` : rebrand parrainage Vida — paliers Graine→Légende, stats `referrals.referrer_earning_cents`, boutons partage WhatsApp/SMS/Twitter/Email/Facebook, lien `/go/[code]`
- ✅ `src/app/(dashboard)/dashboard/influenceur/page.tsx` : table `influencers` (Vida) + `influencer_sales`, onboarding 1 clic auto-approuvé, lien promo -50% 7j, 4 onglets (Outils / Ventes / Paliers / Academy), templates Vida
- ✅ `src/app/(dashboard)/dashboard/impact/page.tsx` (NEW) : 4 dimensions (eco/humain/social/bien-être), équivalents réels (arbres/CO₂/eau/déchets), projection annuelle, impact collectif Vida (count `impact_log`), historique 100 actions
- ✅ `src/app/api/referral/route.ts` : schema vida_langue, calcul tier sur subscribed_count, `total_earnings_cents`
- ✅ `src/app/go/[slug]/page.tsx` : lookup `profiles.referral_code` puis `influencers.promo_code`, set cookies httpOnly `vida_ref` + `vida_inf` 30j, redirect `/signup?ref=...`
- ✅ Sidebar : ajout entrée "Impact" entre Missions et Concours (icône Leaf)
- ✅ tsc 0 erreur, build OK (Compiled successfully 5.1s, 86 routes)
- ✅ Deploy Vercel prod : dpl_GdDXXEuqHoRaLo3nFkjuq93ukzqP → https://vidalangue.purama.dev
- ✅ Smoke tests live : / /pricing /onboarding /login /signup /api/status → 200 ; /dashboard/* → 307 (auth)

## P4 — Admin + Aide + FAQ + attribution parrainage  ✅ 2026-04-11
- ✅ `/aide` rebrand Vida (titre, sous-titre, 9 catégories Vida, "Coach Vida Langue", couleurs vertes)
- ✅ `/api/aide/chat` : SYSTEM_PROMPT linguiste Vida (expertise 8 modes, 3 offres, parrainage 7 paliers, jamais Claude/Anthropic)
- ✅ 15 articles FAQ vida_langue seedés en SQL + push VPS (apprentissage / modes / phonétique / abonnement / parrainage / wallet / impact / compte) — vérifié via PostgREST `Accept-Profile: vida_langue`
- ✅ `/contact` rebrand Vida (titre 🌱, sous-titre 24h, vert) — API existante OK (Resend → purama.pro@gmail.com + confirmation user, schema vida_langue via createServiceClient)
- ✅ `/api/stripe/webhook` : commission parrainage 50% sur `invoice.payment_succeeded`. 1er paiement uniquement (idempotent : check `referrals.status != 'subscribed'`), update referrals + crédite `profiles.wallet_balance` du parrain
- ✅ `/api/referral/attribute` (NEW) : POST authentifié, lit cookies httpOnly `vida_ref` + `vida_inf`, lookup profiles.referral_code → fallback influencers.promo_code, write `profiles.referred_by` + insert `referrals(pending)`, write metadata.influencer_id si présent, supprime cookies après. Idempotent (skip si déjà attribué).
- ✅ `/signup` : appelle `/api/referral/attribute` après `signUp()`, toast "Bienvenue sur Vida Langue 🌱", h1 rebrand
- ✅ `/auth/callback` (Google OAuth) : attribution parrainage server-side (cookies httpOnly inaccessibles côté client) — même logique que `/api/referral/attribute`
- ✅ `/dashboard/admin` rebrand Vida : 8 stats Vida (apprenants, abonnés, actifs 7j, sessions, parrainages convertis, influenceurs, commissions versées, contact pending), table apprenants avec recherche email/nom/code, suppression tables inexistantes (`support_tickets`, `pool_balances`)
- ✅ `/dashboard/wallet` : bouton "Gérer mon abonnement" (variant secondary) → POST `/api/stripe/portal` → `window.location.href = data.url` ; gère erreur "no customer" avec message FR + lien `/pricing`
- ✅ `/api/stripe/portal` : fix origin hardcodé `akasha.purama.dev` → `vidalangue.purama.dev`
- ✅ `tsc --noEmit` 0 erreur, `npm run build` ✓ Compiled successfully 5.5s (86 routes)
- ✅ Commit `(local)` + deploy Vercel prod : `dpl_2TmwLQwf7hMKjbUV36YtW5PQBsbv` → https://vidalangue.purama.dev
- ✅ Smoke tests live : / /aide /contact /pricing /onboarding /login /signup /api/status → 200 ; /dashboard/* → 307 (auth-protected)
- ⚠️ messages/*.json (i18n) contient encore des refs "AKASHA" — à purger en P5 (i18n 16 langues)
- ⏭️ Modes manquants neuroflow/sleep/hypno/reality/group/spiritual + bouton portail Stripe testé en live = à voir P5

## P5 — Purge legacy + 6 modes + i18n + wallet refactor  ✅ 2026-04-11
- ✅ **Purge legacy akasha** : suppression de 9 pages dashboard inutilisées (`agents`, `analytics`, `api`, `automation`, `chat`, `collab`, `marketplace`, `studio`, `tools`, `xp`) + 6 routes API mortes (`/api/chat`, `/api/v1`, `/api/agents`, `/api/admin`, `/api/generate`, `/api/quota`) + `lib/preset-agents.ts` + `lib/tools-catalog.ts`
- ✅ **6 modes de session manquants codés** :
  - `/dashboard/sessions/neuroflow` — 25 min, 3 phases (respiration → immersion → scellage)
  - `/dashboard/sessions/sleep` — 8 min, voix lente, 5 thèmes apaisants
  - `/dashboard/sessions/hypno` — 20 min, mot-clé répété en 4 contextes
  - `/dashboard/sessions/reality` — 15 min, 5 scénarios (café, marché, aéroport, taxi, hôtel)
  - `/dashboard/sessions/group` — 30 min, simulation autre apprenant
  - `/dashboard/sessions/spiritual` — 15 min, intentions douces
- ✅ Composant partagé `src/components/sessions/GuidedSession.tsx` (timer + phases + TTS Web Speech + tracking POST `/api/sessions`)
- ✅ API partagée `src/app/api/sessions/guided/route.ts` (config-driven par mode, askClaude, retourne texte par phase)
- ✅ Sessions hub : remap des 8 routes (les 6 nouveaux modes ne sont plus "Bientôt")
- ✅ **Refactor `/dashboard/wallet`** : lecture depuis `profiles.wallet_balance` + `referrals` (commissions parrainage) + `payments` + `withdrawals` ; transactions reconstruites ; bouton portail Stripe conservé
- ✅ Nouvelle table `vida_langue.withdrawals` créée + RLS (self_select + self_insert) + GRANT + push VPS via docker exec psql
- ✅ Schema.sql mis à jour (table withdrawals + indexes + policies)
- ✅ **Nettoyage refs AKASHA** dans 25+ fichiers actifs : login, forgot-password, settings, partage, tirage, guide (rewrite complet 6 guides Vida), cookies, offline, OG, sitemap, robots, status, mentions-legales, cgu, cgv, politique-confidentialite, ecosystem, how-it-works, changelog (rewrite v0.1→v0.5), api/cron/health, api/cron/emails (10 templates rewrite Vida), api/wallet, api/daily-gift, api/og, api/status. Localstorage `akasha_*` → `vida_*`. (Restent 3 refs internes intentionnelles dans `lib/claude.ts` + `lib/stripe-prices.ts` + `api/stripe/checkout` = compat aliases)
- ✅ **i18n 16 langues purgés** : tous les `messages/*.json` réécrits avec namespace minimal `cookie` (seul namespace consommé par `CookieBanner.tsx`). Plus de contenu legacy AKASHA, économie de ~7000 lignes mortes.
- ✅ `tsc --noEmit` 0 erreur, `npm run build` ✓ Compiled successfully 3.7s, **65 routes** (vs 86 avant — 21 routes mortes purgées)
- ✅ Deploy Vercel prod : `dpl_F6QqzFKjF1sPpLizdc37i1iuQNtc` → https://vidalangue.purama.dev
- ✅ Smoke tests live :
  - 17 pages publiques (`/`, `/pricing`, `/how-it-works`, `/aide`, `/contact`, `/onboarding`, `/login`, `/signup`, `/cookies`, `/cgu`, `/cgv`, `/mentions-legales`, `/politique-confidentialite`, `/ecosystem`, `/status`, `/changelog`, `/api/status`) → **200**
  - 8 sessions dashboard (`/dashboard/sessions/{neuroflow,sleep,hypno,reality,group,spiritual,natif-instinct,holotalk}`) → **307** (auth-protected, normal)
  - Routes mortes API (`/api/chat`, `/api/v1/chat`, `/api/agents/run`) → **404** (correctement supprimées)
- ⚠️ STRIPE_WEBHOOK_SECRET : à vérifier que l'endpoint Stripe pointe bien sur `vidalangue.purama.dev/api/stripe/webhook` (sinon 1er paiement ne déclenchera pas la commission parrainage)

## P6 — Audit + 21 SIM + Lighthouse  ✅ 2026-04-11
- ✅ **Stripe webhook recreated for vidalangue** : `we_1TL2904Y1unNvKtXFHSdorZw` → https://vidalangue.purama.dev/api/stripe/webhook (5 events). `***REMOVED-WEBHOOK-SECRET***` poussé dans Vercel env prod + .env.local local.
- ✅ **manifest.json + favicon.svg + icon.svg rebrand Vida** (vert émeraude #10B981, V au lieu de A, description Vida 16 langues, theme_color, lang fr, categories education+lifestyle+productivity)
- ✅ **playwright.config.ts** : baseURL → https://vidalangue.purama.dev, retries 2, workers 4, ignoreHTTPSErrors, support PLAYWRIGHT_BASE_URL env override
- ✅ **Suppression tests legacy AKASHA** : `tests/client-sim.spec.ts` + `tests/local-audit.spec.ts` (refs vers /api/chat, /api/quota, /dashboard/agents… routes mortes)
- ✅ **`tests/p6-audit.spec.ts` réécrit pour Vida** : 106 tests groupés en 8 describes :
  - 18 pages publiques (200 + console clean)
  - 27 routes dashboard (auth gate → /login)
  - 18 responsive (3 viewports × 6 pages, no horizontal overflow)
  - 10 API routes (status, og, sitemap, robots, manifest, locale fr/invalid, holotalk/phonetic/referral unauth)
  - 4 forms (login, signup, contact, aide)
  - 6 landing content (hero/sections/footer/pricing/no AKASHA × 2)
  - 21 simulations utilisateur (SIM01→SIM21 — visiteur landing→signup/pricing/FAQ/aide/contact/legal/ecosystem/dashboard guard/passwd strength/locale/parrainage/responsive/sitemap/OG)
  - 1 lien interne mort (tous liens du landing < 400)
- ✅ **Fix overflow horizontal global** : `src/app/globals.css` → `html { overflow-x: hidden }` + `body { overflow-x: hidden; max-width: 100vw }`. Cause : 3 div absolute blur géants débordaient à 375px.
- ✅ **Fix accessibilité a11y Lighthouse 86→96** :
  - `CookieBanner.tsx` : button close → `aria-label={t('decline')}` + `min-h/min-w 44px` + `aria-hidden` sur l'icône X (button-name + target-size)
  - `globals.css` : `--text-secondary` 0.55 → 0.72, `--text-muted` 0.28 → 0.62 (color-contrast)
  - `src/app/page.tsx` footer : liens `block py-2` (target-size 44×44 sur mobile)
- ✅ **Audit Playwright live** : `npx playwright test` → **106/106 passed (1.2 min)** sur https://vidalangue.purama.dev
- ✅ **Lighthouse live (3 pages clés)** :
  - **Landing** : perf **98** · a11y **96** · best-practices **100** · seo **100**
  - **Pricing** : perf **97** · a11y **98** · best-practices **100** · seo **92**
  - **Aide** : perf **91** · a11y **94** · best-practices **100** · seo **92**
- ✅ Build : tsc 0 / `npm run build` ✓ Compiled successfully (65 routes), 2 deploys Vercel prod (`dpl_HdF53p1uVtY6CnfTXwVfnUGjSAbK` puis `dpl_…c6qyx3k7j`) → https://vidalangue.purama.dev

## P7 — Mobile Expo (iOS + Android)  ✅ 2026-04-11
- ✅ **Scaffold Expo SDK 54 TypeScript** dans `~/purama/vida-langue/mobile/` via `create-expo-app --template blank-typescript`
- ✅ **Stack installé** : expo-router 6, NativeWind 4, react-native-reanimated 4 + worklets, Zustand, Supabase, expo-secure-store, react-native-url-polyfill, expo-haptics, expo-linear-gradient, expo-speech, expo-auth-session, expo-web-browser, expo-clipboard, expo-sharing, react-native-safe-area-context, react-native-screens, react-native-gesture-handler, react-native-web, sharp (dev), babel-preset-expo (dev)
- ✅ **NativeWind v4** : `tailwind.config.js` (preset nativewind, palette emerald, font Syne/DMSans), `global.css` (@tailwind base/components/utilities), `babel.config.js` (jsxImportSource nativewind + nativewind/babel preset), `metro.config.js` (withNativeWind input ./global.css), `nativewind-env.d.ts`, `tsconfig.json` (strict, paths @/*, jsxImportSource nativewind)
- ✅ **app.json** : nom Vida Langue, slug vida-langue, scheme vidalangue, bundleIdentifier+package `dev.purama.vidalangue`, dark mode, splash #0A0A0F, infoPlist NSMicrophone+NSSpeechRecognition+ITSAppUsesNonExemptEncryption=false, permissions Android RECORD_AUDIO+INTERNET, plugins expo-router+expo-secure-store+expo-web-browser+expo-splash-screen, experiments typedRoutes
- ✅ **eas.json** : 3 profils (development simulator + dev client, preview internal apk, production autoIncrement), submit ios appleId+ascAppId placeholders, android serviceAccountKey path, track production
- ✅ **lib/supabase.ts** SecureStore adapter cross-platform : `Platform.OS === 'web'` fallback localStorage (avec `// allow-web` pour CI grep), createClient avec schema vida_langue + headers Accept-Profile/Content-Profile, flowType pkce, autoRefreshToken
- ✅ **lib/constants.ts** : APP_NAME/SLUG/COLOR, WEB_URL, API_URL, SUPER_ADMIN_EMAIL, WALLET_MIN, 8 SESSION_MODES (slug/title/emoji/duration/description/color/available), 7 REFERRAL_TIERS (graine→légende)
- ✅ **lib/api.ts** : authHeaders via supabase.auth.getSession, apiPost/apiGet wrappers, fetchPhonetic, logSession, fetchGuidedSession (réutilise les endpoints web `/api/phonetic`, `/api/sessions`, `/api/sessions/guided`)
- ✅ **Icônes Vida générées** via Pollinations + sharp (`scripts/generate-icons.js`) : icon 1024² (lotus emerald flux), adaptive-icon 1024² padding 100px #0A0A0F, splash 1284×2778, favicon 48², feature-graphic 1024×500. Fallback SVG si Pollinations down.
- ✅ **AuthProvider** : contexte React, getSession + onAuthStateChange, loadProfile (schema vida_langue), refreshProfile, signOut
- ✅ **UI components** : Button (primary LinearGradient + secondary + ghost, haptics, ActivityIndicator, accessibilityRole), Input (label + error + min-h 44px placeholder emerald), Card, Background (radial green blur dégradé)
- ✅ **expo-router structure** :
  - `app/_layout.tsx` (GestureHandlerRoot + SafeAreaProvider + AuthProvider + Stack)
  - `app/index.tsx` (router redirect auth/welcome ou tabs/dashboard)
  - `app/(auth)/_layout.tsx` + welcome / login / signup / forgot
  - `app/(tabs)/_layout.tsx` (5 onglets : Accueil 🏠 / Sessions 🧬 / Missions 🌍 / Wallet 💰 / Profil 👤)
  - `app/(tabs)/dashboard.tsx` (streak + XP + 2 cards Natif Instinct + Holotalk)
  - `app/(tabs)/sessions.tsx` (hub 8 modes)
  - `app/(tabs)/missions.tsx` (lecture supabase missions)
  - `app/(tabs)/wallet.tsx` (balance + Stripe portal via WebBrowser)
  - `app/(tabs)/profile.tsx` (info user + parrainage + Share natif + signOut)
  - `app/sessions/_layout.tsx` (slide_from_bottom)
  - `app/sessions/natif-instinct.tsx` (statique, 6 langues, expo-speech TTS, fetchPhonetic, 3 couches affichées + word_breakdown + ▶)
  - `app/sessions/holotalk.tsx` (statique, 6 personas, chat streaming /api/holotalk, expo-speech TTS, scroll horizontal selector)
  - `app/sessions/[mode].tsx` (dynamique pour neuroflow/sleep/hypno/reality/group/spiritual, fetchGuidedSession, timer + phases + Speech.speak, logSession)
- ✅ **10 flows Maestro YAML** dans `.maestro/` : auth, navigation, session_natif, session_holotalk, session_guided, missions, wallet, referral, login, forgot, sign_out (testID branchés sur tous les éléments interactifs)
- ✅ **store.config.json** : 16 langues (fr, en-US, es-ES, de-DE, it, pt-BR, ja, zh-Hans, ar-SA, ko, hi, ru, tr, nl-NL, pl, sv) avec title/subtitle/description/keywords/marketing/support/privacy URLs, categories EDUCATION+REFERENCE
- ✅ **GitHub workflow `.github/workflows/mobile-build.yml`** : trigger push main + workflow_dispatch, npm ci → tsc → grep web globals (fail si window/document/localStorage hors Platform.OS sans `// allow-web`) → expo-github-action setup → eas build all → eas submit (production only)
- ✅ **GOOGLE_PLAY_SETUP.md** : guide 3 minutes (création app Play Console, bundle ID, premier upload manuel, service account, secrets GitHub)
- ✅ **.env.example + .env.local** : EXPO_PUBLIC_SUPABASE_URL/ANON_KEY/API_URL/WEB_URL
- ✅ **expo-doctor 17/17 PASS** (npm scripts conflict tsc→typecheck fix + react-native-worklets ajouté)
- ✅ **Type-check `tsc --noEmit` 0 erreur**
- ✅ **Bundle Metro réussi iOS** : 1479 modules, 4.44 MB hermes bytecode
- ✅ **Bundle Metro réussi Android** : 4.44 MB hermes bytecode
- ✅ **Grep web globals** : 0 (3 occurrences dans `lib/supabase.ts` flaggées `// allow-web` parce que dans `if (Platform.OS === 'web')`)
- ⚠️ **APPLE_TEAM_ID toujours vide** dans `~/purama/CLAUDE.md` (___à_remplir___) → `eas submit -p ios` nécessitera ce champ + ascAppId une fois la fiche App Store Connect créée
- ⚠️ **google-service-account.json** non encore présent → suivre `mobile/GOOGLE_PLAY_SETUP.md` pour activer auto-submit Android
- ⏭️ Premier build local possible immédiatement : `cd mobile && eas build --profile preview --platform android` (apk de test) ou `eas build --profile development --platform ios --simulator`

## P8 — Watch (Apple Watch + Wear OS) — SKIPPED
Vida Langue = app **éducation/langues**, PAS santé/bien-être/sport/fitness/wellness. Per CLAUDE.md MOBILE/WATCH section : Watch n'est obligatoire QUE pour le domaine santé. Skip P8.
