type PublishOpts = {
  url: string
  body: unknown
  delayMs?: number
}

function msToDelaySeconds(ms: number): number {
  if (!Number.isFinite(ms) || ms <= 0) return 0
  return Math.max(1, Math.ceil(ms / 1000))
}

export function buildPublicBaseUrl(fallback: string): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL
  if (env && /^https?:\/\//.test(env)) return env.replace(/\/+$/, '')
  return fallback.replace(/\/+$/, '')
}

export async function qstashPublishJSON({ url, body, delayMs }: PublishOpts) {
  const token = process.env.QSTASH_TOKEN
  if (!token) throw new Error('Missing QSTASH_TOKEN')
  if (!/^https?:\/\//.test(url)) throw new Error(`QStash publish URL must be absolute: ${url}`)

  const destination = `https://qstash.upstash.io/v2/publish/${encodeURIComponent(url)}`
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  const forwardSecret = process.env.QSTASH_FORWARD_SECRET
  if (forwardSecret) {
    headers['Upstash-Forward-Authorization'] = `Bearer ${forwardSecret}`
  }

  const delay = typeof delayMs === 'number' ? msToDelaySeconds(delayMs) : 0
  if (delay > 0) headers['Upstash-Delay'] = `${delay}s`

  const res = await fetch(destination, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`QStash publish failed (${res.status}): ${text}`)
  }

  return res.json().catch(() => ({}))
}

