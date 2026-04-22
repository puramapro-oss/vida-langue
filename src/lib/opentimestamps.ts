/**
 * OpenTimestamps — horodatage blockchain Bitcoin gratuit.
 *
 * Remplace OriginStamp (retired mai 2025). Lib `javascript-opentimestamps@0.4.5`.
 *
 * LEARNINGS.md 2026-04-21 (SUTRA) : la lib embarque 7 deps transitives critical/high
 * non patchables (bitcore-lib, crypto-js, elliptic, form-data, lodash, request, web3).
 * Contenu côté serveur UNIQUEMENT, inputs hash-only (SHA-256 + proof blob).
 * Calendars publics hardcodés. JAMAIS passer de données utilisateur vers les APIs OTS.
 *
 * Usages VEDA :
 *  - Règlements concours hebdo / mensuel / annuel (preuve d'immuabilité)
 *  - Snapshots fiscaux annuels (PDF récap horodaté — /fiscal)
 *  - Engagements streak longs (milestones J+365, J+1000)
 */

import { createHash } from 'crypto'

// Import dynamique — la lib est CommonJS et browser-oriented.
// On la charge uniquement côté serveur (runtime nodejs).
async function getOts() {
  const mod = await import('javascript-opentimestamps')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mod as any
}

export type StampResult = {
  hashHex: string
  proofBase64: string
  stampedAt: string
}

export type VerifyResult = {
  verified: boolean
  bitcoinAttestation?: {
    blockHeight: number
    blockTime: string
  }
  calendarsPending?: string[]
}

/**
 * Stamp un buffer (par ex. PDF fiscal, JSON règlement).
 * Retourne le SHA-256 + proof sérialisée base64.
 */
export async function stampBuffer(input: Buffer): Promise<StampResult> {
  const OpenTimestamps = await getOts()

  const hash = createHash('sha256').update(input).digest()
  const hashHex = hash.toString('hex')

  const detachedTimestamp = OpenTimestamps.DetachedTimestampFile.fromHash(
    new OpenTimestamps.Ops.OpSHA256(),
    hash,
  )

  await OpenTimestamps.stamp(detachedTimestamp)

  const proofBuffer = Buffer.from(detachedTimestamp.serializeToBytes())

  return {
    hashHex,
    proofBase64: proofBuffer.toString('base64'),
    stampedAt: new Date().toISOString(),
  }
}

/**
 * Stamp une string JSON ou texte (règlement, engagement).
 */
export async function stampString(text: string): Promise<StampResult> {
  return stampBuffer(Buffer.from(text, 'utf-8'))
}

/**
 * Vérifie une preuve OTS. Renvoie attestation Bitcoin si confirmée.
 * Si calendrier pending : la proof a été soumise mais pas encore
 * inclue dans un bloc Bitcoin (attente ~1-6h normale).
 */
export async function verifyProof(
  originalInput: Buffer,
  proofBase64: string,
): Promise<VerifyResult> {
  const OpenTimestamps = await getOts()

  const detachedOrig = OpenTimestamps.DetachedTimestampFile.fromHash(
    new OpenTimestamps.Ops.OpSHA256(),
    createHash('sha256').update(originalInput).digest(),
  )
  const detachedProof = OpenTimestamps.DetachedTimestampFile.deserialize(
    Buffer.from(proofBase64, 'base64'),
  )

  try {
    const verifyResult = await OpenTimestamps.verify(detachedProof, detachedOrig)
    // verifyResult: Map<string, { timestamp, height }>
    const firstEntry = Array.from(verifyResult.values())[0] as
      | { timestamp: number; height: number }
      | undefined

    if (firstEntry) {
      return {
        verified: true,
        bitcoinAttestation: {
          blockHeight: firstEntry.height,
          blockTime: new Date(firstEntry.timestamp * 1000).toISOString(),
        },
      }
    }
    return { verified: false, calendarsPending: ['aucune attestation'] }
  } catch (err) {
    return {
      verified: false,
      calendarsPending: [(err as Error).message],
    }
  }
}
