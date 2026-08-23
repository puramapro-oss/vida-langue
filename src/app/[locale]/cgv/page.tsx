import type { Metadata } from 'next'
import { buildCGV } from '@/lib/legal/content/cgv'
import LegalPage from '@/lib/legal/components/LegalPage'
import { buildLegalConfig } from '@/lib/legal/config'
import { LEGAL_VERSIONS_HISTORY } from '@/lib/legal/versions'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente — VEDA',
  description: 'CGV de VEDA par SASU PURAMA.',
}

export default function CGV() {
  const config = buildLegalConfig()
  const sections = buildCGV(config)
  const derniere = LEGAL_VERSIONS_HISTORY.cgv.at(-1)?.date ?? ''

  return (
    <LegalPage
      titre="Conditions Générales de Vente"
      sections={sections}
      derniereMiseAJour={derniere}
    />
  )
}
