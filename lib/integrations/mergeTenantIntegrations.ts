import type { ClientConfig } from '@/types/client-config'
import { fetchClientIntegrationRow } from './supabaseTenant'
import { mergeCalIntegrationsFromDbRow } from './mergeCalDbFields'
import { logIntegrationSource } from './integrationDebug'

export async function mergeTenantIntegrations(config: ClientConfig): Promise<ClientConfig> {
  const slug = process.env.SUPABASE_TENANT_CLIENT_SLUG?.trim() || config.slug
  const row = await fetchClientIntegrationRow(slug)
  if (!row) {
    logIntegrationSource('merged_client_config', { source: 'static_env_only', clientSlug: slug, dbHit: false })
    return config
  }
  logIntegrationSource('merged_client_config', { source: 'db_overlay', clientSlug: slug, dbHit: true })
  return {
    ...config,
    integrations: mergeCalIntegrationsFromDbRow(config.integrations, row),
  }
}
