import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase'
import { APP_NAME, APP_DOMAIN, APP_COLOR, COMPANY_INFO } from '@/lib/constants'

const resend = new Resend(process.env.RESEND_API_KEY!)

// 10 email types with day offsets
const EMAIL_SEQUENCE = [
  { type: 'welcome', dayOffset: 0, subject: `Bienvenue sur ${APP_NAME} !`, emoji: '🚀' },
  { type: 'tip_day1', dayOffset: 1, subject: `Astuce du jour : tire le meilleur d'${APP_NAME}`, emoji: '💡' },
  { type: 'relaunch_day3', dayOffset: 3, subject: `${APP_NAME} t'attend ! Decouvre ce que tu as manque`, emoji: '👋' },
  { type: 'tips_day7', dayOffset: 7, subject: `7 jours avec ${APP_NAME} — voici tes super-pouvoirs`, emoji: '⚡' },
  { type: 'upgrade_day14', dayOffset: 14, subject: `-20% sur ton abonnement ${APP_NAME} (48h seulement)`, emoji: '🎁' },
  { type: 'testimonial_day21', dayOffset: 21, subject: `3 semaines avec ${APP_NAME} — le point`, emoji: '💬' },
  { type: 'winback_day30', dayOffset: 30, subject: `Tu nous manques sur ${APP_NAME}`, emoji: '💛' },
  { type: 'referral_event', dayOffset: -1, subject: `Ton parrainage a ete valide !`, emoji: '🎉' },
  { type: 'contest_event', dayOffset: -1, subject: `Resultats du concours ${APP_NAME}`, emoji: '🏆' },
  { type: 'milestone_event', dayOffset: -1, subject: `Felicitations ! Tu as atteint un nouveau palier`, emoji: '🌟' },
] as const

type EmailType = (typeof EMAIL_SEQUENCE)[number]['type']

