/**
 * INSEE Sirene API V3.11 — vérification SIRET entreprise / association.
 *
 * Portail : https://portail-api.insee.fr (clé unique V4.1)
 * Endpoint : https://api.insee.fr/entreprises/sirene/V3.11/siret/{siret}
 * Header : X-INSEE-Api-Key-Integration: ${INSEE_API_KEY}
 * Coût : gratuit (API publique)
 *
 * Usages VEDA :
 *  - Wizard /financer étape Entreprise/Asso (validation SIRET avant dossier)
 *  - KYC organisations partenaires missions rémunérées
 *  - Stripe Connect onboarding pro
 */

const INSEE_BASE = 'https://api.insee.fr/entreprises/sirene/V3.11/siret'

export interface InseeEtablissement {
  siret: string
  siren: string
  uniteLegale: {
    denominationUniteLegale?: string | null
    categorieJuridiqueUniteLegale?: string | null
    activitePrincipaleUniteLegale?: string | null
    etatAdministratifUniteLegale?: 'A' | 'C' | null
  }
  adresseEtablissement: {
    numeroVoieEtablissement?: string | null
    typeVoieEtablissement?: string | null
    libelleVoieEtablissement?: string | null
    codePostalEtablissement?: string | null
    libelleCommuneEtablissement?: string | null
  }
  etatAdministratifEtablissement: 'A' | 'F' | null
  dateCreationEtablissement: string
}

export type SiretVerifyResult =
  | {
      ok: true
      etablissement: InseeEtablissement
      displayName: string
      address: string
      isActive: boolean
      isAssociation: boolean
    }
  | {
      ok: false
      error: string
    }

/**
 * Normalise un SIRET : conserve uniquement les 14 chiffres.
 */
export function normalizeSiret(input: string): string {
  return (input ?? '').replace(/\D/g, '').slice(0, 14)
}

/**
 * Valide la checksum Luhn du SIRET.
 */
export function isValidSiret(siret: string): boolean {
  const clean = normalizeSiret(siret)
  if (clean.length !== 14) return false
  let sum = 0
  for (let i = 0; i < 14; i++) {
    let n = parseInt(clean[i], 10)
    if (i % 2 === 1) n *= 2
    if (n > 9) n -= 9
    sum += n
  }
  return sum % 10 === 0
}

/**
 * Catégories juridiques INSEE qui correspondent à des associations.
 * Ref : https://www.insee.fr/fr/information/2028129
 */
const ASSO_CATEGORY_PREFIXES = ['92', '93', '21'] // assos loi 1901, fondations, établissements publics

function isAssociation(categorieJuridique: string | null | undefined): boolean {
  if (!categorieJuridique) return false
  return ASSO_CATEGORY_PREFIXES.some((p) => categorieJuridique.startsWith(p))
}

export async function verifySiret(siret: string): Promise<SiretVerifyResult> {
  const clean = normalizeSiret(siret)

  if (!isValidSiret(clean)) {
    return { ok: false, error: 'SIRET invalide (14 chiffres + clé Luhn).' }
  }

  const apiKey = process.env.INSEE_API_KEY
  if (!apiKey) {
    return { ok: false, error: "Clé INSEE manquante côté serveur. Contacte le support." }
  }

  try {
    const res = await fetch(`${INSEE_BASE}/${clean}`, {
      headers: {
        'X-INSEE-Api-Key-Integration': apiKey,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (res.status === 404) {
      return { ok: false, error: "Aucun établissement trouvé pour ce SIRET." }
    }
    if (res.status === 429) {
      return { ok: false, error: 'Trop de requêtes INSEE. Réessaie dans 1 minute.' }
    }
    if (!res.ok) {
      return { ok: false, error: `Service INSEE indisponible (HTTP ${res.status}).` }
    }

    const data = await res.json()
    const etab: InseeEtablissement = data?.etablissement
    if (!etab || !etab.siret) {
      return { ok: false, error: 'Réponse INSEE inattendue.' }
    }

    const displayName =
      etab.uniteLegale.denominationUniteLegale ??
      `Établissement ${etab.siret}`
    const addr = etab.adresseEtablissement
    const address = [
      [addr.numeroVoieEtablissement, addr.typeVoieEtablissement, addr.libelleVoieEtablissement]
        .filter(Boolean)
        .join(' '),
      [addr.codePostalEtablissement, addr.libelleCommuneEtablissement].filter(Boolean).join(' '),
    ]
      .filter(Boolean)
      .join(', ')

    const isActive =
      etab.etatAdministratifEtablissement === 'A' &&
      etab.uniteLegale.etatAdministratifUniteLegale !== 'C'

    return {
      ok: true,
      etablissement: etab,
      displayName,
      address,
      isActive,
      isAssociation: isAssociation(etab.uniteLegale.categorieJuridiqueUniteLegale),
    }
  } catch (err) {
    return {
      ok: false,
      error: `Erreur réseau INSEE : ${(err as Error).message}`,
    }
  }
}
