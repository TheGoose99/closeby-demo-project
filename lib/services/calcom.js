import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Cal.com webhooks send header: `x-cal-signature-256` which is a hex digest.
 *
 * @param {string} body Raw request body (string)
 * @param {string|null} signature Hex digest from header
 * @param {string} secret Webhook secret
 * @returns {boolean}
 */
export function verifyCalWebhookSignature(body, signature, secret) {
  if (!signature) return false
  if (!secret) return false
  const expected = createHmac('sha256', secret).update(body).digest('hex')
  return timingSafeEqualHex(signature, expected)
}

/**
 * Minimal runtime shape check.
 * @param {unknown} body
 * @returns {import('@/types/calcom').CalWebhookPayload|null}
 */
export function parseCalWebhookPayload(body) {
  try {
    const payload = /** @type {any} */ (body)
    if (!payload?.triggerEvent || !payload?.payload) return null
    return payload
  } catch {
    return null
  }
}

/**
 * Schedule review email ~2h after session ends.
 * @param {string} endTime ISO datetime
 * @returns {number} delay in ms (>= 0)
 */
export function getReviewEmailDelay(endTime) {
  const end = new Date(endTime).getTime()
  const now = Date.now()
  const delay = end + 2 * 60 * 60 * 1000 - now
  return Math.max(delay, 0)
}

function timingSafeEqualHex(aHex, bHex) {
  if (aHex.length !== bHex.length) return false
  const a = Buffer.from(aHex, 'hex')
  const b = Buffer.from(bHex, 'hex')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

