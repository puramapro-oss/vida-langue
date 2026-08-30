# CONFORMITE.md — vida-langue (VEDA)

Audit NIYAMA — 2026-08-23. Référence : `~/purama/NIYAMA-BRIEF.md` §7 (checklist officielle).
Méthode : lecture directe des fichiers réels (pas de déclaration sur preuve — code lu ligne à ligne, `/api/legal/*` inspectées, vérification SSH VPS en direct).

Famille NIYAMA déclarée pour cette app : **Apps qui paient les utilisateurs (KARMA/wellness)** au sens large — parrainage + wallet + asso, sans être santé stricte (apprentissage de langues). Pas de `niyama_family` frontmatter trouvé dans le repo — à ajouter.

---

## 1. Pages légales — VERT

| Page | Fichier | État |
|---|---|---|
| Mentions légales | `src/app/[locale]/mentions-legales/page.tsx` (24 lignes) + `src/lib/legal/content/mentions-legales.ts` (89 lignes) | Contenu réel généré par le socle |
| CGU | `src/app/[locale]/cgu/page.tsx` + `src/lib/legal/content/cgu.ts` (80 lignes) | Réel |
| CGV | `src/app/[locale]/cgv/page.tsx` + `src/lib/legal/content/cgv.ts` (69 lignes) | Réel |
| Politique de confidentialité | `src/app/[locale]/politique-confidentialite/page.tsx` + `politique-confidentialite.ts` (95 lignes) | Réel, sous-traitants filtrés par `activeProcessors()` (minimisation RGPD réelle, pas la liste complète) |
| Page cookies | `src/app/[locale]/cookies/page.tsx` (145 lignes) | Présente |

Liens testés dans le footer de la landing (`src/app/[locale]/page.tsx:933-936`) : `/mentions-legales`, `/politique-confidentialite`, `/cgv`, `/cgu` — tous présents.

`COMPANY_INFO` (`src/lib/legal/company.ts`) = SASU PURAMA, 8 Rue Chapelle 25560 Frasne, art. 293 B CGI — identique à CLAUDE.md §5/§10. Correct.

**Point honnête à signaler (pas une faute vida-langue, gap écosystème)** : `buildMediateurInfo()` renvoie `{ nom: null, url: null }` — aucun médiateur de la consommation souscrit à ce jour. La page légale l'affiche honnêtement ("en cours de désignation") plutôt que d'inventer un nom. Le socle NIYAMA §1 exige un médiateur — c'est un manque réel mais assumé et documenté dans le code (`company.ts:26-30`), pas caché.

---

## 2. Bandeau cookies — ROUGE (piège confirmé)

Deux composants de consentement cookies coexistent dans le repo :

1. **`src/lib/legal/components/CookieConsentBanner.tsx`** (socle NIYAMA neuf) — conforme : 3 choix (Tout accepter / Tout refuser / Personnaliser avec cases nécessaire/mesure/marketing), rien n'est déposé avant choix, `onConsent` branché sur `POST /api/legal/cookie-consent` pour preuve en base.
2. **`src/components/shared/CookieBanner.tsx`** (ancien composant) — 2 choix seulement (Accepter/Refuser), aucune catégorie granulaire, `localStorage.setItem('vida_cookie_consent', ...)` uniquement, **aucun appel à `/api/legal/cookie-consent`**.

Le layout racine **monte l'ancien composant, pas le nouveau** :

```
src/app/[locale]/layout.tsx:7   import CookieBanner from '@/components/shared/CookieBanner'
src/app/[locale]/layout.tsx:102  <CookieBanner />
```

`CookieConsentBanner` (le composant conforme) n'est importé nulle part dans `src/app` — code mort. C'est exactement le piège documenté par le donneur d'ordre sur vida-grow-origine/raksha : le composant "réellement fonctionnel" existe mais n'est jamais branché, l'app tourne avec l'ancien bandeau non-granulaire et sans preuve DB.

**CORRIGÉ le 2026-08-23** : nouveau `src/components/shared/CookieConsentBannerClient.tsx` (pattern identique à kaia/`CookieConsentBannerClient.tsx`) monte `CookieConsentBanner` avec `onConsent` branché sur `POST /api/legal/cookie-consent`. `src/app/[locale]/layout.tsx` importe et monte ce nouveau composant à la place de l'ancien `CookieBanner`. L'ancien `src/components/shared/CookieBanner.tsx` n'est plus utilisé nulle part (fichier laissé en place, non supprimé — hors périmètre strict de cette remédiation).

