import { NextResponse, type NextRequest } from 'next/server'
import { normalizePhone } from '@/lib/antiAbuse/phone.js'
import { acquirePhoneLockServer } from '@/lib/services/phoneLockServer'

function isPublicPhoneLockEnabled() {
  if (process.env.ENABLE_PUBLIC_PHONE_LOCK_API === '1') return true
  return process.env.NODE_ENV !== 'production'
}

function isAuthorized(req: NextRequest) {
  const expected = process.env.PHONE_LOCK_API_TOKEN?.trim()
  if (!expected) return false
  const given = req.headers.get('x-phone-lock-token')?.trim()
  return given === expected
}

export async function POST(req: NextRequest) {
  try {
    if (!isPublicPhoneLockEnabled() && !isAuthorized(req)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await req.json().catch(() => null)
    const phoneRaw = body?.phone
    if (typeof phoneRaw !== 'string') {
      return NextResponse.json({ error: 'Missing phone' }, { status: 400 })
    }

    const phone = normalizePhone(phoneRaw)
    if (!phone) {
      return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })
    }

    const result = await acquirePhoneLockServer(phoneRaw)
    return NextResponse.json(result, { status: 200 })
  } catch (e) {
    return NextResponse.json(
      { allowed: false, locked: false, error: e instanceof Error ? e.message : String(e) },
      { status: 200 },
    )
  }
}

