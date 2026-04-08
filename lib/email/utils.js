/**
 * @param {string} iso
 * @returns {string}
 */
export function formatDateTimeRo(iso) {
  return new Date(iso).toLocaleString('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Bucharest',
  })
}

/**
 * @param {{ shortName: string; website: string }} config
 * @returns {string}
 */
export function getFromAddress(config) {
  const override = process.env.RESEND_FROM
  if (override && override.trim()) return override.trim()

  /** @type {string} */
  let host = config.website
  try {
    host = new URL(config.website).host
  } catch {
    host = config.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  }

  return `${config.shortName} <noreply@${host}>`
}

/**
 * @param {string} input
 * @returns {string}
 */
export function escapeHtml(input) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

