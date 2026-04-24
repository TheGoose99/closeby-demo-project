type SetIfNotExistsOpts = {
  key: string
  value: unknown
  ttlSeconds: number
}

type UpstashResult<T> = { result: T }

export function hasUpstashRedisEnv(): boolean {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  return Boolean(url && token)
}

function getUpstashConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url) throw new Error('Missing KV_REST_API_URL (or UPSTASH_REDIS_REST_URL)')
  if (!token) throw new Error('Missing KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_TOKEN)')
  return { url: url.replace(/\/+$/, ''), token }
}

async function upstashFetch<T>(path: string, init?: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> }): Promise<T> {
  const { url, token } = getUpstashConfig()
  const res = await fetch(`${url}${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    body: init?.body,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Upstash request failed (${res.status}): ${text}`)
  }
  return (await res.json()) as T
}

export async function redisSetIfNotExists({ key, value, ttlSeconds }: SetIfNotExistsOpts): Promise<boolean> {
  if (!key) throw new Error('redisSetIfNotExists: key is required')
  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) throw new Error('redisSetIfNotExists: ttlSeconds must be > 0')

  const val = typeof value === 'string' ? value : JSON.stringify(value)
  const path = `/set/${encodeURIComponent(key)}/${encodeURIComponent(val)}/NX/EX/${encodeURIComponent(String(ttlSeconds))}`
  const data = await upstashFetch<UpstashResult<string | null>>(path)
  return data.result === 'OK'
}

export async function redisGet(key: string): Promise<string | null> {
  if (!key) throw new Error('redisGet: key is required')
  const data = await upstashFetch<UpstashResult<string | null>>(`/get/${encodeURIComponent(key)}`)
  return data.result ?? null
}

type UpstashPipelineItem<T> = { result?: T; error?: string }

export async function redisMultiExec<T = unknown>(commands: unknown[][]): Promise<UpstashPipelineItem<T>[]> {
  if (!Array.isArray(commands) || commands.length === 0) {
    throw new Error('redisMultiExec: commands must be a non-empty array')
  }

  const { url, token } = getUpstashConfig()
  const res = await fetch(`${url}/multi-exec`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Upstash multi-exec failed (${res.status}): ${text}`)
  }

  return (await res.json()) as UpstashPipelineItem<T>[]
}

