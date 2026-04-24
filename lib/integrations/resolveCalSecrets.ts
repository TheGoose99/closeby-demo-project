import { loadBaseClientConfig } from '@/config/load-base-client'
import { extractCalOrganizerUsernameFromWebhookBody } from './calWebhookTenant'
import { fetchClientCalSecretsForSlug, fetchClientSlugByCalComUsername, hasTenantSupabaseAdmin } from './supabaseTenant'
import { logIntegrationSource } from './integrationDebug'

export type CalSecretsTenantSource = 'cal_organizer_username' | 'env_or_static_slug'

export type ResolvedCalSecrets = {
  webhookSecret: string
  apiKey: string | undefined
  tenantSource: CalSecretsTenantSource
  /** `client_slug` used for `client_cal_secrets` join */
  resolvedClientSlug: string
}

/** Slug used when no Cal payload hint (decline API, etc.). */
export function getActiveIntegrationTenantSlug(): string {
  return (
    process.env.WEBHOOK_TENANT_CLIENT_SLUG?.trim() ||
    process.env.SUPABASE_TENANT_CLIENT_SLUG?.trim() ||
    loadBaseClientConfig().slug
  )
}

/**
 * Resolve webhook + API secrets. When `webhookJson` is the parsed Cal webhook body and Supabase is
 * configured, prefers `clients.client_slug` found via `payload.organizer.username` → `cal_com_username`.
 * Set `WEBHOOK_SKIP_CAL_USERNAME_LOOKUP=1` to disable (env/static slug only).
 */
export async function resolveActiveTenantCalSecrets(webhookJson?: unknown): Promise<ResolvedCalSecrets> {
  let slug = getActiveIntegrationTenantSlug()
  let tenantSource: CalSecretsTenantSource = 'env_or_static_slug'

  const skipCalUser =
    process.env.WEBHOOK_SKIP_CAL_USERNAME_LOOKUP === '1' || !hasTenantSupabaseAdmin() || webhookJson === undefined

  if (!skipCalUser) {
    const calUser = extractCalOrganizerUsernameFromWebhookBody(webhookJson)
    if (calUser) {
      const fromCal = await fetchClientSlugByCalComUsername(calUser)
      if (fromCal) {
        slug = fromCal
        tenantSource = 'cal_organizer_username'
        logIntegrationSource('webhook_tenant', { calUsername: calUser, resolvedClientSlug: slug })
      }
    }
  }

  const row = await fetchClientCalSecretsForSlug(slug)
  const webhookRaw = row?.cal_webhook_secret ?? process.env.CAL_WEBHOOK_SECRET ?? ''
  const webhookSecret = typeof webhookRaw === 'string' ? webhookRaw.trim() : ''
  const fromDbKey = row?.cal_api_key?.trim()
  const apiKey = fromDbKey || process.env.CAL_API_KEY?.trim() || undefined

  logIntegrationSource('cal_secrets_resolved', {
    tenantSource,
    resolvedClientSlug: slug,
    hasDbWebhookSecret: !!(row?.cal_webhook_secret && String(row.cal_webhook_secret).trim()),
    hasDbApiKey: !!(row?.cal_api_key && String(row.cal_api_key).trim()),
  })

  return { webhookSecret, apiKey, tenantSource, resolvedClientSlug: slug }
}

export async function resolveCalWebhookSecret(): Promise<string> {
  const { webhookSecret } = await resolveActiveTenantCalSecrets()
  return webhookSecret
}

export async function resolveCalApiKey(): Promise<string | undefined> {
  const { apiKey } = await resolveActiveTenantCalSecrets()
  return apiKey
}
