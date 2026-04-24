/** Structured one-line logs when `DEBUG_INTEGRATION_SOURCE=1` (Vercel / local). */
export function logIntegrationSource(event: string, data: Record<string, unknown>) {
  if (process.env.DEBUG_INTEGRATION_SOURCE !== '1') return
  try {
    console.log(JSON.stringify({ tag: 'integration-source', event, ...data, t: new Date().toISOString() }))
  } catch {
    // ignore
  }
}