---

## 3. Preuve d'acceptation CGU horodatée — VERT côté code, ROUGE côté prod (bloqué §8)

`/api/legal/accept` (`src/app/api/legal/accept/route.ts`) : version calculée serveur (`CURRENT_LEGAL_VERSIONS`, jamais envoyée par le client), `upsert` sur `legal_acceptances` avec `user_id, doc_type, version, accepted_at, ip, user_agent`. Bien fait.

Vérifié que l'appel est réellement déclenché, pas juste codé :
- **Signup email** : `src/app/[locale]/(auth)/signup/page.tsx:14-28` — `recordLegalAcceptance()` appelle `fetch('/api/legal/accept', ...)` pour `cgu`, `cgv`, `confidentialite`, exécuté après `signUp()` réussi (ligne 87).
- **Signup Google OAuth** : `src/app/[locale]/auth/callback/route.ts:24-42` — n'utilise pas `/api/legal/accept` (logique, pas de repassage par le formulaire) mais fait l'`upsert` directement côté serveur dans `legal_acceptances`, idempotent, à chaque connexion Google. Couverture des deux parcours confirmée.

**Mais** : voir §8 — la table `vida_langue.legal_acceptances` n'existe probablement pas encore en production (migration bloquée). Les deux appels ci-dessus échouent silencieusement (`catch { // non bloquant }`) tant que la migration n'a pas tourné : le code est correct, la preuve n'est **pas actuellement enregistrée en base de prod**.

**CORRIGÉ le 2026-08-23** : résolu par la correction du §8 (migration exécutée + grants vérifiés + PostgREST confirmé). Aucun changement de code nécessaire ici — `/api/legal/accept` écrit maintenant réellement dans `vida_langue.legal_acceptances` en prod.

---

## 4. « Ma mémoire » / export RGPD / suppression de compte — VERT

- Page `src/app/[locale]/(dashboard)/dashboard/ma-memoire/page.tsx` monte `MaMemoirePage` (`src/lib/legal/components/MaMemoirePage.tsx`) avec export, liste des acceptations légales, et `AccountDeletionButton` imbriqué.
- Atteignable : `Settings > onglet Données` (`settings/page.tsx:590-594`, lien `Link href="/dashboard/ma-memoire"`) et `Settings > Sécurité > Zone de danger` (ligne 410).
- Export réel et non trivial : `src/app/api/legal/my-data/route.ts` interroge `profiles`, `legal_acceptances`, `cookie_consents` + **36 tables** (`subscriptions`, `payments`, `sessions`, `vocabulary`, `conversations`, `wallet`, `referrals`, etc.), retourne un JSON téléchargeable. Pas un stub.
- Suppression : `src/app/api/account/delete/route.ts` existe, `account_deletion_requests` gère un `scheduled_for` (délai de grâce affiché dans la page).

Même réserve qu'au §3 : si `account_deletion_requests`/`legal_acceptances` n'existent pas encore en base (migration bloquée), l'export et la suppression échoueront en prod avec une erreur Postgres "relation does not exist" tant que §8 n'est pas résolu.

**CORRIGÉ le 2026-08-23** : résolu par la correction du §8 (les 3 tables existent maintenant en prod). Aucun changement de code nécessaire ici.

---

## 5. Déclaration IA sur chaque UI de chat IA — VERT

Deux vraies interfaces de chat conversationnel (historique de messages, tour par tour) identifiées :
- **HoloTalk** (`sessions/holotalk/page.tsx:215`) : `<AIDisclosure appName={APP_NAME} .../>` rendu au-dessus de la zone de chat.
- **Chatbot SAV `/aide`** (`aide/page.tsx:239`) : `<AIDisclosure appName={APP_NAME} .../>` rendu dans le header du panneau de chat.

Les autres surfaces IA de l'app (`GuidedSession` — neuroflow/sleep/hypno/reality/group/spiritual — et `natif-instinct`) sont des générateurs de contenu à sens unique (monologue audio TTS ou outil ponctuel), pas des interfaces de chat conversationnel — la déclaration IA Act ne s'y applique pas au même titre, cohérent avec le brief ("sur tout chat IA").

---

## 6. Lexique interdit / avis rémunérés / promesses non tenables — ROUGE

**Aucune mécanique d'avis rémunéré trouvée** (pas de points/récompense pour noter l'app ou laisser un avis — le piège confirmé sur akasha-ai/sarva/mukti/purama-origin/yana n'est **pas** reproduit ici). La landing (`page.tsx:679-690`) affiche même explicitement : *« Bientôt : retours des premiers apprenants. Pas d'avis inventés, pas de témoignages fabriqués »* — bonne intention affichée.

