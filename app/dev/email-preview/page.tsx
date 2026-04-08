import { notFound } from 'next/navigation'
import clientConfig from '@/config/client'
import { renderEmail } from '@/lib/email/render'
import { BookingConfirmationEmail } from '@/lib/email/templates/BookingConfirmationEmail'
import { BookingReminderEmail } from '@/lib/email/templates/BookingReminderEmail'
import { ReviewRequestEmail } from '@/lib/email/templates/ReviewRequestEmail'
import { ContactAutoReplyEmail } from '@/lib/email/templates/ContactAutoReplyEmail'
import { ContactEmailToTherapist } from '@/lib/email/templates/ContactEmailToTherapist'
import type { CalBookingData } from '@/types/calcom'

export const dynamic = 'force-dynamic'

type PreviewKey = 'booking-confirmation' | 'booking-reminder' | 'review-request' | 'contact-therapist' | 'contact-autoreply'

function isPreviewKey(x: string | null): x is PreviewKey {
  return (
    x === 'booking-confirmation' ||
    x === 'booking-reminder' ||
    x === 'review-request' ||
    x === 'contact-therapist' ||
    x === 'contact-autoreply'
  )
}

export default async function EmailPreviewPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  if (process.env.NODE_ENV !== 'development') notFound()

  const sp = (await searchParams) ?? {}
  const raw = typeof sp.t === 'string' ? sp.t : null
  const t: PreviewKey | null = isPreviewKey(raw) ? raw : null

  const booking: CalBookingData = {
    uid: 'demo_uid_123',
    title: 'Ședință psihoterapie',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
    attendees: [{ name: 'Ion Popescu', email: 'ion.popescu@example.com', timeZone: 'Europe/Bucharest', language: { locale: 'ro' } }],
    organizer: { name: clientConfig.shortName, email: clientConfig.email, timeZone: 'Europe/Bucharest' },
    location: 'Cabinet',
    metadata: {},
  }

  const links: Array<{ key: PreviewKey; label: string }> = [
    { key: 'booking-confirmation', label: 'Booking — Confirmation' },
    { key: 'booking-reminder', label: 'Booking — Reminder (24h)' },
    { key: 'review-request', label: 'Booking — Review request' },
    { key: 'contact-therapist', label: 'Contact — to therapist' },
    { key: 'contact-autoreply', label: 'Contact — auto reply' },
  ]

  if (!t) {
    return (
      <main className="min-h-svh p-6 bg-cream text-ink">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl font-medium mb-2">Email preview (dev-only)</h1>
          <p className="text-ink-l mb-6">
            Alege un template. Route disponibil doar în development.
          </p>
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.key}>
                <a className="text-sage-d underline" href={`/dev/email-preview?t=${l.key}`}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    )
  }

  const { html } = await renderEmail(
    t === 'booking-confirmation'
      ? <BookingConfirmationEmail booking={booking} config={{ shortName: clientConfig.shortName, address: clientConfig.address, gdpr: clientConfig.gdpr }} />
      : t === 'booking-reminder'
        ? <BookingReminderEmail booking={booking} config={{ shortName: clientConfig.shortName, address: clientConfig.address, gdpr: clientConfig.gdpr, phone: clientConfig.phone, phoneDisplay: clientConfig.phoneDisplay }} />
        : t === 'review-request'
          ? <ReviewRequestEmail booking={booking} config={{ shortName: clientConfig.shortName, gdpr: clientConfig.gdpr, integrations: clientConfig.integrations }} />
          : t === 'contact-therapist'
            ? <ContactEmailToTherapist name="Ion Popescu" email="ion.popescu@example.com" message={'Bună ziua!\\nAș dori o programare.'} config={{ shortName: clientConfig.shortName, gdpr: clientConfig.gdpr }} />
            : <ContactAutoReplyEmail name="Ion Popescu" config={{ shortName: clientConfig.shortName, address: clientConfig.address, phoneDisplay: clientConfig.phoneDisplay, gdpr: clientConfig.gdpr }} />
  )

  return (
    <main className="min-h-svh p-3 bg-cream">
      <div className="max-w-[900px] mx-auto">
        <div className="flex items-center justify-between gap-3 mb-3">
          <a className="text-sage-d underline text-sm" href="/dev/email-preview">
            ← Back
          </a>
          <div className="text-xs text-ink-l">Template: {t}</div>
        </div>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-2 bg-ink text-white/80 text-xs">Rendered HTML (isolated)</div>
          <iframe
            title={`email-preview-${t}`}
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
            className="w-full h-[80vh] bg-white"
            srcDoc={html}
          />
        </div>
      </div>
    </main>
  )
}

