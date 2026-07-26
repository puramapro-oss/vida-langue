import { redirect, permanentRedirect } from 'next/navigation'

// Rename VEDA V7.1 : influenceur → ambassadeur.
// 301 permanent redirect pour SEO + compat anciens liens/bookmarks.
export default function InfluenceurLegacyRedirect() {
  // permanentRedirect émet un HTTP 308 (équiv 301 pour POST safe) — Next.js standard
  permanentRedirect('/dashboard/ambassadeur')
  // Fallback (jamais atteint)
  redirect('/dashboard/ambassadeur')
}

export const dynamic = 'force-dynamic'
