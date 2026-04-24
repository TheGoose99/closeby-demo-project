import { NextResponse } from 'next/server'

/** CSP report-only / report-to sink (no PII stored; extend if you ingest reports). */
export async function POST() {
  return new NextResponse(null, { status: 204 })
}
