import type { ClientConfig } from '@/types/client-config'
import type { ClientIntegrationRow } from './supabaseTenant'

type CalSlugMap = ClientConfig['integrations']['calComCanonicalEventSlugs']

function parseSlugMapFromJsonb(value: unknown): CalSlugMap | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const o = value as Record<string, unknown>
  if (typeof o.initial === 'string' && typeof o.session === 'string' && typeof o.couple === 'string') {
    return { initial: o.initial, session: o.session, couple: o.couple }
  }
  return null
}

/** DB overlay on existing `integrations` (caller applies env + static first). DB wins. */
export function mergeCalIntegrationsFromDbRow(
  integrations: ClientConfig['integrations'],
  row: ClientIntegrationRow | null,
): ClientConfig['integrations'] {
  if (!row) return integrations
  const next: ClientConfig['integrations'] = { ...integrations }
  if (row.cal_com_username && typeof row.cal_com_username === 'string' && row.cal_com_username.trim()) {
    next.calComUsername = row.cal_com_username.trim()
  }
  const canon = parseSlugMapFromJsonb(row.cal_com_canonical_event_slugs)
  if (canon) next.calComCanonicalEventSlugs = canon
  const override = parseSlugMapFromJsonb(row.cal_com_event_slugs)
  if (override) next.calComEventSlugs = override
  return next
}
