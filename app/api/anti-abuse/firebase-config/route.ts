import { NextResponse } from 'next/server'
import { seoPlatformRequest } from '@/lib/services/seoPlatform.js'

export async function GET() {
  try {
    const response = await seoPlatformRequest('/api/internal/firebase/config', { method: 'GET' })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error ?? 'Failed to fetch Firebase config from seo-data-platform' },
        { status: response.status },
      )
    }

    return NextResponse.json(
      { firebaseConfig: data?.firebaseConfig ?? null },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

