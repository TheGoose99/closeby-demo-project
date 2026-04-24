import { NextResponse, type NextRequest } from 'next/server'
import { normalizePhone } from '@/lib/antiAbuse/phone.js'
import { verifyFirebaseAppCheckToken } from '@/lib/firebase/appCheckServer'
import { getFirebaseAdminAuth } from '@/lib/firebase/admin'
import {
  assertAllowedOrigin,
  assertProductionHttps,
  assertSameSiteBrowserRequest,
} from '@/lib/security/requestGuards'
import { acquirePhoneLockServer } from '@/lib/services/phoneLockServer'
import { assertBookingVerifyRateLimit } from '@/lib/services/verifyPhoneRateLimit'

function getExpectedClientSlug(): string {
  return process.env.CLIENT_SLUG?.trim() || ''
}

function getFirebaseProjectId(): string {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()
    if (!raw) return ''
    const parsed = JSON.parse(raw) as { project_id?: string }
    return String(parsed.project_id ?? '').trim()
  } catch {
    return ''
  }
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function POST(req: NextRequest) {
  try {
    assertProductionHttps(req)
    assertSameSiteBrowserRequest(req)
    assertAllowedOrigin(req)

    const body = await req.json().catch(() => null)
    const idToken = typeof body?.idToken === 'string' ? body.idToken.trim() : ''
    const phoneRaw = typeof body?.phone === 'string' ? body.phone : ''
    const clientSlug = typeof body?.clientSlug === 'string' ? body.clientSlug.trim() : ''
    const appCheckToken =
      typeof body?.appCheckToken === 'string'
        ? body.appCheckToken.trim()
        : req.headers.get('x-firebase-appcheck')?.trim() ?? ''

    if (!idToken) return jsonError('Missing idToken', 400)
    if (!phoneRaw) return jsonError('Missing phone', 400)
    if (!clientSlug) return jsonError('Missing clientSlug', 400)

    const expected = getExpectedClientSlug()
    if (process.env.NODE_ENV === 'production' && process.env.BOOKING_VERIFY_REQUIRE_CLIENT_SLUG === '1' && !expected) {
      return jsonError('Server misconfiguration: CLIENT_SLUG is required', 503)
    }
    if (expected && clientSlug !== expected) {
      return jsonError('Invalid clientSlug', 403)
    }

    const phone = normalizePhone(phoneRaw)
    if (!phone) return jsonError('Invalid phone', 400)

    await assertBookingVerifyRateLimit(req, phone)

    const decoded = await getFirebaseAdminAuth().verifyIdToken(idToken, true)

    const projectId = getFirebaseProjectId()
    if (projectId) {
      const aud = String(decoded.aud ?? '')
      if (aud && aud !== projectId) {
        return jsonError('Invalid Firebase token audience', 401)
      }

      const iss = String(decoded.iss ?? '')
      const expectedIss = `https://securetoken.google.com/${projectId}`
      if (iss && iss !== expectedIss) {
        return jsonError('Invalid Firebase token issuer', 401)
      }
    }

    const signInProvider = String((decoded as { firebase?: { sign_in_provider?: string } }).firebase?.sign_in_provider ?? '')
    if (signInProvider && signInProvider !== 'phone') {
      return jsonError('Invalid authentication method', 401)
    }

    const tokenPhone = normalizePhone(String(decoded.phone_number ?? ''))
    if (!tokenPhone || tokenPhone !== phone) {
      return jsonError('Phone mismatch for Firebase token', 401)
    }

    const enforceAppCheck = process.env.FIREBASE_APPCHECK_ENFORCE === '1'
    if (enforceAppCheck) {
      if (!appCheckToken) return jsonError('Missing App Check token', 401)
      await verifyFirebaseAppCheckToken(appCheckToken)
    }

    const lock = await acquirePhoneLockServer(phoneRaw)
    return NextResponse.json(
      {
        ok: true,
        allowed: lock.allowed,
        locked: lock.locked,
        error: lock.error,
        clientSlug,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (e) {
    const status = typeof (e as { status?: unknown })?.status === 'number' ? (e as { status: number }).status : 400
    const message = e instanceof Error ? e.message : String(e)
    return jsonError(message, status)
  }
}
