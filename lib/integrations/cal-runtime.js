/**
 * @typedef {{ initial?: string, session?: string, couple?: string }} EventSlugTriple
 * @typedef {{ calComUsername?: string, calComCanonicalEventSlugs?: EventSlugTriple, calComEventSlugs?: EventSlugTriple }} TenantCalOverrides
 */

/**
 * @template T
 * @param {string | undefined} raw
 * @returns {T | null}
 */
function safeParseJson(raw) {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * @param {EventSlugTriple} base
 * @param {EventSlugTriple | undefined} override
 */
function mergeEventSlugs(base, override) {
  if (!override) {
    return {
      initial: base.initial ?? '',
      session: base.session,
      couple: base.couple,
    }
  }
  return {
    initial: override.initial ?? base.initial ?? '',
    session: override.session ?? base.session,
    couple: override.couple ?? base.couple,
  }
}

/**
 * @param {string} clientSlug
 * @param {string | undefined} tenantRaw
 * @returns {TenantCalOverrides}
 */
function readTenantCalOverrides(clientSlug, tenantRaw) {
  const parsed = safeParseJson(tenantRaw)
  if (!parsed) return {}

  if (typeof parsed === 'object' && parsed !== null && ('calComUsername' in parsed || 'calComCanonicalEventSlugs' in parsed || 'calComEventSlugs' in parsed)) {
    return /** @type {TenantCalOverrides} */ (parsed)
  }

  if (typeof parsed === 'object' && parsed !== null) {
    const bySlug = /** @type {Record<string, TenantCalOverrides>} */ (parsed)
    return bySlug[clientSlug] ?? {}
  }

  return {}
}

/**
 * @param {{
 *   clientSlug: string,
 *   baseIntegrations: {
 *     calComUsername: string,
 *     calComCanonicalEventSlugs: EventSlugTriple,
 *     calComEventSlugs?: EventSlugTriple
 *   },
 *   env: Record<string, string | undefined>
 * }} params
 */
export function resolveCalRuntimeIntegrations(params) {
  const { clientSlug, baseIntegrations, env } = params
  const tenant = readTenantCalOverrides(clientSlug, env.TENANT_CAL_CONFIG_JSON)

  const envCanonical = {
    initial: env.CAL_COM_CANONICAL_EVENT_SLUG_INITIAL,
    session: env.CAL_COM_CANONICAL_EVENT_SLUG_SESSION,
    couple: env.CAL_COM_CANONICAL_EVENT_SLUG_COUPLE,
  }
  const envEmbed = {
    initial: env.CAL_COM_EVENT_SLUG_INITIAL,
    session: env.CAL_COM_EVENT_SLUG_SESSION,
    couple: env.CAL_COM_EVENT_SLUG_COUPLE,
  }

  return {
    calComUsername: tenant.calComUsername ?? env.CAL_COM_USERNAME ?? baseIntegrations.calComUsername,
    calComCanonicalEventSlugs: mergeEventSlugs(baseIntegrations.calComCanonicalEventSlugs, tenant.calComCanonicalEventSlugs ?? envCanonical),
    calComEventSlugs: mergeEventSlugs(
      baseIntegrations.calComEventSlugs ?? baseIntegrations.calComCanonicalEventSlugs,
      tenant.calComEventSlugs ?? envEmbed
    ),
  }
}
