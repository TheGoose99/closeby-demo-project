import type { NextRequest } from 'next/server'
import { hasUpstashRedisEnv, redisMultiExec } from '@/lib/services/upstashRedis'

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwarded) return forwarded
  const realIp = req.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp
  return 'unknown'
}

function parsePositiveInt(raw: string | undefined, fallback: number) {
  const n = Number.parseInt(String(raw ?? ''), 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export async function assertBookingVerifyRateLimit(req: NextRequest, phoneKey: string) {
  if (!hasUpstashRedisEnv()) return

  const windowSeconds = parsePositiveInt(process.env.BOOKING_VERIFY_RL_WINDOW_SECONDS, 15 * 60)
  const maxPerWindow = parsePositiveInt(process.env.BOOKING_VERIFY_RL_MAX_PER_WINDOW, 8)
  const maxPerIpPerWindow = parsePositiveInt(process.env.BOOKING_VERIFY_RL_MAX_PER_IP_PER_WINDOW, 40)

  const ip = clientIp(req)
  const phoneCounterKey = `rl:booking-verify:phone:${phoneKey}`
  const ipCounterKey = `rl:booking-verify:ip:${ip}`

  const phoneResults = await redisMultiExec<number>([
    ['INCR', phoneCounterKey],
    ['EXPIRE', phoneCounterKey, windowSeconds],
  ])
  const phoneCount = phoneResults[0]?.result
  if (typeof phoneCount !== 'number') {
    throw Object.assign(new Error('Rate limit check failed'), { status: 503 })
  }
  if (phoneCount > maxPerWindow) {
    throw Object.assign(new Error('Too many verification attempts'), { status: 429 })
  }

  const ipResults = await redisMultiExec<number>([
    ['INCR', ipCounterKey],
    ['EXPIRE', ipCounterKey, windowSeconds],
  ])
  const ipCount = ipResults[0]?.result
  if (typeof ipCount !== 'number') {
    throw Object.assign(new Error('Rate limit check failed'), { status: 503 })
  }
  if (ipCount > maxPerIpPerWindow) {
    throw Object.assign(new Error('Too many requests'), { status: 429 })
  }
}
