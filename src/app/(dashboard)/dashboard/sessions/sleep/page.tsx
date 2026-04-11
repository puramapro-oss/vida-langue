import GuidedSession from '@/components/sessions/GuidedSession'

export const metadata = { title: 'SleepSync™ — Vida Langue' }

export default function SleepSyncPage() {
  return (
    <GuidedSession
      mode="sleep"
      badge="✦ SleepSync™"
      title="Avant de dormir, dépose la langue dans ton sommeil"
      intro="8 minutes de phrases simples, voix lente, vocabulaire déjà connu. Ton cerveau les consolide pendant le sommeil léger. Pose ton téléphone, écoute, laisse-toi glisser."
      durationMin={8}
      accentColor="#818cf8"
      accentBg="bg-indigo-500/10"
      ttsRate={0.78}
      topicOptions={[
        { value: 'une nuit calme près de la mer', label: 'Mer le soir 🌊' },
        { value: 'une promenade en forêt au crépuscule', label: 'Forêt 🌲' },
        { value: 'un thé chaud au coin du feu', label: 'Thé chaud ☕' },
        { value: 'une étoile filante dans le ciel d\'été', label: 'Étoiles ✨' },
        { value: 'la pluie douce sur les fenêtres', label: 'Pluie 🌧️' },
      ]}
      phases={[
        {
          title: 'Apaisement',
          description: 'Ferme les yeux. Vida murmure une scène apaisante en 5 phrases courtes.',
        },
        {
          title: 'Dépose',
          description: 'Laisse les phrases résonner. Tu n\'as rien à comprendre, juste à recevoir.',
        },
      ]}
    />
  )
}
