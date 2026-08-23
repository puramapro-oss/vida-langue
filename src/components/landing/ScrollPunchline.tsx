import ScrollRevealText from '@/components/landing/ScrollRevealText'

export default function ScrollPunchline() {
  return (
    <section className="relative py-32 sm:py-40">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <ScrollRevealText
          text="Jour 30. Tu commandes un café. Dans leur langue."
          className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl"
        />
      </div>
    </section>
  )
}
