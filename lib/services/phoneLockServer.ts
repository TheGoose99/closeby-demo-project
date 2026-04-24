import { normalizePhone } from '@/lib/antiAbuse/phone.js'
import { redisSetIfNotExists } from '@/lib/services/upstashRedis'

export type PhoneLockAcquireResult = {
  allowed: boolean
  locked: boolean
  error?: string
}

function requireInternalLockTokenWhenProxying() {
  const seoBaseUrl = process.env.SEO_DATA_PLATFORM_URL?.trim()
  if (!seoBaseUrl) return

  const token = process.env.INTERNAL_LOCK_API_TOKEN?.trim()
  const strict =
    process.env.NODE_ENV === 'production' ||
    process.env.INTERNAL_LOCK_API_TOKEN_REQUIRED === '1' ||
    process.env.INTERNAL_LOCK_API_STRICT === '1'

  if (strict && !token) {
    throw Object.assign(new Error('Server misconfiguration: INTERNAL_LOCK_API_TOKEN is required when SEO_DATA_PLATFORM_URL is set'), {
      status: 503,
    })
  }
}

export async function acquirePhoneLockServer(rawPhone: string): Promise<PhoneLockAcquireResult> {
  const phone = normalizePhone(rawPhone)
  if (!phone) {
    return { allowed: false, locked: false, error: 'Invalid phone' }
  }

  const seoBaseUrl = process.env.SEO_DATA_PLATFORM_URL?.trim()
  if (seoBaseUrl) {
    requireInternalLockTokenWhenProxying()
    const response = await fetch(`${seoBaseUrl.replace(/\/+$/, '')}/api/locks/phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.INTERNAL_LOCK_API_TOKEN
          ? { 'x-internal-token': process.env.INTERNAL_LOCK_API_TOKEN }
          : {}),
      },
      body: JSON.stringify({ phone }),
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      return { allowed: false, locked: false, error: payload?.error ?? 'Remote lock check failed' }
    }
    return {
      allowed: Boolean(payload.allowed),
      locked: Boolean(payload.locked),
      error: typeof payload.error === 'string' ? payload.error : undefined,
    }
  }

  const allowed = await redisSetIfNotExists({
    key: `lock:phone:${phone}`,
    value: { createdAt: new Date().toISOString(), source: 'closeby-demo-project' },
    ttlSeconds: 24 * 60 * 60,
  })
  return { allowed, locked: !allowed }
}