function buildEmailHtml(type: EmailType, userName: string): string {
  const name = userName || 'explorateur'

  const TEMPLATES: Record<EmailType, string> = {
    welcome: `
      <h2>Bienvenue ${name} ! 🌱</h2>
      <p>Tu rejoins <strong>${APP_NAME}</strong>, la methode neuro-phonetique pour graver une langue dans ton cerveau sans cours, sans theorie, sans grammaire.</p>
      <p>Voici ce qui t'attend :</p>
      <ul>
        <li><strong>Natif Instinct™</strong> — La phonetique en 3 couches qui te fait sonner comme un local des la premiere semaine</li>
        <li><strong>HoloTalk</strong> — Conversations vocales avec 6 personas natifs</li>
        <li><strong>Fil de vie</strong> — Ton univers grandit a chaque session</li>
        <li><strong>Parrainage</strong> — Invite ceux que tu aimes, gagne 50% de leur 1er mois</li>
      </ul>
      <p>Ton essai gratuit de 14 jours commence maintenant. Aucune CB demandee.</p>
      <a href="https://${APP_DOMAIN}/dashboard" style="display:inline-block;background:${APP_COLOR};color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin-top:16px;">Lancer ma 1ere session</a>
    `,
    tip_day1: `
      <h2>Salut ${name} ! 💡</h2>
      <p>Le secret pour ne JAMAIS oublier un mot : la repetition espacee couplee a la phonetique 3 couches.</p>
      <ul>
        <li><strong>Couche 1 — Spelling</strong> — Comment le mot s'ecrit</li>
        <li><strong>Couche 2 — IPA</strong> — Comment un linguiste le transcrit</li>
        <li><strong>Couche 3 — Audible FR</strong> — Comment ton oreille francaise l'entend reellement</li>
      </ul>
      <p>10 minutes par jour suffisent. Ton cerveau fait le reste pendant la nuit.</p>
      <a href="https://${APP_DOMAIN}/dashboard/sessions/natif-instinct" style="display:inline-block;background:${APP_COLOR};color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin-top:16px;">Lancer Natif Instinct</a>
    `,
    relaunch_day3: `
      <h2>Hey ${name} ! 👋</h2>
      <p>Ca fait quelques jours qu'on ne t'a pas vu. Une langue, ca s'attrape dans la duree — meme 5 minutes par jour valent mieux qu'1h le dimanche.</p>
      <ul>
        <li>Ton fil de vie t'attend</li>
        <li>Ta mission du jour vaut +30 d'energie VEDA</li>
        <li>Ton streak ne se brisera pas si tu reviens aujourd'hui</li>
      </ul>
      <p>Reviens 5 minutes — ton cerveau te dira merci.</p>
      <a href="https://${APP_DOMAIN}/dashboard" style="display:inline-block;background:${APP_COLOR};color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin-top:16px;">Revenir sur VEDA</a>
    `,
    tips_day7: `
      <h2>1 semaine avec VEDA ! ⚡</h2>
      <p>${name}, une semaine complete, c'est deja une vraie habitude qui se construit. Voici 3 trucs que les apprenants serieux adorent :</p>
      <ol>
        <li><strong>HoloTalk avec Marco</strong> — 5 min de conversation libre = 1 cours particulier</li>
        <li><strong>Vocabulaire spaced repetition</strong> — Revoir 10 mots juste avant qu'ils s'effacent</li>
        <li><strong>Ritual hebdo</strong> — Le dimanche, 20 min pour ancrer ce que tu as appris</li>
      </ol>
      <p>Et chaque session te rapporte XP, energie VEDA et missions impact.</p>
      <a href="https://${APP_DOMAIN}/dashboard/sessions" style="display:inline-block;background:${APP_COLOR};color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin-top:16px;">Choisir ma session</a>
    `,
    upgrade_day14: `
      <h2>Offre exclusive, ${name} ! 🎁</h2>
      <p>Tu termines ton essai de 14 jours. Pour te remercier, voici <strong>-20%</strong> sur ton 1er mois.</p>
      <p>En passant VEDA illimite, tu debloques :</p>
      <ul>
        <li>Sessions Natif Instinct™ illimitees (au lieu de 3/jour)</li>
        <li>HoloTalk avec les 6 personas natifs sans limite</li>
        <li>Wallet de gains reels (parrainage + missions impact)</li>
        <li>16 langues + accent regional au choix</li>
      </ul>
      <p><strong>Code : VIDA20</strong> — 48h seulement.</p>
      <a href="https://${APP_DOMAIN}/pricing" style="display:inline-block;background:${APP_COLOR};color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin-top:16px;">Voir les plans VEDA</a>
    `,
    testimonial_day21: `
      <h2>3 semaines, ${name} 💬</h2>
      <p>Pas de faux témoignages ici — juste un rappel de ce que VEDA fait réellement pour toi :</p>
      <ul>
        <li><strong>Natif Instinct™</strong> — la phonetique 3 couches ancre chaque mot dans ta prononciation reelle, pas juste sa graphie</li>
        <li><strong>HoloTalk</strong> — parler a voix haute avec un persona natif, sans jugement, aussi souvent que tu veux</li>
        <li><strong>Fil de vie</strong> — chaque session compte, meme 10 minutes</li>
      </ul>
      <p>Si tu n'as pas encore essaye HoloTalk, c'est le moment ideal apres 3 semaines de bases.</p>
      <a href="https://${APP_DOMAIN}/dashboard/sessions/holotalk" style="display:inline-block;background:${APP_COLOR};color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin-top:16px;">Tester HoloTalk</a>
    `,
    winback_day30: `
      <h2>${name}, tu nous manques 💛</h2>
      <p>Ca fait un mois qu'on ne t'a pas vu. La langue que tu as commence n'est pas perdue — ton cerveau garde tout.</p>
      <ul>
        <li>10 minutes aujourd'hui = ton streak repart</li>
        <li>Ton vocabulaire t'attend, intact</li>
        <li>Le ritual du dimanche est la pour te remettre en route en douceur</li>
      </ul>
      <p>On t'a garde une place. Pas de jugement, juste un petit pas.</p>
      <a href="https://${APP_DOMAIN}/dashboard" style="display:inline-block;background:${APP_COLOR};color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin-top:16px;">Revenir sur VEDA</a>
    `,
    referral_event: `
      <h2>Parrainage valide ! 🎉</h2>
      <p>${name}, quelqu'un que tu as invite vient de prendre VEDA. <strong>50% de son 1er mois</strong> arrive sur ton wallet.</p>
      <p>Continue de partager — au 5e parrainage, tu passes Vert Vif et gagnes encore plus.</p>
      <a href="https://${APP_DOMAIN}/dashboard/referral" style="display:inline-block;background:${APP_COLOR};color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin-top:16px;">Voir mes parrainages</a>
    `,
    contest_event: `
      <h2>Resultats du concours ! 🏆</h2>
      <p>${name}, les 10 gagnants de la semaine sont tombes. Consulte le classement pour voir si tu en fais partie.</p>
      <a href="https://${APP_DOMAIN}/dashboard/concours" style="display:inline-block;background:${APP_COLOR};color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin-top:16px;">Voir les resultats</a>
    `,
    milestone_event: `
      <h2>Nouveau palier atteint ! 🌟</h2>
      <p>${name}, felicitations ! Tu viens de monter d'un palier sur VEDA.</p>
      <p>De nouvelles recompenses sont debloquees dans ton univers.</p>
      <a href="https://${APP_DOMAIN}/dashboard/achievements" style="display:inline-block;background:${APP_COLOR};color:#fff;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin-top:16px;">Voir mes succes</a>
    `,
  }

  const content = TEMPLATES[type] ?? ''

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:${APP_COLOR};font-size:28px;margin:0;">${APP_NAME}</h1>
    </div>
    <div style="background:#12141f;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:32px;color:#f0f2ff;font-size:15px;line-height:1.7;">
      ${content}
    </div>
    <div style="text-align:center;margin-top:32px;color:rgba(255,255,255,0.35);font-size:12px;">
      <p>${COMPANY_INFO.name} — ${COMPANY_INFO.address}</p>
      <p>${COMPANY_INFO.taxNote}</p>
      <p style="margin-top:8px;">
        <a href="https://${APP_DOMAIN}/aide" style="color:${APP_COLOR};text-decoration:none;">Aide</a> |
        <a href="https://${APP_DOMAIN}/politique-confidentialite" style="color:${APP_COLOR};text-decoration:none;">Confidentialite</a> |
        <a href="https://${APP_DOMAIN}/cgu" style="color:${APP_COLOR};text-decoration:none;">CGU</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

export async function GET() {
  try {
    const supabase = createServiceClient()
    const now = new Date()
    let sent = 0

    // Process day-based sequences (not events)
    const daySequences = EMAIL_SEQUENCE.filter(s => s.dayOffset >= 0)

    for (const seq of daySequences) {
      // Find users who signed up exactly N days ago and haven't received this email
      const targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() - seq.dayOffset)
      const dateStr = targetDate.toISOString().split('T')[0]

      const { data: eligibleUsers } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .gte('created_at', `${dateStr}T00:00:00Z`)
        .lt('created_at', `${dateStr}T23:59:59Z`)

      if (!eligibleUsers?.length) continue

      for (const user of eligibleUsers) {
        if (!user.email) continue

        // Check if already sent
        const { count } = await supabase
          .from('email_sequences')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('email_type', seq.type)

        if (count && count > 0) continue

        // Send email
        try {
          await resend.emails.send({
            from: `${APP_NAME} <noreply@purama.dev>`,
            to: user.email,
            subject: `${seq.emoji} ${seq.subject}`,
            html: buildEmailHtml(seq.type, user.display_name ?? ''),
          })

          // Log in DB
          await supabase.from('email_sequences').insert({
            user_id: user.id,
            email_type: seq.type,
          })

          sent++
        } catch {
          // Skip individual failures, continue with others
        }
      }
    }

    return NextResponse.json({ status: 'ok', sent, timestamp: now.toISOString() })
  } catch {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi des emails. Le service sera retente automatiquement.' }, { status: 500 })
  }
}
