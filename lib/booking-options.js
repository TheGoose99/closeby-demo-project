// NOTE: This file is imported by both Next.js (TS/webpack) and node:test (plain Node ESM).
// To keep tests dependency-free, we re-implement small formatting helpers here.

function formatPrice(price, currency = 'RON') {
  if (!price) return 'Gratuit'
  return `${Number(price).toLocaleString('ro-RO')} ${currency}`
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

/**
 * Booking selector keys (UI) -> Cal event slugs (config).
 * @typedef {'initial'|'session'|'couple'} EventSlugKey
 */

const DEFAULT_ICONS = /** @type {Record<EventSlugKey, string>} */ ({
  initial: '🌱',
  session: '🧠',
  couple: '💑',
})

/**
 * @param {{ services: Array<{ title: string; duration: number; price?: number; currency: string; calEventSlug: string; icon: string }>; integrations: { calComCanonicalEventSlugs?: Partial<Record<EventSlugKey, string>>; calComEventSlugs?: Partial<Record<EventSlugKey, string>> } }} config
 * @param {EventSlugKey} key
 */
function findServiceByKey(config, key) {
  // Canonical slugs are the source of truth for service mapping.
  const slugs = config.integrations.calComCanonicalEventSlugs || config.integrations.calComEventSlugs
  const slug = slugs?.[key]
  if (!slug) return undefined
  return config.services.find((s) => s.calEventSlug === slug)
}

/**
 * Builds booking options from `config.services` so UI display matches config.
 * Cal.com remains source-of-truth for actual booked duration; this is display metadata.
 *
 * @param {{ services: Array<{ title: string; duration: number; price?: number; currency: string; calEventSlug: string; icon: string }>; integrations: { calComCanonicalEventSlugs?: Partial<Record<EventSlugKey, string>>; calComEventSlugs?: Partial<Record<EventSlugKey, string>> } }} config
 * @returns {Array<{ key: EventSlugKey; label: string; note: string; icon: string }>}
 */
export function buildBookingOptions(config) {
  /** @type {Array<{ key: EventSlugKey; label: string; note: string; icon: string }>} */
  const opts = []

  /** @type {EventSlugKey[]} */
  const keys = ['initial', 'session', 'couple']
  for (const key of keys) {
    const service = findServiceByKey(config, key)
    if (!service) {
      opts.push({
        key,
        label: key === 'initial' ? 'Consultație inițială (gratuită)' : key === 'session' ? 'Ședință individuală' : 'Terapie de cuplu',
        note: 'Durată/pret setate în config',
        icon: DEFAULT_ICONS[key],
      })
      continue
    }

    const duration = formatDuration(service.duration)
    const price = formatPrice(service.price, service.currency)

    const label =
      key === 'initial'
        ? `${service.title} (gratuită)`
        : service.title

    const icon = service.icon || DEFAULT_ICONS[key]

    opts.push({
      key,
      label,
      note: `${duration} · ${price}`,
      icon,
    })
  }

  return opts
}

