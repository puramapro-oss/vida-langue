import GuidedSession from '@/components/sessions/GuidedSession'

export const metadata = { title: 'Hypno-Immersif™ — Vida Langue' }

export default function HypnoImmersifPage() {
  return (
    <GuidedSession
      mode="hypno"
      badge="✦ Hypno-Immersif™"
      title="Double canal, un mot ancré pour la vie"
      intro="20 minutes de répétition douce et contextuelle d\'un mot-clé. Le subconscient absorbe par fréquence. Mets tes écouteurs, ferme les yeux, laisse Vida faire le travail."
      durationMin={20}
      accentColor="#e879f9"
      accentBg="bg-fuchsia-500/10"
      ttsRate={0.82}
      topicOptions={[
        { value: 'temps', label: 'Temps ⏳' },
        { value: 'maison', label: 'Maison 🏠' },
        { value: 'amour', label: 'Amour 💗' },
        { value: 'eau', label: 'Eau 💧' },
        { value: 'lumière', label: 'Lumière ✨' },
        { value: 'voyage', label: 'Voyage 🌍' },
      ]}
      phases={[
        {
          title: 'Induction',
          description: 'Vida te donne 4 phrases qui contiennent le mot-clé dans 4 contextes différents. Écoute-les sans analyser.',
        },
        {
          title: 'Ancrage',
          description: 'Réécoute la phase. Le mot-clé doit s\'imprimer.',
        },
      ]}
    />
  )
}
