/**
 * Resolve which Cal.com account sent a webhook using Cal's payload (organizer username).
 * See https://cal.com/docs/developing/guides/automation/webhooks
 */

/** Cal.com sends `payload.organizer.username` on typical booking webhooks. */
export function extractCalOrganizerUsernameFromWebhookBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  const root = body as Record<string, unknown>
  const payload = root.payload
  if (!payload || typeof payload !== 'object') return null
  const organizer = (payload as Record<string, unknown>).organizer
  if (!organizer || typeof organizer !== 'object') return null
  const username = (organizer as Record<string, unknown>).username
  if (typeof username !== 'string') return null
  const t = username.trim().toLowerCase()
  return t.length > 0 ? t : null
}
