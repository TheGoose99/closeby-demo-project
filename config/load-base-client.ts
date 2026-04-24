import { demoConfig } from './clients/demo'
import type { ClientConfig } from '@/types/client-config'

const CLIENT_SLUG = process.env.CLIENT_SLUG ?? 'demo'

const configs: Record<string, ClientConfig> = {
  demo: demoConfig,
}

/** Static client record selected by `CLIENT_SLUG` (no env/DB overlay). */
export function loadBaseClientConfig(): ClientConfig {
  return configs[CLIENT_SLUG] ?? demoConfig
}
