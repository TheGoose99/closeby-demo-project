/**
 * Integration source-of-truth (multi-tenant production).
 *
 * Precedence for **public** Cal embed fields (`calComUsername`, event slug maps):
 * 1. Tenant DB (`public.clients` in the Supabase project where **seo-data-platform** migrations were applied) when configured and a row exists for the tenant slug.
 * 2. Environment (`NEXT_PUBLIC_CAL_COM_*`) — per Vercel deployment / local `.env.local`.
 * 3. Static fallback (`config/clients/[slug].ts`) — demo and offline defaults only.
 *
 * Precedence for **secrets** (webhook HMAC secret, Cal API key for decline):
 * 1. Tenant DB (`public.client_cal_secrets` joined to `clients`) when Supabase service role is configured.
 *    Webhook handler resolves `client_slug` via `payload.organizer.username` → `clients.cal_com_username` when possible (disable with `WEBHOOK_SKIP_CAL_USERNAME_LOOKUP=1`).
 * 2. Environment (`CAL_WEBHOOK_SECRET`, `CAL_API_KEY`) — single-tenant / legacy deployments.
 *
 * Never ship service-role keys or per-tenant secrets to the browser. Only `NEXT_PUBLIC_*` may be client-visible.
 */
export const INTEGRATION_PRECEDENCE_PUBLIC = ['database', 'environment', 'static'] as const
export const INTEGRATION_PRECEDENCE_SECRET = ['database', 'environment'] as const
