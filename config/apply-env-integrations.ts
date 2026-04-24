import type { ClientConfig } from '@/types/client-config'

type CalSlugMap = {
  initial: string
  session: string
  couple: string
}

export function parseCalSlugMapFromEnv(value: string | undefined): CalSlugMap | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as Partial<CalSlugMap>
    if (!parsed || typeof parsed !== 'object') return null
    if (
      typeof parsed.initial !== 'string' ||
      typeof parsed.session !== 'string' ||
      typeof parsed.couple !== 'string'
    ) {
      return null
    }
    return {
      initial: parsed.initial,
      session: parsed.session,
      couple: parsed.couple,
    }
  } catch {
    return null
  }
}

/** Non-secret Cal embed fields from `NEXT_PUBLIC_*` env (per deployment / Vercel project). */
export function applyPublicIntegrationEnvOverrides(config: ClientConfig): ClientConfig {
  const calComUsername = process.env.NEXT_PUBLIC_CAL_COM_USERNAME
  const canonicalEventSlugs = parseCalSlugMapFromEnv(process.env.NEXT_PUBLIC_CAL_COM_CANONICAL_EVENT_SLUGS_JSON)
  const overrideEventSlugs = parseCalSlugMapFromEnv(process.env.NEXT_PUBLIC_CAL_COM_EVENT_SLUGS_JSON)

  return {
    ...config,
    integrations: {
      ...config.integrations,
      ...(calComUsername ? { calComUsername } : {}),
      ...(canonicalEventSlugs ? { calComCanonicalEventSlugs: canonicalEventSlugs } : {}),
      ...(overrideEventSlugs ? { calComEventSlugs: overrideEventSlugs } : {}),
    },
  }
}
