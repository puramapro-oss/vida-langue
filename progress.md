# Vida Langue — Progress

## Derniere action (2026-04-13)
**Phase terminee : AUDIT V5** — /financer + couche spirituelle + boutique + escalade + purge akasha

### Ce qui a ete ajoute
- 11 tables DB (aides, affirmations, awakening_events, gratitude_entries, intentions, breath_sessions, purama_points, point_transactions, point_shop_items, point_purchases, support_escalations)
- /financer wizard 4 etapes + 45 aides seedees + bandeau vert /pricing
- /breathe respiration guidee 3 patterns
- /dashboard/gratitude journal quotidien
- /dashboard/boutique Purama Points
- AffirmationModal au login
- WisdomFooter citations sagesse
- Formulaire escalade /aide → Resend
- Purge refs akasha → vida
- Sidebar enrichie (+Gratitude, +Respiration, +Boutique)
- 80 routes (vs 65 avant)

### Encore a faire (session suivante)
- i18n : enrichir messages/*.json au-dela du namespace cookie (common, nav, auth, dashboard) pour que le switch langue soit reel
- Tester auth email + OAuth reelle sur le site live
- Tester responsive 375px sur les nouvelles pages
- Playwright : ajouter tests pour /financer, /breathe, /gratitude, /boutique
- Phase F : verification finale 23 checks

## Historique precedent (2026-04-11)
**Phase terminee : P7 — Mobile Expo (iOS + Android)** · P8 Watch SKIPPED (app education, pas sante)

### État
- ✅ App Expo SDK 54 / TypeScript scaffoldée dans `~/purama/vida-langue/mobile/`
- ✅ Bundle Metro réussi pour iOS ET Android (1479 modules, 4.44 MB hermes)
- ✅ expo-doctor 17/17 PASS, tsc 0 erreur
- ✅ 0 web global hors `Platform.OS === 'web'` (3 lignes localStorage flaggées `// allow-web` dans le SecureStore adapter)
- ✅ NativeWind v4 + expo-router 6 + 5 onglets + 8 modes de session + auth + wallet + parrainage
- ✅ 10 flows Maestro, store.config 16 langues, GH workflow auto-build/submit, GOOGLE_PLAY_SETUP.md
- ⚠️ Pas encore de build EAS lancé : APPLE_TEAM_ID + ascAppId vides + google-service-account.json absent. Premier build/submit nécessite ces credentials (1 fois).

### URLs / refs
- Web prod : https://vidalangue.purama.dev (P6 toujours live, 106/106 PW)
- Mobile bundle iOS : `_expo/static/js/ios/entry-*.hbc` 4.44 MB
- Mobile bundle Android : `_expo/static/js/android/entry-*.hbc` 4.44 MB
- Bundle ID : `dev.purama.vidalangue`
- Scheme deeplink : `vidalangue://`

### Fichiers critiques créés en P7
**Config**
- `mobile/package.json` (deps Expo SDK 54 + scripts build/submit, main `expo-router/entry`, script `typecheck`)
- `mobile/app.json` (Vida Langue, dark mode, splash #0A0A0F, infoPlist mic+speech, permissions Android, plugins, typedRoutes)
- `mobile/eas.json` (3 profiles dev/preview/production, submit ios+android placeholders)
- `mobile/tailwind.config.js` (preset nativewind, palette emerald, fonts Syne/DMSans)
- `mobile/babel.config.js` (jsxImportSource nativewind + nativewind/babel)
- `mobile/metro.config.js` (withNativeWind input ./global.css)
- `mobile/global.css` (@tailwind base/components/utilities)
- `mobile/nativewind-env.d.ts`
- `mobile/tsconfig.json` (strict, paths @/*, jsxImportSource nativewind)
- `mobile/.env.example` + `mobile/.env.local`
- `mobile/.gitignore` (.env*, google-service-account.json, GoogleService-Info.plist, .maestro/cache)

**Lib**
- `mobile/src/lib/supabase.ts` (SecureStore adapter cross-platform, schema vida_langue, headers Accept-Profile, flowType pkce)
- `mobile/src/lib/constants.ts` (APP_NAME, WEB_URL, API_URL, 8 SESSION_MODES, 7 REFERRAL_TIERS)
- `mobile/src/lib/api.ts` (authHeaders, apiPost/apiGet, fetchPhonetic, logSession, fetchGuidedSession)

**Components**
- `mobile/src/components/AuthProvider.tsx` (contexte React, getSession, onAuthStateChange, loadProfile, signOut)
- `mobile/src/components/Background.tsx` (radial green dégradé)
- `mobile/src/components/ui/Button.tsx` (primary LinearGradient, secondary, ghost, haptics, ActivityIndicator, Card export)
- `mobile/src/components/ui/Input.tsx` (label + error + min-h 44px placeholder emerald)

**Routes (expo-router)**
- `mobile/app/_layout.tsx` (root: GestureHandlerRoot + SafeAreaProvider + AuthProvider + Stack)
- `mobile/app/index.tsx` (router redirect auth/welcome ou tabs/dashboard selon session)
- `mobile/app/(auth)/_layout.tsx` + `welcome.tsx` + `login.tsx` + `signup.tsx` + `forgot.tsx`
- `mobile/app/(tabs)/_layout.tsx` (5 onglets emoji + dark style)
- `mobile/app/(tabs)/dashboard.tsx` (streak + XP + 2 cards Natif Instinct + Holotalk)
- `mobile/app/(tabs)/sessions.tsx` (hub 8 modes liste pressable)
- `mobile/app/(tabs)/missions.tsx` (lecture supabase missions actives)
- `mobile/app/(tabs)/wallet.tsx` (balance + Stripe portal via expo-web-browser)
- `mobile/app/(tabs)/profile.tsx` (info user + parrainage Share/Clipboard + signOut Alert)
- `mobile/app/sessions/_layout.tsx`
- `mobile/app/sessions/natif-instinct.tsx` (statique, 6 langues, expo-speech TTS, fetchPhonetic, layers + word_breakdown)
- `mobile/app/sessions/holotalk.tsx` (statique, 6 personas, chat /api/holotalk, TTS)
- `mobile/app/sessions/[mode].tsx` (dynamique pour les 6 autres modes — fetchGuidedSession + timer + phases + Speech.speak + logSession)

**Icônes**
- `mobile/scripts/generate-icons.js` (Pollinations + sharp avec fallback SVG lotus emerald)
- `mobile/assets/icon.png` 1024² · `adaptive-icon.png` 1024² · `splash-icon.png` 1284×2778 · `favicon.png` 48² · `feature-graphic.png` 1024×500

**Tests**
- `mobile/.maestro/auth.yaml` · `navigation.yaml` · `session_natif.yaml` · `session_holotalk.yaml` · `session_guided.yaml` · `missions.yaml` · `wallet.yaml` · `referral.yaml` · `login.yaml` · `forgot.yaml` · `sign_out.yaml` (10 flows + 1 sign_out, testID partout)

**Stores**
- `mobile/store.config.json` (16 langues iOS metadata)
- `mobile/GOOGLE_PLAY_SETUP.md` (guide 3 min)

**CI**
- `.github/workflows/mobile-build.yml` (npm ci → tsc → grep web globals → eas build all → eas submit production)

### Quality Gates 7/7 mobile (live)
- ✅ tsc 0 err (`npx tsc --noEmit`)
- ✅ expo-doctor 17/17 PASS
- ✅ Bundle Metro iOS réussi (1479 modules, 4.44 MB hermes)
- ✅ Bundle Metro Android réussi (4.44 MB hermes)
- ✅ Grep `window\.|document\.|localStorage\.` hors `Platform.OS` → 0 (3 lignes annotées `// allow-web` dans SecureStore adapter)
- ✅ Tous les écrans couverts par testID Maestro
- ⏸️ EAS build/submit non lancé : nécessite APPLE_TEAM_ID + ascAppId + google-service-account.json (placeholders dans CLAUDE.md)

### Pourquoi P8 Watch est skippé
Vida Langue = app éducation linguistique. Per CLAUDE.md `MOBILE > WATCH` : « Santé/bien-être/sport/fitness/wellness(BRIEF):OBLIGATOIRE montre. Autres apps:PAS montre. » → P8 ignorée, P7 = dernière phase.

### À savoir pour la session suivante
1. **L'app web reste en P6 état** : 106/106 PW PASS, Lighthouse all-green, prod live `https://vidalangue.purama.dev`. Aucun changement web en P7.
2. **Commit/push GitHub** : repo Vida Langue n'a toujours pas été créé sur l'org `puramapro-oss` (PAT scope `repo:create` manquait en P1). Soit créer le repo manuellement, soit ajouter le scope au PAT, soit créer via `gh auth refresh -s repo`. Une fois créé : `git remote add origin` + `git push -u origin main` → workflow `.github/workflows/mobile-build.yml` se déclenchera automatiquement à condition que les secrets GH soient présents (`EXPO_TOKEN` minimum).
3. **Premier build EAS local possible immédiatement** :
   ```bash
   cd ~/purama/vida-langue/mobile
   eas login   # avec EXPO_TOKEN si CI, sinon interactif
   eas build:configure
   eas build --profile preview --platform android   # apk de test
   eas build --profile development --platform ios --simulator   # build sim Mac
   ```
4. **Pour `eas submit` réel, à compléter (1 fois pour cette app)** :
   - `APPLE_TEAM_ID` dans CLAUDE.md (récupérable sur https://developer.apple.com/account → Membership)
   - Créer la fiche App Store Connect `Vida Langue` (bundleId `dev.purama.vidalangue`) → récupérer `ascAppId` → coller dans `mobile/eas.json` submit ios.
   - Suivre `mobile/GOOGLE_PLAY_SETUP.md` pour Android service account.
5. **Tester en physique avant de submit** : `npx expo start --tunnel` puis scanner avec Expo Go (les modules natifs SecureStore + Speech sont dans Expo Go, donc pas besoin de dev client pour tester l'auth + Holotalk + Natif Instinct).
6. **Maestro local** : `maestro install` puis `cd mobile && maestro test .maestro/auth.yaml` (nécessite simulateur iOS / émulateur Android lancé).
7. **Web globals strict** : la CI échouera si quelqu'un ajoute `window.X` ou `localStorage.X` sans `Platform.OS === 'web'` autour ou sans `// allow-web`. C'est le filet de sécurité anti-CRASH mobile.

### TERMINÉ ?
- ✅ Web prod live + audit 106/106 + Lighthouse all-green (P1-P6)
- ✅ Mobile iOS + Android : code complet, bundle réussi, expo-doctor 17/17, 10 flows Maestro, store config 16 langues, CI workflow (P7)
- ⏸️ EAS build/submit final : bloqué uniquement par credentials Apple/Google à compléter une fois (cf. points 3-4 ci-dessus)
- ❌ P8 Watch : SKIPPED (hors domaine santé)

**État global** : app **fonctionnellement terminée WEB + iOS + ANDROID**. Submission stores = 1 setup credentials puis `eas submit` automatique via GH Actions sur push main.