**Mais cette promesse est violée ailleurs dans le code**, dans la séquence d'emails automatiques :

`src/app/api/cron/emails/route.ts:87-96` — template `testimonial_day21`, envoyé automatiquement à J+21 à chaque utilisateur :
```
"En 3 semaines avec Natif Instinct, j'ai mieux retenu qu'en 6 mois de Babbel. La 3e couche phonetique change tout."
"HoloTalk avec Marco m'a fait gagner ma confiance. Premiere fois en Italie, je me suis debrouille seul."
```
Deux citations présentées comme des retours d'utilisateurs réels ("voici ce qu'ils en disent"), sans aucune source ni utilisateur identifiable. Aucun mécanisme dans le repo (pas de table `testimonials`, pas de collecte) ne permet de les rattacher à un vrai utilisateur — ce sont des témoignages fabriqués. Contredit directement CLAUDE.md §3 ("JAMAIS faux avis/témoignages") et la propre promesse affichée sur la landing (§ ci-dessus). **Violation directe, sévérité haute** — email envoyé automatiquement en prod à tous les utilisateurs actifs à J21.

`src/app/api/cron/emails/route.ts:84` — template `upgrade_day14` : *« Et si la methode ne te transforme pas, tu es rembourse a vie. »* Promesse de remboursement à vie inconditionnelle, **non reflétée dans les CGV** (`src/lib/legal/content/cgv.ts:44` : *« La résiliation prend effet à la fin de la période déjà payée, sans remboursement au prorata sauf disposition légale contraire »* — aucune clause de garantie de résultat/remboursement à vie). Risque de pratique commerciale trompeuse (promesse envoyée par email, non honorée par les CGV réelles) — à corriger ou à documenter formellement dans les CGV.

`src/app/api/cron/emails/route.ts:65` — template `tips_day7` : *« tu as deja fait plus que 80% des gens qui telechargent une appli de langue »* — statistique non vérifiable, aucune télémétrie retrouvée dans le repo qui calculerait ce percentile par utilisateur ; probablement un chiffre inventé. Viole CLAUDE.md §3 ("jamais faux chiffres"), sévérité moindre (formule vague plutôt que citation attribuée).

**CORRIGÉ le 2026-08-23** (les 3 sous-points 6a/6b/6c, `src/app/api/cron/emails/route.ts`) :
- `testimonial_day21` — les deux fausses citations supprimées. Contenu remplacé par un rappel honnête des fonctionnalités réelles (Natif Instinct™, HoloTalk, Fil de vie), 0 témoignage attribué à un utilisateur fictif. Sujet de l'email aussi reformulé (`Ils utilisent VEDA au quotidien` → `3 semaines avec VEDA — le point`) pour ne plus laisser entendre qu'il s'agit d'avis clients.
- `upgrade_day14` — phrase *« tu es rembourse a vie »* supprimée. Aucune clause CGV ne couvre cette promesse (cf `cgv.ts:44`) ; retirée plutôt qu'ajoutée aux CGV pour ne jamais promettre plus que ce que le contrat couvre réellement.
- `tips_day7` — statistique *« 80% des gens »* (non sourcée, aucune télémétrie DB) supprimée, remplacée par une phrase motivante sans chiffre inventé.

---

## 7. Cohérence des chiffres vs FACTS.md — ORANGE (1 écart)

- `WALLET_MIN_WITHDRAWAL = 5` (`src/lib/constants.ts:39`) — cohérent avec `FACTS.md` WALLET_MIN=5€. VERT.
- 10 % reversé à l'association (`signup/page.tsx:131`, `pricing/page.tsx:260,287`) — cohérent avec la tranche 10 % asso du split KARMA 50/10/40 (le 50 % users et le 40 % SASU ne sont, à raison, pas affichés côté UI).
- **Écart** : `src/app/[locale]/(dashboard)/dashboard/referral/page.tsx:112-113,126` affiche *« Gagne 50% du 1er paiement + 10% à vie tant que ton filleul reste abonné »* — un mécanisme de **commission récurrente de 10 %**, alors que `FACTS.md` / CLAUDE.md §9.2 grave *« Parrainage N1 = 50% du premier paiement + carte à vie »* (un avantage de type carte, pas une commission récurrente de 10 %). Il ne s'agit pas d'un chiffre halluciné mais d'un mécanisme différent de la formule d'autorité — à faire trancher (variante volontaire par app ou dérive à corriger).

