import { NextResponse } from 'next/server'
import type { CalBookingData } from '@/types/calcom'
import { sendReviewRequestEmail } from '@/lib/services/resend'

function isAuthorized(req: Request): boolean {
  const expected = process.env.QSTASH_FORWARD_SECRET
  if (!expected) return true // allow local testing when secret not set
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${expected}`
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const booking = (await req.json()) as CalBookingData
  await sendReviewRequestEmail(booking)
  return NextResponse.json({ ok: true })
}

