import type { NextRequest } from 'next/server'

function normalizeHost(input: string): string | null {
  try {
    if (!input) return null
    if (input.includes('://')) return new URL(input).host.toLowerCase()
    return input.replace(/\/+$/, '').toLowerCase()
  } catch {
    return null
  }
}

function splitList(raw?: string | null): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function collectAllowedHosts(): string[] {
  const hosts = new Set<string>()
  const add = (raw?: string | null) => {
    const host = normalizeHost(raw ?? '')
    if (host) hosts.add(host)
  }

  add(process.env.NEXT_PUBLIC_SITE_URL)
  add(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  for (const item of splitList(process.env.BOOKING_VERIFY_ALLOWED_ORIGINS)) add(item)

  const extra = splitList(process.env.BOOKING_VERIFY_ALLOWED_HOSTS)
  for (const item of extra) add(item)

  return [...hosts]
}

export function assertProductionHttps(req: NextRequest) {
  if (process.env.NODE_ENV !== 'production') return

  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  if (proto !== 'https') {
    throw Object.assign(new Error('HTTPS required'), { status: 403 })
  }
}

export function assertSameSiteBrowserRequest(req: NextRequest) {
  if (process.env.NODE_ENV !== 'production') return

  const mode = process.env.BOOKING_VERIFY_FETCH_SITE_MODE?.trim() || 'strict'
  if (mode === 'off') return

  const secFetchSite = req.headers.get('sec-fetch-site')
  if (!secFetchSite) return

  if (mode === 'strict' && secFetchSite === 'cross-site') {
    throw Object.assign(new Error('Cross-site request blocked'), { status: 403 })
  }
}

export function assertAllowedOrigin(req: NextRequest) {
  const allowedHosts = collectAllowedHosts()
  if (allowedHosts.length === 0) {
    if (process.env.NODE_ENV === 'production' && process.env.BOOKING_VERIFY_TRUST_ANY_ORIGIN !== '1') {
      throw Object.assign(new Error('Server misconfiguration: set NEXT_PUBLIC_SITE_URL (or BOOKING_VERIFY_ALLOWED_HOSTS)'), {
        status: 503,
      })
    }
    return
  }

  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')

  const candidate = origin ?? referer
  if (!candidate) {
    throw Object.assign(new Error('Missing Origin/Referer'), { status: 403 })
  }

  let host: string | null = null
  try {
    host = new URL(candidate).host.toLowerCase()
  } catch {
    host = null
  }
  if (!host || !allowedHosts.includes(host)) {
    throw Object.assign(new Error('Untrusted Origin'), { status: 403 })
  }
}
