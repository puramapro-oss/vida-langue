import GuidedSession from '@/components/sessions/GuidedSession'

export const metadata = { title: 'Groupe / Rencontre — Vida Langue' }

export default function GroupPage() {
  return (
    <GuidedSession
      mode="group"
      badge="✦ Groupe / Rencontre"
      title="Conversation libre avec un autre apprenant"
      intro="30 minutes en simulation de groupe. Vida joue un autre apprenant à ton niveau (intermédiaire), avec ses petites erreurs naturelles. Tu engages la conversation sur un sujet de ton choix."
      durationMin={30}
      accentColor="#f59e0b"
      accentBg="bg-amber-500/10"
      topicOptions={[
        { value: 'partage ton dernier weekend', label: 'Weekend 🎉' },
        { value: 'parle d\'un voyage marquant', label: 'Voyage ✈️' },
        { value: 'décris un plat que tu adores', label: 'Cuisine 🍲' },
        { value: 'raconte un film qui t\'a touché', label: 'Cinéma 🎬' },
        { value: 'parle de ta routine du matin', label: 'Matin ☕' },
      ]}
      phases={[
        {
          title: 'Brise-glace',
          description: 'Vida (un autre apprenant) lance la conversation. Réponds-lui simplement, comme à un ami.',
        },
        {
          title: 'Approfondis',
          description: 'Continue la conversation. Pose des questions, partage tes souvenirs.',
        },
      ]}
    />
  )
}
