function getSeoConfig() {
  const baseUrl = process.env.SEO_DATA_PLATFORM_URL?.trim()
  if (!baseUrl) throw new Error('Missing SEO_DATA_PLATFORM_URL')
  const token = process.env.INTERNAL_LOCK_API_TOKEN?.trim() ?? ''
  return { baseUrl: baseUrl.replace(/\/+$/, ''), token }
}

export async function seoPlatformRequest(path, init = {}) {
  const { baseUrl, token } = getSeoConfig()
  const response = await fetch(`${baseUrl}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-internal-token': token } : {}),
      ...(init.headers ?? {}),
    },
    body: init.body,
    cache: 'no-store',
  })
  return response
}

