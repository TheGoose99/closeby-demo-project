import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'

import { verifyCalWebhookSignature, parseCalWebhookPayload, getReviewEmailDelay } from '../lib/services/calcom.js'

test('verifyCalWebhookSignature returns true for valid signature', () => {
  const secret = 'whsec_test'
  const body = JSON.stringify({ hello: 'world' })
  const sig = createHmac('sha256', secret).update(body).digest('hex')
  assert.equal(verifyCalWebhookSignature(body, sig, secret), true)
})

test('verifyCalWebhookSignature returns false for invalid signature', () => {
  const secret = 'whsec_test'
  const body = JSON.stringify({ hello: 'world' })
  const sig = createHmac('sha256', secret).update(body).digest('hex')
  assert.equal(verifyCalWebhookSignature(body, sig.slice(0, -1) + '0', secret), false)
})

test('parseCalWebhookPayload returns null for invalid shapes', () => {
  assert.equal(parseCalWebhookPayload(null), null)
  assert.equal(parseCalWebhookPayload({}), null)
  assert.equal(parseCalWebhookPayload({ triggerEvent: 'BOOKING_CREATED' }), null)
})

test('parseCalWebhookPayload returns payload for minimal valid shape', () => {
  const out = parseCalWebhookPayload({ triggerEvent: 'BOOKING_CREATED', payload: { uid: 'x' } })
  assert.equal(out.triggerEvent, 'BOOKING_CREATED')
})

test('getReviewEmailDelay is non-negative', () => {
  const delay = getReviewEmailDelay(new Date(Date.now() - 10_000).toISOString())
  assert.equal(typeof delay, 'number')
  assert.ok(delay >= 0)
})

