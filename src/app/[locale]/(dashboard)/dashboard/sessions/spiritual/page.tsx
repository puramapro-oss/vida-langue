import GuidedSession from '@/components/sessions/GuidedSession'

export const metadata = { title: 'Spirituel — VEDA' }

export default function SpiritualPage() {
  return (
    <GuidedSession
      mode="spiritual"
      badge="✦ Spirituel"
      title="Une intention, une langue, un souffle"
      intro="15 minutes pour mêler apprentissage et présence. VEDA te propose une intention douce dans la langue cible, à répéter comme un mantra. Pas de religion, juste la chaleur des mots."
      durationMin={15}
      accentColor="#fb7185"
      accentBg="bg-rose-500/10"
      ttsRate={0.85}
      topicOptions={[
        { value: 'gratitude pour le souffle', label: 'Gratitude 🙏' },
        { value: 'paix intérieure', label: 'Paix 🕊️' },
        { value: 'lumière du matin', label: 'Lumière ☀️' },
        { value: 'connexion à la terre', label: 'Terre 🌍' },
        { value: 'amour bienveillant', label: 'Amour 💗' },
      ]}
      phases={[
        {
          title: 'Centre',
          description: 'Pose une main sur ton cœur. VEDA te donne une intention.',
        },
        {
          title: 'Répète',
          description: 'Reprends l\'intention à voix basse, trois fois, lentement.',
        },
        {
          title: 'Laisse aller',
          description: 'Garde l\'intention en silence. Elle continue de travailler en toi.',
        },
      ]}
    />
  )
}
