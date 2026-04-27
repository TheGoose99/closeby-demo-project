import { NextResponse, type NextRequest } from 'next/server'
import { seoPlatformRequest } from '@/lib/services/seoPlatform.js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const phoneRaw = body?.phone
    const idToken = body?.idToken
    if (typeof phoneRaw !== 'string') {
      return NextResponse.json({ error: 'Missing phone' }, { status: 400 })
    }
    if (typeof idToken !== 'string' || !idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
    }
    const response = await seoPlatformRequest('/api/internal/firebase/phone-lock', {
      method: 'POST',
      body: JSON.stringify({ phone: phoneRaw, idToken }),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      return NextResponse.json({ locked: false, error: data?.error ?? 'Lock check failed' }, { status: response.status })
    }
    return NextResponse.json({ locked: !!data?.locked, reason: data?.reason })
  } catch (e) {
    return NextResponse.json(
      { allowed: false, locked: false, error: e instanceof Error ? e.message : String(e) },
      { status: 200 },
    )
  }
}

