import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { streamClaude } from '@/lib/claude'
import { LEARNING_LANGUAGES } from '@/lib/constants'
import type { Plan } from '@/types'

export const runtime = 'nodejs'
export const maxDuration = 120

interface HoloMessage {
  role: 'user' | 'assistant'
  content: string
}

const PERSONAS: Record<string, { name: string; instruction: string }> = {
  vendor: {
    name: 'Vendeur de marché',
    instruction: 'Tu joues un VENDEUR sur un marché local. Tu vends des fruits, légumes, épices. Chaleureux, parfois bourru, tu négocies, tu plaisantes, tu interpelles. Tu as un caractère bien à toi.',
  },
  grandma: {
    name: 'Mamie chaleureuse',
    instruction: 'Tu joues une MAMIE locale. Tu parles lentement, tu racontes des histoires, tu corriges avec tendresse, tu utilises des expressions idiomatiques. Tu offres souvent à manger.',
  },
  cop: {
    name: 'Policier formel',
    instruction: 'Tu joues un POLICIER. Tu utilises des formules formelles, tu poses des questions précises (papiers, raison de la visite, destination). Tu restes courtois mais ferme.',
  },
  friend: {
    name: 'Ami de toujours',
    instruction: 'Tu joues un AMI proche. Tu utilises l\'argot, les expressions de tous les jours, l\'humour. Tu parles de la vie, du week-end, de musique, de sorties.',
  },
  boss: {
    name: 'Patron exigeant',
    instruction: 'Tu joues un PATRON dans une réunion de travail. Tu poses des questions sur les projets, les délais, les budgets. Vocabulaire pro mais direct.',
  },
  flirt: {
    name: 'Premier rendez-vous',
    instruction: 'Tu joues quelqu\'un en premier RENDEZ-VOUS amoureux. Tu poses des questions sympas (films, voyages, passions), tu plaisantes gentiment, tu écoutes vraiment.',
  },
}

function buildSystem(personaId: string, targetLang: string, nativeLang: string): string {
  const persona = PERSONAS[personaId] ?? PERSONAS.friend
  const targetMeta = LEARNING_LANGUAGES.find(l => l.code === targetLang)
  const nativeMeta = LEARNING_LANGUAGES.find(l => l.code === nativeLang)

  return `Tu es VIDA LANGUE en mode HoloTalk™. Tu incarnes UN personnage pour faire pratiquer l'oral à l'apprenant.

PERSONNAGE : ${persona.name}.
${persona.instruction}

LANGUE DE LA CONVERSATION : ${targetMeta?.name ?? targetLang} UNIQUEMENT.
Langue maternelle de l'apprenant : ${nativeMeta?.name ?? nativeLang}.

RÈGLES ABSOLUES :
1. Tu réponds en ${targetMeta?.name ?? targetLang}, court (1-3 phrases max), naturel, vivant.
2. Si l'apprenant fait une faute, NE LE CORRIGE PAS dans le flux. Tu reformules naturellement la bonne version dans ta réponse (correction implicite).
3. Si l'apprenant écrit dans sa langue maternelle, tu réponds quand même en ${targetMeta?.name ?? targetLang} ET tu ajoutes en bas, en italique entre parenthèses, la traduction courte de ta réponse en ${nativeMeta?.name ?? nativeLang}.
4. Tu poses régulièrement des questions ouvertes pour relancer.
5. Tu ne romps JAMAIS le personnage. Tu ne dis jamais "je suis une IA", "Vida", "Claude", "modèle".
6. Tu utilises des expressions idiomatiques, de l'humour, de la chaleur.
7. Tu es PATIENT, jamais condescendant.
8. Si la phrase apprenant est incompréhensible, tu réponds par "Mmm ? Tu peux répéter ?" dans ${targetMeta?.name ?? targetLang}.

IMPORTANT : tu ne décris PAS tes actions entre astérisques. Tu PARLES, c'est tout.`
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body = (await req.json()) as {
      messages?: HoloMessage[]
      persona?: string
      targetLanguage?: string
      nativeLanguage?: string
    }
    const messages = body.messages ?? []
    const persona = body.persona ?? 'friend'
    const target = body.targetLanguage ?? 'en'
    const native = body.nativeLanguage ?? 'fr'

    if (messages.length === 0) {
      return NextResponse.json({ error: 'Messages requis' }, { status: 400 })
    }

    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()
    const plan = (profile?.plan ?? 'free') as Plan

    const system = buildSystem(persona, target, native)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamClaude(messages, plan, system, 'vida-main')) {
            controller.enqueue(encoder.encode(chunk))
          }
          controller.close()
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erreur'
          controller.enqueue(encoder.encode(`\n\n[Vida a perdu le souffle : ${message}]`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
