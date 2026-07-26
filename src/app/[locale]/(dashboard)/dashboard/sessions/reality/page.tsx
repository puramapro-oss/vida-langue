import GuidedSession from '@/components/sessions/GuidedSession'

export const metadata = { title: 'Réalité Parallèle — VEDA' }

export default function RealityPage() {
  return (
    <GuidedSession
      mode="reality"
      badge="✦ Réalité Parallèle"
      title="Tu débarques dans un autre monde, en VO"
      intro="15 minutes d'immersion. Tu choisis le lieu, VEDA joue les personnages que tu rencontres. Tu réponds à voix haute. Aucun jugement, aucun score. Juste vivre la langue."
      durationMin={15}
      accentColor="#38bdf8"
      accentBg="bg-sky-500/10"
      scenarioOptions={[
        { value: 'cafe', label: 'Café local ☕' },
        { value: 'market', label: 'Marché 🥭' },
        { value: 'airport', label: 'Aéroport ✈️' },
        { value: 'taxi', label: 'Taxi 🚕' },
        { value: 'hotel', label: 'Hôtel 🏨' },
      ]}
      phases={[
        {
          title: 'Arrivée',
          description: 'VEDA joue le PNJ qui te parle en premier. Réponds-lui à voix haute.',
        },
        {
          title: 'Échange',
          description: 'La conversation continue. Suis ton instinct, ne traduis pas dans ta tête.',
        },
      ]}
    />
  )
}
