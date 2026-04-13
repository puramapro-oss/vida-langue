import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { APP_NAME } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: string
      email?: string
      message?: string
    }

    const { name, email, message } = body

    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email et message sont requis.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Save escalation in DB
    await supabase.from('support_escalations').insert({
      name: name ?? 'Anonyme',
      email,
      message,
    })

    // Send email via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${APP_NAME} <contact@purama.dev>`,
          to: ['purama.pro@gmail.com'],
          subject: `[Escalade ${APP_NAME}] ${name ?? 'Anonyme'} — ${email}`,
          html: `
            <h2>Escalade support ${APP_NAME}</h2>
            <p><strong>Nom :</strong> ${name ?? 'Non renseigne'}</p>
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Message :</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
        }),
      })

      // Confirmation to user
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${APP_NAME} <contact@purama.dev>`,
          to: [email],
          subject: `Votre demande a ete recue — ${APP_NAME}`,
          html: `
            <p>Bonjour ${name ?? ''},</p>
            <p>Nous avons bien recu votre message. Notre equipe vous repondra sous 24h.</p>
            <p>A bientot,<br>L'equipe ${APP_NAME} 🌱</p>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
