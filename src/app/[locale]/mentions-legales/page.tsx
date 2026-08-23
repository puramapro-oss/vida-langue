import type { Metadata } from 'next'
import { buildMentionsLegales } from '@/lib/legal/content/mentions-legales'
import LegalPage from '@/lib/legal/components/LegalPage'
import { buildLegalConfig } from '@/lib/legal/config'
import { LEGAL_VERSIONS_HISTORY } from '@/lib/legal/versions'

export const metadata: Metadata = {
  title: 'Mentions Légales — VEDA',
  description: 'Mentions légales de VEDA par SASU PURAMA.',
}

export default function MentionsLegales() {
  const config = buildLegalConfig()
  const sections = buildMentionsLegales(config)
  const derniere = LEGAL_VERSIONS_HISTORY.mentions.at(-1)?.date ?? ''

  return (
    <LegalPage
      titre="Mentions Légales"
      sections={sections}
      derniereMiseAJour={derniere}
    />
  )
}
