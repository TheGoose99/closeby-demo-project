import { resolveCalApiKey } from '@/lib/integrations/resolveCalSecrets'

type DeclineBookingOpts = {
  bookingUid: string
  reason?: string
  /** When set (e.g. webhook already resolved DB+env), avoids a second secrets fetch. */
  apiKey?: string
}

export async function declineCalBookingByUid({ bookingUid, reason, apiKey: apiKeyOpt }: DeclineBookingOpts) {
  const apiKey = apiKeyOpt ?? (await resolveCalApiKey())
  if (!apiKey) throw new Error('Missing Cal API key (tenant DB or CAL_API_KEY)')
  if (!bookingUid) throw new Error('declineCalBookingByUid: bookingUid is required')

  const res = await fetch(`https://api.cal.com/v2/bookings/${encodeURIComponent(bookingUid)}/decline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'cal-api-version': '2026-02-25',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason: reason ?? 'Duplicate booking request (phone locked)' }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Cal decline failed (${res.status}): ${text}`)
  }

  return res.json().catch(() => ({}))
}

