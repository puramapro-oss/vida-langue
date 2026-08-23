import type { Metadata } from 'next'
import { buildPolitiqueConfidentialite } from '@/lib/legal/content/politique-confidentialite'
import LegalPage from '@/lib/legal/components/LegalPage'
import { buildLegalConfig } from '@/lib/legal/config'
import { LEGAL_VERSIONS_HISTORY } from '@/lib/legal/versions'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — VEDA',
  description: 'Politique de confidentialité et protection des données personnelles de VEDA.',
}

// Sous-traitants réellement utilisés par VEDA mais absents du catalogue générique
// (KNOWN_PROCESSORS ne couvre pas ElevenLabs ni l'authentification Google, gérée
// côté Supabase Auth du VPS plutôt que via une clé dans l'env de cette app).
const SOUS_TRAITANTS_SUPPLEMENTAIRES = [
  'ElevenLabs — synthèse vocale (text-to-speech) pour les sessions audio (États-Unis, clauses contractuelles types UE).',
  'Google Ireland Limited — connexion via Google (authentification tierce, Union européenne).',
]

export default function PolitiqueConfidentialite() {
  const config = buildLegalConfig()
  const sections = buildPolitiqueConfidentialite(config, process.env, SOUS_TRAITANTS_SUPPLEMENTAIRES)
  const derniere = LEGAL_VERSIONS_HISTORY.confidentialite.at(-1)?.date ?? ''

  return (
    <LegalPage
      titre="Politique de Confidentialité"
      sections={sections}
      derniereMiseAJour={derniere}
    />
  )
}
