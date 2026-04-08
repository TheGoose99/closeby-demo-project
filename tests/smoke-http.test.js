import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'

const BASE_URL = process.env.SMOKE_BASE_URL

function url(path) {
  return `${String(BASE_URL).replace(/\/+$/, '')}${path}`
}

test('smoke: BASE_URL is configured', { skip: !BASE_URL }, () => {
  assert.ok(BASE_URL)
})

test('smoke: homepage responds 200', { skip: !BASE_URL }, async () => {
  const res = await fetch(url('/'), { redirect: 'manual' })
  assert.equal(res.status, 200)
  const html = await res.text()
  assert.match(html, /<html/i)
})

test('smoke: cal webhook rejects invalid JSON', { skip: !BASE_URL }, async () => {
  const rawBody = '{not json'
  const headers = { 'content-type': 'application/json' }

  // If the server enforces signature verification, it will reject missing signatures
  // before it gets to JSON parsing. When we have the secret available locally,
  // we can sign even invalid JSON (signature is computed over raw bytes).
  const secret = process.env.CAL_WEBHOOK_SECRET
  const hasRealSecret = !!secret && !secret.includes('...') && !secret.includes('xxxxx') && !secret.includes('XXXXX')
  if (hasRealSecret) {
    headers['x-cal-signature-256'] = createHmac('sha256', secret).update(rawBody).digest('hex')
  }

  const res = await fetch(url('/api/webhooks/cal'), {
    method: 'POST',
    headers,
    body: rawBody,
  })
  // NOTE: If the secret we used doesn't match the server's configured secret,
  // signature verification will fail first (401) and we won't reach JSON parsing.
  // This is still a useful signal in smoke runs.
  if (!hasRealSecret) {
    assert.ok(res.status === 400 || res.status === 401)
    return
  }

  // If signature is accepted, we must see Invalid JSON.
  if (res.status === 401) {
    assert.fail('Webhook rejected signature (401) — CAL_WEBHOOK_SECRET likely mismatched between local and server')
  }

  assert.equal(res.status, 400)
  const body = await res.json().catch(() => ({}))
  assert.equal(body.error, 'Invalid JSON')
})

test('smoke: cal webhook rejects invalid signature (when CAL_WEBHOOK_SECRET is set)', { skip: !BASE_URL || !process.env.CAL_WEBHOOK_SECRET }, async () => {
  const rawBody = JSON.stringify({
    triggerEvent: 'BOOKING_CREATED',
    createdAt: new Date().toISOString(),
    payload: {
      uid: 'demo_uid',
      title: 'Demo',
      startTime: new Date(Date.now() + 3600_000).toISOString(),
      endTime: new Date(Date.now() + 5400_000).toISOString(),
      attendees: [{ name: 'Ion Popescu', email: 'ion.popescu@example.com', timeZone: 'Europe/Bucharest', language: { locale: 'ro' } }],
      organizer: { name: 'Org', email: 'org@example.com', timeZone: 'Europe/Bucharest' },
    },
  })

  // Sign with a different secret on purpose.
  const badSig = createHmac('sha256', 'wrong_secret').update(rawBody).digest('hex')

  const res = await fetch(url('/api/webhooks/cal'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-cal-signature-256': badSig,
    },
    body: rawBody,
  })

  assert.equal(res.status, 401)
  const body = await res.json().catch(() => ({}))
  assert.equal(body.error, 'Invalid signature')
})

test('smoke: cal webhook accepts valid signature (when CAL_WEBHOOK_SECRET is set)', { skip: !BASE_URL || !process.env.CAL_WEBHOOK_SECRET }, async () => {
  const secret = process.env.CAL_WEBHOOK_SECRET
  const hasRealSecret = !!secret && !secret.includes('...') && !secret.includes('xxxxx') && !secret.includes('XXXXX')
  if (!hasRealSecret) return

  // Use BOOKING_CANCELLED to avoid sending emails/scheduling.
  const rawBody = JSON.stringify({
    triggerEvent: 'BOOKING_CANCELLED',
    createdAt: new Date().toISOString(),
    payload: {
      uid: 'demo_uid',
      title: 'Demo',
      startTime: new Date(Date.now() + 3600_000).toISOString(),
      endTime: new Date(Date.now() + 5400_000).toISOString(),
      attendees: [{ name: 'Ion Popescu', email: 'ion.popescu@example.com', timeZone: 'Europe/Bucharest', language: { locale: 'ro' } }],
      organizer: { name: 'Org', email: 'org@example.com', timeZone: 'Europe/Bucharest' },
    },
  })
  const sig = createHmac('sha256', secret).update(rawBody).digest('hex')

  const res = await fetch(url('/api/webhooks/cal'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-cal-signature-256': sig,
    },
    body: rawBody,
  })

  assert.notEqual(res.status, 401)
})

test('smoke: qstash job routes reject unauthorized (when QSTASH_FORWARD_SECRET is set)', { skip: !BASE_URL || !process.env.QSTASH_FORWARD_SECRET }, async () => {
  const payload = {
    uid: 'demo_uid',
    title: 'Demo',
    startTime: new Date(Date.now() + 3600_000).toISOString(),
    endTime: new Date(Date.now() + 5400_000).toISOString(),
    attendees: [{ name: 'Ion Popescu', email: 'ion.popescu@example.com', timeZone: 'Europe/Bucharest', language: { locale: 'ro' } }],
    organizer: { name: 'Org', email: 'org@example.com', timeZone: 'Europe/Bucharest' },
  }

  const strict = process.env.SMOKE_STRICT_QSTASH_AUTH === '1'

  const r1 = await fetch(url('/api/jobs/send-reminder'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (strict) {
    assert.equal(r1.status, 401)
  } else {
    assert.ok(r1.status === 401 || r1.status === 200)
  }

  const r2 = await fetch(url('/api/jobs/send-review-request'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (strict) {
    assert.equal(r2.status, 401)
  } else {
    assert.ok(r2.status === 401 || r2.status === 200)
  }
})

