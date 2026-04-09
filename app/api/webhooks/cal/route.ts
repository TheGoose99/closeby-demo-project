import { type NextRequest, NextResponse } from 'next/server'
import { verifyCalWebhookSignature, parseCalWebhookPayload, getReviewEmailDelay } from '@/lib/services/calcom'
import { sendConfirmationEmail, sendReminderEmail, sendReviewRequestEmail } from '@/lib/services/resend'
import clientConfig from '@/config/client'
import { buildPublicBaseUrl, qstashPublishJSON } from '@/lib/services/qstash'
import { extractPhoneFromCalPayload } from '@/lib/antiAbuse/phone.js'
import { redisSetIfNotExists } from '@/lib/services/upstashRedis'
import { declineCalBookingByUid } from '@/lib/services/calApi'

const WEBHOOK_SECRET = process.env.CAL_WEBHOOK_SECRET ?? ''

// Simple in-memory idempotency (use Redis/KV in production)
const processed = new Set<string>()

export async function POST(req: NextRequest) {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/27dfd52d-6f68-4075-94cf-d2f93a4ea8d6', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '351dd2' },
      body: JSON.stringify({
        sessionId: '351dd2',
        runId: 'pre-fix',
        hypothesisId: 'H_entry',
        location: 'app/api/webhooks/cal/route.ts:POST:entry',
        message: 'cal-webhook hit',
        data: {
          hasWebhookSecret: !!WEBHOOK_SECRET,
          hasUpstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
          hasUpstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
          hasCalApiKey: !!process.env.CAL_API_KEY,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion agent log

    const rawBody = await req.text()
    const signature = req.headers.get('x-cal-signature-256')

    // Verify webhook authenticity
    if (WEBHOOK_SECRET) {
      const ok = verifyCalWebhookSignature(rawBody, signature, WEBHOOK_SECRET)
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/27dfd52d-6f68-4075-94cf-d2f93a4ea8d6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '351dd2' },
        body: JSON.stringify({
          sessionId: '351dd2',
          runId: 'pre-fix',
          hypothesisId: 'H_sig',
          location: 'app/api/webhooks/cal/route.ts:POST:signature-check',
          message: 'signature verification result',
          data: { ok, hasSignatureHeader: !!signature, rawBodyLength: rawBody.length },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion agent log
      if (!ok) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    let body: unknown
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    const event = parseCalWebhookPayload(body)

    if (!event) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { triggerEvent, payload } = event
    const idempotencyKey = `${triggerEvent}:${payload.uid}`

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/27dfd52d-6f68-4075-94cf-d2f93a4ea8d6', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '351dd2' },
      body: JSON.stringify({
        sessionId: '351dd2',
        runId: 'pre-fix',
        hypothesisId: 'H_event',
        location: 'app/api/webhooks/cal/route.ts:POST:after-parse',
        message: 'cal-webhook parsed event',
        data: {
          triggerEvent,
          hasUid: !!payload?.uid,
          uidSuffix: typeof payload?.uid === 'string' ? payload.uid.slice(-6) : null,
          hasResponsesPhone: !!(payload as any)?.responses?.attendeePhoneNumber,
          hasAttendeePhone: !!(payload as any)?.attendees?.[0]?.phoneNumber,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion agent log

    // Prevent duplicate processing
    if (processed.has(idempotencyKey)) {
      return NextResponse.json({ ok: true, duplicate: true })
    }
    processed.add(idempotencyKey)

    // Durable idempotency (recommended for serverless): only if Upstash is configured.
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const processedKey = `processed:webhook:${idempotencyKey}`
      try {
        const firstTime = await redisSetIfNotExists({
          key: processedKey,
          value: { at: new Date().toISOString() },
          ttlSeconds: 48 * 60 * 60,
        })
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/27dfd52d-6f68-4075-94cf-d2f93a4ea8d6', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '351dd2' },
          body: JSON.stringify({
            sessionId: '351dd2',
            runId: 'pre-fix',
            hypothesisId: 'H_idempotency',
            location: 'app/api/webhooks/cal/route.ts:POST:durable-idempotency',
            message: 'durable idempotency SET NX attempted',
            data: { firstTime },
            timestamp: Date.now(),
          }),
        }).catch(() => {})
        // #endregion agent log
        if (!firstTime) {
          return NextResponse.json({ ok: true, duplicate: true, durable: true })
        }
      } catch (e) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/27dfd52d-6f68-4075-94cf-d2f93a4ea8d6', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '351dd2' },
          body: JSON.stringify({
            sessionId: '351dd2',
            runId: 'pre-fix',
            hypothesisId: 'H_upstash',
            location: 'app/api/webhooks/cal/route.ts:POST:durable-idempotency',
            message: 'Upstash durable idempotency failed',
            data: { error: e instanceof Error ? e.message : String(e) },
            timestamp: Date.now(),
          }),
        }).catch(() => {})
        // #endregion agent log
        // Fail open in Phase 1: don't 500 the webhook if Upstash is down/misconfigured.
      }
    }

    switch (triggerEvent) {
      case 'BOOKING_REQUESTED':
      case 'BOOKING_CREATED':
        // Phone lock (Phase 1): best-effort spam protection; requires Upstash + Cal API key.
        const phone = extractPhoneFromCalPayload(payload)
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/27dfd52d-6f68-4075-94cf-d2f93a4ea8d6', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '351dd2' },
          body: JSON.stringify({
            sessionId: '351dd2',
            runId: 'pre-fix',
            hypothesisId: 'H_phone',
            location: 'app/api/webhooks/cal/route.ts:POST:phone-extract',
            message: 'extracted phone for lock',
            data: {
              phonePresent: !!phone,
              phoneSuffix: phone ? phone.slice(-4) : null,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {})
        // #endregion agent log
        if (phone && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
          const lockKey = `lock:phone:${phone}`
          let acquired: boolean | null = null
          try {
            acquired = await redisSetIfNotExists({
              key: lockKey,
              value: { uid: payload.uid, createdAt: new Date().toISOString() },
              ttlSeconds: 24 * 60 * 60,
            })
          } catch (e) {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/27dfd52d-6f68-4075-94cf-d2f93a4ea8d6', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '351dd2' },
              body: JSON.stringify({
                sessionId: '351dd2',
                runId: 'pre-fix',
                hypothesisId: 'H_upstash',
                location: 'app/api/webhooks/cal/route.ts:POST:phone-lock',
                message: 'Upstash phone lock failed',
                data: { error: e instanceof Error ? e.message : String(e) },
                timestamp: Date.now(),
              }),
            }).catch(() => {})
            // #endregion agent log
          }
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/27dfd52d-6f68-4075-94cf-d2f93a4ea8d6', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '351dd2' },
            body: JSON.stringify({
              sessionId: '351dd2',
              runId: 'pre-fix',
              hypothesisId: 'H_lock',
              location: 'app/api/webhooks/cal/route.ts:POST:phone-lock',
              message: 'phone lock SET NX attempted',
              data: { acquired },
              timestamp: Date.now(),
            }),
          }).catch(() => {})
          // #endregion agent log

          if (acquired === false) {
            try {
              if (process.env.CAL_API_KEY) {
                await declineCalBookingByUid({
                  bookingUid: payload.uid,
                  reason: 'Duplicate booking request (phone locked for 24h)',
                })
              } else {
                console.warn('[cal-webhook] Duplicate phone lock but CAL_API_KEY missing; cannot auto-decline', {
                  phone,
                  uid: payload.uid,
                })
              }
            } catch (e) {
              console.error('[cal-webhook] Failed to auto-decline duplicate booking', e)
            }

            // Always ack; do not send emails / schedule jobs for duplicates.
            return NextResponse.json({ ok: true, phoneLocked: true })
          }
        }

        await sendConfirmationEmail(payload)
        // Schedule 24h reminder using QStash (durable scheduling on Vercel)
        const reminderDelayMs = new Date(payload.startTime).getTime() - Date.now() - 24 * 3600 * 1000
        if (reminderDelayMs > 0 && process.env.QSTASH_TOKEN) {
          const baseUrl = buildPublicBaseUrl(clientConfig.website)
          await qstashPublishJSON({
            url: `${baseUrl}/api/jobs/send-reminder`,
            body: payload,
            delayMs: reminderDelayMs,
          })
        } else if (reminderDelayMs > 0) {
          // Fallback (demo/dev): best-effort in-process timer
          setTimeout(() => sendReminderEmail(payload), reminderDelayMs)
        }
        break

      case 'BOOKING_CANCELLED':
        // No review email for cancelled bookings
        break

      case 'BOOKING_RESCHEDULED':
        await sendConfirmationEmail(payload)
        break

      default:
        // BOOKING_CONFIRMED or other — schedule review request after session ends
        const reviewDelayMs = getReviewEmailDelay(payload.endTime)
        if (reviewDelayMs > 0 && process.env.QSTASH_TOKEN) {
          const baseUrl = buildPublicBaseUrl(clientConfig.website)
          await qstashPublishJSON({
            url: `${baseUrl}/api/jobs/send-review-request`,
            body: payload,
            delayMs: reviewDelayMs,
          })
        } else {
          setTimeout(() => sendReviewRequestEmail(payload), reviewDelayMs)
        }
    }

    return NextResponse.json({ ok: true, event: triggerEvent })
  } catch (err) {
    console.error('[cal-webhook] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
