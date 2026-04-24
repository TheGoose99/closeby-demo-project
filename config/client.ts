import { applyPublicIntegrationEnvOverrides } from './apply-env-integrations'
import { loadBaseClientConfig } from './load-base-client'

/**
 * Sync client config: static `config/clients/*` plus **public** Cal overrides from `NEXT_PUBLIC_CAL_COM_*`.
 * For metadata and code paths that cannot await DB. Booking UI uses `getMergedClientConfig()` (DB overlay).
 */
export const clientConfig = applyPublicIntegrationEnvOverrides(loadBaseClientConfig())

export default clientConfig
