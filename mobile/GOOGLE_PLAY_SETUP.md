# Google Play setup — Vida Langue (3 minutes)

Une fois pour cette app. Tout le reste est automatisé via EAS + GitHub Actions.

## Étape 1 — Créer la fiche Play Console (1 min)

1. Va sur https://play.google.com/console.
2. Clique **Créer une application**.
3. Remplis :
   - **Nom de l'app** : `Vida Langue`
   - **Langue par défaut** : Français
   - **Type** : Application
   - **Gratuite ou payante** : Gratuite (in-app purchase via Stripe)
4. Coche les 2 déclarations (CGU + lois export US) → **Créer**.

## Étape 2 — Bundle ID + premier upload (1 min)

1. Dans la nouvelle app, va dans **Configuration de l'application > Configuration > Tableau de bord**.
2. Renseigne :
   - **Nom du package** : `dev.purama.vidalangue`
   - **Catégorie** : Éducation
   - **Adresse e-mail** : `matiss.frasne@gmail.com`
3. Lance le build production une première fois :
   ```bash
   cd ~/purama/vida-langue/mobile
   eas build --profile production --platform android
   ```
4. Une fois le build terminé (~15 min côté EAS), upload manuel sur la **Production track** une seule fois pour autoriser le service account à pousser les builds suivants.

## Étape 3 — Service account (1 min)

1. Play Console → **Configuration > Accès API** → **Lier un projet Google Cloud**.
2. Crée un nouveau projet ou choisis celui de Tissma.
3. Crée un **service account** :
   - Nom : `vida-langue-eas-submit`
   - Rôle : **Administrateur de version**
4. Télécharge la clé JSON → renomme-la `google-service-account.json`.
5. Place-la dans `~/purama/vida-langue/mobile/google-service-account.json` (déjà gitignore).
6. Sur la Play Console, **Inviter** le service account avec accès à cette app uniquement.

## Étape 4 — Auto-submit GitHub Actions

Une fois le `google-service-account.json` en place, chaque push sur `main` qui touche `mobile/**` :
- Lance `eas build --profile production --platform all`
- Puis `eas submit --platform all --latest`
- Le binaire Android atterrit en **Production track**, statut **completed**.

## Crédentials / secrets requis dans GitHub

| Secret | Valeur |
|---|---|
| `EXPO_TOKEN` | déjà dans `.env` (cf. CLAUDE.md) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | optionnel : si tu préfères que CI lise via secret plutôt que fichier local |

## Vérification

```bash
cd ~/purama/vida-langue/mobile
eas whoami           # vérifie le token Expo
eas build:list       # vérifie qu'on voit bien le projet
eas submit -p android --latest --non-interactive
```

Si tout est ok → l'app apparaît dans **Vérification** Play Console sous 24-48 h, puis en ligne.
