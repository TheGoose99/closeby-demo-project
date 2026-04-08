import { Resend } from 'resend'
import type { CalBookingData } from '@/types/calcom'
import clientConfig from '@/config/client'
import { createElement } from 'react'
import { renderEmail } from '@/lib/email/render'
import { BookingConfirmationEmail } from '@/lib/email/templates/BookingConfirmationEmail'
import { BookingReminderEmail } from '@/lib/email/templates/BookingReminderEmail'
import { ReviewRequestEmail } from '@/lib/email/templates/ReviewRequestEmail'
import { formatDateTimeRo, getFromAddress } from '@/lib/email/utils'

// Lazy init — avoids build-time crash when RESEND_API_KEY is not set
function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

const FROM = getFromAddress(clientConfig)

export async function sendConfirmationEmail(booking: CalBookingData) {
  const attendee = booking.attendees[0]
  if (!attendee) throw new Error(`No attendee in booking ${booking.uid}`)
  const dateTime = formatDateTimeRo(booking.startTime)
  const { html, text } = await renderEmail(
    createElement(BookingConfirmationEmail, {
      booking,
      config: { shortName: clientConfig.shortName, address: clientConfig.address, gdpr: clientConfig.gdpr },
    })
  )

  await getResend().emails.send({
    from: FROM,
    to: attendee.email,
    subject: `✓ Programarea ta a fost confirmată — ${dateTime}`,
    html,
    text,
  })
}

export async function sendReminderEmail(booking: CalBookingData) {
  const attendee = booking.attendees[0]
  if (!attendee) throw new Error(`No attendee in booking ${booking.uid}`)
  const dateTime = formatDateTimeRo(booking.startTime)
  const { html, text } = await renderEmail(
    createElement(BookingReminderEmail, {
      booking,
      config: {
        shortName: clientConfig.shortName,
        address: clientConfig.address,
        gdpr: clientConfig.gdpr,
        phone: clientConfig.phone,
        phoneDisplay: clientConfig.phoneDisplay,
      },
    })
  )

  await getResend().emails.send({
    from: FROM,
    to: attendee.email,
    subject: `Mâine te așteptăm — ${dateTime}`,
    html,
    text,
  })
}

export async function sendReviewRequestEmail(booking: CalBookingData) {
  const attendee = booking.attendees[0]
  if (!attendee) throw new Error(`No attendee in booking ${booking.uid}`)
  const reviewLink = clientConfig.integrations.reviewLink
  if (!reviewLink) return
  // Guard against placeholder links in demo configs.
  if (reviewLink.includes('XXXXX') || reviewLink.includes('xxxx')) return

  const { html, text } = await renderEmail(
    createElement(ReviewRequestEmail, {
      booking,
      config: { shortName: clientConfig.shortName, gdpr: clientConfig.gdpr, integrations: clientConfig.integrations },
    })
  )

  await getResend().emails.send({
    from: FROM,
    to: attendee.email,
    subject: `Cum a fost ședința? Lasă-ne o recenzie`,
    html,
    text,
  })
}
