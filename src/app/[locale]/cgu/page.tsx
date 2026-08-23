import type { Metadata } from 'next'
import { buildCGU } from '@/lib/legal/content/cgu'
import LegalPage from '@/lib/legal/components/LegalPage'
import { buildLegalConfig } from '@/lib/legal/config'
import { LEGAL_VERSIONS_HISTORY } from '@/lib/legal/versions'

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — VEDA",
  description: 'CGU de VEDA par SASU PURAMA.',
}

export default function CGU() {
  const config = buildLegalConfig()
  const sections = buildCGU(config)
  const derniere = LEGAL_VERSIONS_HISTORY.cgu.at(-1)?.date ?? ''

  return (
    <LegalPage
      titre="Conditions Générales d'Utilisation"
      sections={sections}
      derniereMiseAJour={derniere}
    />
  )
}
