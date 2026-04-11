import GuidedSession from '@/components/sessions/GuidedSession'

export const metadata = { title: 'NeuroFlow™ — Vida Langue' }

export default function NeuroFlowPage() {
  return (
    <GuidedSession
      mode="neuroflow"
      badge="✦ NeuroFlow™"
      title="Respiration → immersion → scellage"
      intro="25 minutes pour préparer ton cerveau à recevoir la langue, l'immerger en double canal, puis sceller ce qui vient d'entrer. Aucune théorie. Juste la voix, ton souffle, et toi."
      durationMin={25}
      accentColor="#06b6d4"
      accentBg="bg-cyan-500/10"
      ttsRate={0.92}
      phases={[
        {
          title: 'Respiration 4-7-8',
          description: 'Inspire 4 secondes, retiens 7 secondes, expire 8 secondes. Vida te donne une phrase d\'ancrage à répéter en boucle.',
        },
        {
          title: 'Immersion double canal',
          description: 'Vida te lit un mini-paragraphe sensoriel dans la langue cible. Laisse les images monter sans traduire dans ta tête.',
        },
        {
          title: 'Scellage neurologique',
          description: 'Une affirmation positive courte que tu répètes à voix haute trois fois, paupières fermées.',
        },
      ]}
    />
  )
}
