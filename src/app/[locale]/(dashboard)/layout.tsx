import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import BottomTabBar from '@/components/layout/BottomTabBar'
import WisdomFooter from '@/components/shared/WisdomFooter'
import LegalReacceptanceGateClient from '@/components/shared/LegalReacceptanceGateClient'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { computeDocsEnAttente } from '@/lib/legal'
import type { LegalDocType } from '@/lib/legal/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Best-effort : si `legal_acceptances` n'existe pas encore côté prod (migration non jouée),
  // on n'affiche aucun gate plutôt que de faire planter tout le dashboard pour tous les users
  // (cf CONFORMITE.md §8/§9 — même pattern que kaia `(app)/layout.tsx`).
  let docsEnAttente: LegalDocType[] = []
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: acceptances, error: acceptancesError } = await supabase
      .from('legal_acceptances')
      .select('doc_type, version')
      .eq('user_id', user.id)
    if (!acceptancesError) {
      const dernieresAcceptations = Object.fromEntries(
        (acceptances ?? []).map((a) => [a.doc_type, a.version])
      ) as Partial<Record<LegalDocType, string>>
      // 'mentions' n'est jamais enregistré à l'inscription (signup/page.tsx ne fait
      // accepter que cgu/cgv/confidentialite, comme kaia) — l'exclure du gate évite
      // de bloquer TOUS les utilisateurs (nouveaux compris) sur un document qu'ils
      // n'ont jamais été invités à "accepter" (mentions légales = information, pas contrat).
      docsEnAttente = computeDocsEnAttente(dernieresAcceptations).filter((doc) => doc !== 'mentions')
    }
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-60">
        <Topbar />
        <main className="min-h-[calc(100vh-4rem)] p-4 pb-20 lg:p-8 lg:pb-8">
          {children}
          <WisdomFooter />
        </main>
      </div>
      <BottomTabBar />
      <LegalReacceptanceGateClient docsEnAttente={docsEnAttente} />
    </div>
  )
}