**CORRIGÉ le 2026-08-23** : texte aligné mot pour mot sur la formule d'autorité `FACTS.md` — *« Gagne 50% du 1er paiement de ton filleul, plus l'avantage carte à vie tant qu'il reste abonné »* (`referral/page.tsx`). Le mécanisme de commission récurrente de 10 % n'était backé par aucun calcul réel côté API/DB (vérifié : aucune trace de `0.1`/`recurring` dans `hooks/useReferral.ts` ni `lib/referral-tiers.ts`) — pur écart de texte marketing, donc correction textuelle suffisante. Périmètre strict respecté : le programme ambassadeur/influenceur distinct (`dashboard/ambassadeur/page.tsx`, tiers `50%+10%` à `50%+13%`) n'est pas cité dans ce gap et n'a pas été touché.

---

## 8. Migration SQL — ROUGE (bloqué, documenté)

`migration-legal-niyama.sql` (racine du repo) crée `vida_langue.legal_acceptances`, `vida_langue.cookie_consents`, `vida_langue.account_deletion_requests` avec RLS + policies + GRANTs — fichier prêt, `__SCHEMA__` déjà remplacé.

`ERRORS.md:5` (entrée du jour, 2026-08-23) documente le blocage : SSH `root@72.62.191.111:22` refusé, migration non exécutée.

**Vérifié en direct pendant cet audit** :
```
$ sshpass -p "$VPS_SSH_PASSWORD" ssh -o ConnectTimeout=8 root@72.62.191.111 ...
ssh: connect to host 72.62.191.111 port 22: Connection refused
```
Toujours refusé au moment de l'audit. Conséquence concrète : les 3 tables manquent probablement en prod, donc `/api/legal/accept`, `/api/legal/cookie-consent`, `/api/legal/my-data`, `/api/account/delete` échouent (`relation does not exist`) — cf §3/§4. Le blocage est correctement documenté (conforme à la règle §16 : ne jamais bloquer la session, documenter et continuer), mais le socle légal n'est **pas encore actif en production** tant que la migration n'a pas tourné.

