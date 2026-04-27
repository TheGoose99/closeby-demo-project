import test from 'node:test'
import assert from 'node:assert/strict'
import { seoPlatformRequest } from '../lib/services/seoPlatform.js'

test('seoPlatformRequest injects x-internal-token header', async () => {
  const originalFetch = global.fetch
  const originalUrl = process.env.SEO_DATA_PLATFORM_URL
  const originalToken = process.env.INTERNAL_LOCK_API_TOKEN
  try {
    process.env.SEO_DATA_PLATFORM_URL = 'https://seo.local'
    process.env.INTERNAL_LOCK_API_TOKEN = 'abc123'

    /** @type {RequestInit | undefined} */
    let capturedInit
    global.fetch = /** @type {typeof fetch} */ (async (_url, init) => {
      capturedInit = init
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
    })

    await seoPlatformRequest('/api/internal/firebase/config', { method: 'GET' })
    assert.equal(capturedInit?.headers?.['x-internal-token'], 'abc123')
  } finally {
    global.fetch = originalFetch
    if (originalUrl === undefined) delete process.env.SEO_DATA_PLATFORM_URL
    else process.env.SEO_DATA_PLATFORM_URL = originalUrl
    if (originalToken === undefined) delete process.env.INTERNAL_LOCK_API_TOKEN
    else process.env.INTERNAL_LOCK_API_TOKEN = originalToken
  }
})

test('seoPlatformRequest throws when SEO_DATA_PLATFORM_URL missing', async () => {
  const originalUrl = process.env.SEO_DATA_PLATFORM_URL
  delete process.env.SEO_DATA_PLATFORM_URL
  try {
    await assert.rejects(
      () => seoPlatformRequest('/api/internal/firebase/config', { method: 'GET' }),
      /Missing SEO_DATA_PLATFORM_URL/,
    )
  } finally {
    if (originalUrl !== undefined) process.env.SEO_DATA_PLATFORM_URL = originalUrl
  }
})

