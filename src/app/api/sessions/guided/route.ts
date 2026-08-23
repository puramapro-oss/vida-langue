import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'
import { askClaude } from '@/lib/claude'
import { LEARNING_LANGUAGES } from '@/lib/constants'
import type { Plan } from '@/types'

export const runtime = 'nodejs'
export const maxDuration = 60

const VALID_MODES = ['neuroflow', 'sleep', 'hypno', 'reality', 'group', 'spiritual'] as const
type GuidedMode = typeof VALID_MODES[number]

interface Body {
  mode?: string
  language?: string
  nativeLanguage?: string
  step?: number
  scenario?: string
  topic?: string
}

function buildSystemForMode(
  mode: GuidedMode,
  step: number,
  targetMeta: { name: string } | undefined,
  nativeMeta: { name: string } | undefined,
  scenario?: string,
  topic?: string,
): { system: string; user: string } {
  const target = targetMeta?.name ?? 'la langue cible'
  const native = nativeMeta?.name ?? 'la langue maternelle'

  switch (mode) {
    case 'neuroflow': {
      const phases = [
        { title: 'Respiration 4-7-8', task: `Donne UNE phrase courte d'ancrage en ${target} (max 6 mots) pour préparer l'esprit à recevoir la langue. Ajoute en italique entre parenthèses la traduction en ${native}.` },
        { title: 'Immersion double canal', task: `Donne UN mini-paragraphe (3 phrases max) en ${target} sur un thème quotidien : un café le matin, marcher dans une rue. Ton chaud, sensoriel. Sous chaque phrase, donne en italique la traduction en ${native}.` },
        { title: 'Scellage neurologique', task: `Donne UNE affirmation positive en ${target} (max 10 mots) que l'apprenant doit répéter à voix haute. Ajoute en italique la traduction en ${native} entre parenthèses.` },
      ]
      const phase = phases[step] ?? phases[phases.length - 1]
      return {
        system: `Tu es VEDA en mode NeuroFlow™. Tu accompagnes une session 25 min : respiration → immersion → scellage. Ton rôle : produire un contenu PRÊT À DIRE, jamais de méta-discours, jamais "voici", jamais "n'hésitez pas". Tu réponds DIRECTEMENT le texte demandé, rien d'autre. Pas d'emojis. Pas de markdown sauf l'italique pour la traduction.`,
        user: `Phase ${step + 1}/3 : ${phase.title}\n\n${phase.task}`,
      }
    }

    case 'sleep': {
      return {
        system: `Tu es VEDA en mode SleepSync™. La session se déroule juste avant le sommeil. Voix lente, mots simples, phrases courtes, vocabulaire déjà connu de l'apprenant (présent/passé simple). Aucun stress, aucune complexité. Tu produis UN MICRO-RÉCIT de 5 phrases en ${target} sur un thème apaisant : la mer le soir, une promenade en forêt, un thé chaud. Sous chaque phrase, donne en italique la traduction en ${native}.`,
        user: `Génère un micro-récit SleepSync sur le thème : "${topic ?? 'une nuit calme près de la mer'}".`,
      }
    }

    case 'hypno': {
      return {
        system: `Tu es VEDA en mode Hypno-Immersif™. Voix double canal, ton hypnotique, répétition douce. Tu produis 4 phrases en ${target} qui répètent un mot-clé important (à choisir) dans 4 contextes différents pour ancrer dans le subconscient. Format : phrase / italique traduction ${native}. Pas de méta.`,
        user: `Mot-clé thématique : "${topic ?? 'temps'}". Crée 4 phrases hypno-immersives.`,
      }
    }

    case 'reality': {
      const scenarios: Record<string, string> = {
        airport: `tu viens d'arriver à l'aéroport, l'agent au comptoir te parle`,
        market: `tu es au marché et tu négocies un achat`,
        cafe: `tu commandes au café et le serveur engage la conversation`,
        taxi: `tu prends un taxi et le chauffeur te questionne`,
        hotel: `tu fais le check-in à l'hôtel et la réceptionniste te parle`,
      }
      const scen = scenarios[scenario ?? 'cafe'] ?? scenarios.cafe
      return {
        system: `Tu es VEDA en mode Réalité Parallèle™. Tu joues UN PNJ dans un scénario d'immersion. Tu parles uniquement en ${target}, 1 ou 2 phrases courtes, naturelles. Tu poses une question pour relancer. Tu ajoutes en italique la traduction ${native} en bas. Tu ne dis JAMAIS que tu es une IA. Tu restes dans le rôle.`,
        user: `Scénario : ${scen}. Lance la conversation par ta première réplique de PNJ.`,
      }
    }

    case 'group': {
      return {
        system: `Tu es VEDA en mode Groupe / Rencontre™. Tu joues UN VRAI APPRENANT du groupe (pas un prof). Ton niveau est intermédiaire, tu fais parfois des micro-erreurs naturelles. Tu poses des questions ouvertes en ${target} pour engager la conversation. 2 phrases max. Italique = traduction ${native}.`,
        user: `Sujet de discussion du groupe : "${topic ?? 'partage ton dernier weekend'}". Engage la conversation.`,
      }
    }

    case 'spiritual': {
      return {
        system: `Tu es VEDA en mode Spirituel™. Tu mêles apprentissage de la langue et méditation/gratitude. Tu produis UNE intention douce en ${target} (max 12 mots), suivie en italique de la traduction ${native}. Ton chaud, lumineux, sans religion explicite. Pas de méta.`,
        user: `Thème spirituel du jour : "${topic ?? 'gratitude pour le souffle'}". Génère l'intention.`,
      }
    }

    default:
      return { system: '', user: '' }
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body = (await req.json()) as Body
    const mode = body.mode as GuidedMode | undefined
    if (!mode || !VALID_MODES.includes(mode)) {
      return NextResponse.json({ error: 'Mode invalide. Modes disponibles : ' + VALID_MODES.join(', ') }, { status: 400 })
    }

    const language = body.language ?? 'en'
    const nativeLanguage = body.nativeLanguage ?? 'fr'
    const step = Math.max(0, Math.min(9, body.step ?? 0))

    const targetMeta = LEARNING_LANGUAGES.find(l => l.code === language)
    const nativeMeta = LEARNING_LANGUAGES.find(l => l.code === nativeLanguage)

    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()
    const plan = (profile?.plan ?? 'free') as Plan

    const { system, user: userPrompt } = buildSystemForMode(
      mode,
      step,
      targetMeta,
      nativeMeta,
      body.scenario,
      body.topic,
    )

    const text = await askClaude(
      [{ role: 'user', content: userPrompt }],
      plan,
      system,
      'vida-main',
      user.id,
    )

    return NextResponse.json({ text, mode, step })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: 'VEDA n\'a pas pu générer la phase. Réessaie dans un instant. (' + message + ')' }, { status: 500 })
  }
}