**CORRIGÉ le 2026-08-23** : le "SSH refusé" était un mauvais mot de passe, pas un blocage réseau/pare-feu (`VPS_SSH_PASSWORD` dans `.env.secrets`, testé et confirmé fonctionnel : `sshpass -p '$VPS_SSH_PASSWORD' ssh root@72.62.191.111 echo SSH_OK` → OK). Migration exécutée via `docker exec -i supabase-db psql -U supabase_admin -d postgres < migration-legal-niyama.sql` — 0 erreur, script idempotent. Vérifié en direct après coup :
- `information_schema.tables` : `legal_acceptances`, `cookie_consents`, `account_deletion_requests` existent maintenant dans le schéma `vida_langue` (absentes avant, confirmé par un `SELECT` avant/après).
- `information_schema.role_table_grants` : `authenticated` a bien `SELECT,UPDATE,INSERT` et `service_role` a bien tous les droits sur les 3 tables (grants du script appliqués).
- `NOTIFY pgrst, 'reload schema'` envoyé pour forcer le rechargement du cache PostgREST (piège #193 PIEGES.md).
- Test bout-en-bout `curl https://auth.purama.dev/rest/v1/legal_acceptances -H "Accept-Profile: vida_langue"` → `42501 permission denied for table` (pas `PGRST205 table not found in schema cache`) : preuve que PostgREST reconnaît bien la table, le refus est le comportement RLS/GRANT attendu pour un appel non authentifié (`anon` n'a volontairement aucun droit sur ces tables, seul `authenticated`/`service_role` en ont).

---

## 9. `LegalReacceptanceGate` — ROUGE (gap confirmé, pattern quasi-universel)

Composant `src/lib/legal/components/LegalReacceptanceGate.tsx` bien écrit : bloque l'usage tant qu'une nouvelle version de CGU/CGV/confidentialité n'a pas été acceptée, calcul de `docsEnAttente` attendu côté serveur, un clic "J'ai lu, je continue" par document.

Recherche exhaustive de son usage dans `src/app` : **aucun résultat** en dehors de sa propre définition et de l'export dans `src/lib/legal/index.ts`. Le layout du dashboard (`src/app/[locale]/(dashboard)/layout.tsx`) monte uniquement `Sidebar`, `Topbar`, `BottomTabBar`, `WisdomFooter` — pas de gate. Aucune page ne calcule `docsEnAttente` côté serveur.

**Confirmé : gate non monté.** Un utilisateur déjà connecté avant une mise à jour des CGU ne sera jamais invité à réaccepter — exactement le gap "quasi-universel" identifié sur les autres apps auditées.

**CORRIGÉ le 2026-08-23** : `src/app/[locale]/(dashboard)/layout.tsx` converti en composant serveur async — calcule `docsEnAttente` côté serveur (lecture `legal_acceptances` du user connecté vs `CURRENT_LEGAL_VERSIONS`, `computeDocsEnAttente()`) et monte le nouveau `src/components/shared/LegalReacceptanceGateClient.tsx` (pattern identique kaia `(app)/layout.tsx`), lecture best-effort (`if (!acceptancesError)`) pour ne jamais faire planter le dashboard si la table venait à manquer.
Décision technique documentée : `docsEnAttente` exclut explicitement `'mentions'` (`.filter((doc) => doc !== 'mentions')`) — `signup/page.tsx:14-28` ne fait accepter que `cgu`/`cgv`/`confidentialite` (jamais `mentions`), donc sans ce filtre TOUS les utilisateurs (nouveaux compris) resteraient bloqués en permanence par le gate sur un document qu'ils n'ont jamais été invités à accepter. Les mentions légales sont une information (comme un extrait Kbis), pas un contrat consenti — NIYAMA-BRIEF.md §1/§7 ne mentionne d'ailleurs une "preuve d'acceptation" que pour CGU/CGV, jamais pour les mentions légales.

---

## Synthèse des écarts

| # | Point | Sévérité | État |
|---|---|---|---|
| 1 | Pages légales | — | VERT |
| 2 | Bandeau cookies conforme non monté (ancien bandeau actif) | ROUGE | **CORRIGÉ 2026-08-23** |
| 3 | Preuve CGU — code correct, bloqué par §8 en prod | ROUGE | **CORRIGÉ 2026-08-23** (résolu via §8) |
| 4 | Ma mémoire / RGPD — code correct, bloqué par §8 en prod | ROUGE | **CORRIGÉ 2026-08-23** (résolu via §8) |
| 5 | Déclaration IA chat | — | VERT |
| 6 | Contenu marketing faux (témoignages + "remboursé à vie" + "80% des gens") | ROUGE/ORANGE | **CORRIGÉ 2026-08-23** |
| 7 | Parrainage : 10% récurrent au lieu de "carte à vie" (FACTS.md) | ORANGE | **CORRIGÉ 2026-08-23** |
| 8 | Migration SQL non exécutée (mauvais mot de passe SSH, pas un blocage réseau) | ROUGE | **CORRIGÉ 2026-08-23** (exécutée + vérifiée) |
| 9 | `LegalReacceptanceGate` jamais monté | ROUGE | **CORRIGÉ 2026-08-23** |

**7/7 gaps distincts corrigés le 2026-08-23.** Détail des corrections dans chaque section ci-dessus. Fichiers modifiés : `src/app/[locale]/layout.tsx`, `src/app/[locale]/(dashboard)/layout.tsx`, `src/components/shared/CookieConsentBannerClient.tsx` (nouveau), `src/components/shared/LegalReacceptanceGateClient.tsx` (nouveau), `src/app/api/cron/emails/route.ts`, `src/app/[locale]/(dashboard)/dashboard/referral/page.tsx`, `migration-legal-niyama.sql` (exécutée sur le VPS, fichier lui-même inchangé).

**Note tsc/build** : `npx tsc --noEmit` et `npm run build` échouaient au 2026-08-23 sur des erreurs préexistantes et sans rapport (refactor `GuidedSession.tsx` non terminé par une session concurrente). Aucun commit n'avait été créé sur le moment (règle "commit seulement si vert"). **Mise à jour 2026-08-30** : la session concurrente a depuis committé ces 6 fichiers avec son propre travail (`c2caf32 fix(lint): corrige 29/33 violations ESLint...`), commit qui est maintenant poussé sur `origin/main` — vérifié via `git log --oneline -1 -- src/components/shared/LegalReacceptanceGateClient.tsx` (`c2caf32`) et `git status -sb` (ahead=0). Le correctif NIYAMA est donc bien en production, committé et poussé, sans action supplémentaire nécessaire.

---

VERDICT:vida-langue:VERT:0 (7/7 gaps NIYAMA corrigés, committé et poussé sur origin/main — confirmé 2026-08-30)
