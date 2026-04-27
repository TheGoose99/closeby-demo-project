import { NextResponse, type NextRequest } from 'next/server'
import { seoPlatformRequest } from '@/lib/services/seoPlatform.js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const idToken = typeof body?.idToken === 'string' ? body.idToken : ''
    const phoneRaw = typeof body?.phone === 'string' ? body.phone : ''

    if (!idToken) return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
    if (!phoneRaw) return NextResponse.json({ error: 'Missing phone' }, { status: 400 })

    const response = await seoPlatformRequest('/api/internal/firebase/verify-phone', {
      method: 'POST',
      body: JSON.stringify({ idToken, phone: phoneRaw }),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      return NextResponse.json(
        { verified: false, error: data?.error ?? 'Verification failed' },
        { status: response.status },
      )
    }

    return NextResponse.json({ verified: true, phone: data?.phone ?? phoneRaw })
  } catch (e) {
    return NextResponse.json(
      { verified: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }
}
