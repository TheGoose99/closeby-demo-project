import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Tenant integration data: `public.clients` + `public.client_cal_secrets` in the Supabase project
 * pointed at by env (typically the **seo-data-platform** DB).
 *
 * **Migrations / DDL** are owned by the `seo-data-platform` repo (`supabase/migrations/` there); run `supabase db push`
 * from that folder, not from this demo app.
 *
 * RLS applies to anon/authenticated; this app uses the **service role** only on the server for these reads.
 * Never expose `SUPABASE_SERVICE_ROLE_KEY` or query results to Client Components.
 */
let adminClient: SupabaseClient | null | undefined

export function hasTenantSupabaseAdmin(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())
}

function getServiceRoleClient(): SupabaseClient | null {
  if (adminClient !== undefined) return adminClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    adminClient = null
    return null
  }
  adminClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return adminClient
}

export type ClientIntegrationRow = {
  cal_com_username: string | null
  cal_com_canonical_event_slugs: unknown
  cal_com_event_slugs: unknown
}

export async function fetchClientIntegrationRow(clientSlug: string): Promise<ClientIntegrationRow | null> {
  const supabase = getServiceRoleClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('clients')
    .select('cal_com_username, cal_com_canonical_event_slugs, cal_com_event_slugs')
    .eq('client_slug', clientSlug)
    .maybeSingle()
  if (error) {
    console.warn('[integrations] clients lookup failed:', error.message)
    return null
  }
  return data as ClientIntegrationRow | null
}

export type ClientCalSecretsRow = {
  cal_api_key: string | null
  cal_webhook_secret: string | null
}

/** Map Cal.com username (from webhook `organizer.username`) to `clients.client_slug` for secret lookup. */
export async function fetchClientSlugByCalComUsername(calUsername: string): Promise<string | null> {
  const supabase = getServiceRoleClient()
  if (!supabase) return null
  const raw = calUsername.trim()
  if (!raw) return null
  const variants = raw.toLowerCase() === raw ? [raw] : [raw.toLowerCase(), raw]
  const tried = new Set<string>()
  for (const q of variants) {
    if (tried.has(q)) continue
    tried.add(q)
    const { data, error } = await supabase.from('clients').select('client_slug').eq('cal_com_username', q).limit(3)
    if (error) {
      console.warn('[integrations] cal_com_username lookup failed:', error.message)
      return null
    }
    const rows = (data ?? []) as { client_slug: string }[]
    if (rows.length > 1) {
      console.warn('[integrations] multiple clients share cal_com_username; using first match', { count: rows.length, q })
    }
    if (rows.length > 0) return rows[0]?.client_slug ?? null
  }
  return null
}

export async function fetchClientCalSecretsForSlug(clientSlug: string): Promise<ClientCalSecretsRow | null> {
  const supabase = getServiceRoleClient()
  if (!supabase) return null
  const { data: clientRow, error: clientErr } = await supabase.from('clients').select('id').eq('client_slug', clientSlug).maybeSingle()
  if (clientErr || !clientRow?.id) {
    if (clientErr) console.warn('[integrations] clients id lookup failed:', clientErr.message)
    return null
  }
  const { data, error } = await supabase
    .from('client_cal_secrets')
    .select('cal_api_key, cal_webhook_secret')
    .eq('client_id', clientRow.id)
    .maybeSingle()
  if (error) {
    console.warn('[integrations] client_cal_secrets lookup failed:', error.message)
    return null
  }
  return data as ClientCalSecretsRow | null
}
