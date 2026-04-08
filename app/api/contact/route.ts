import { type NextRequest, NextResponse } from 'next/server'
import clientConfig from '@/config/client'
import { Resend } from 'resend'
import { createElement } from 'react'
import { renderEmail } from '@/lib/email/render'
import { getFromAddress } from '@/lib/email/utils'
import { ContactEmailToTherapist } from '@/lib/email/templates/ContactEmailToTherapist'
import { ContactAutoReplyEmail } from '@/lib/email/templates/ContactAutoReplyEmail'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

// Simple rate limiting per IP
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_MS = 60_000 // 1 request per minute per IP

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const lastRequest = rateLimitMap.get(ip) ?? 0

    if (Date.now() - lastRequest < RATE_LIMIT_MS) {
      return NextResponse.json({ error: 'Prea multe cereri. Așteptați un minut.' }, { status: 429 })
    }
    rateLimitMap.set(ip, Date.now())

    const { name, email, message, gdprConsent } = await req.json()

    // Validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Câmpuri obligatorii lipsă.' }, { status: 400 })
    }
    if (!gdprConsent) {
      return NextResponse.json({ error: 'Consimțământ GDPR necesar.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Adresă de email invalidă.' }, { status: 400 })
    }

    const from = getFromAddress(clientConfig)

    // Send to therapist
    const toTherapist = await renderEmail(
      createElement(ContactEmailToTherapist, {
        name,
        email,
        message,
        config: { shortName: clientConfig.shortName, gdpr: clientConfig.gdpr },
      })
    )
    await getResend().emails.send({
      from,
      to: clientConfig.email,
      replyTo: email,
      subject: `Mesaj nou de la ${name} — Cabinet ${clientConfig.shortName}`,
      html: toTherapist.html,
      text: toTherapist.text,
    })

    // Send confirmation to sender
    const autoReply = await renderEmail(
      createElement(ContactAutoReplyEmail, {
        name,
        config: {
          shortName: clientConfig.shortName,
          address: clientConfig.address,
          phoneDisplay: clientConfig.phoneDisplay,
          gdpr: clientConfig.gdpr,
        },
      })
    )
    await getResend().emails.send({
      from,
      to: email,
      subject: `Am primit mesajul tău — ${clientConfig.shortName}`,
      html: autoReply.html,
      text: autoReply.text,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact] Error:', err)
    return NextResponse.json({ error: 'Eroare internă. Vă rugăm să ne contactați telefonic.' }, { status: 500 })
  }
}
