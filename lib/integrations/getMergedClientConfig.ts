import { cache } from 'react'
import { loadBaseClientConfig } from '@/config/load-base-client'
import { applyPublicIntegrationEnvOverrides } from '@/config/apply-env-integrations'
import { mergeTenantIntegrations } from './mergeTenantIntegrations'

/** Per-request memoized config: apply env then overlay tenant DB (precedence: DB → env → static for Cal fields). */
export const getMergedClientConfig = cache(async () => {
  const withEnv = applyPublicIntegrationEnvOverrides(loadBaseClientConfig())
  return mergeTenantIntegrations(withEnv)
})
