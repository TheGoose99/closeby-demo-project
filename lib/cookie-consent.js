const KEY = 'cookie_consent'

/**
 * @returns {'accepted'|'declined'|null}
 */
export function getCookieConsent(storage = globalThis?.localStorage) {
  try {
    const value = storage?.getItem?.(KEY)
    return value === 'accepted' || value === 'declined' ? value : null
  } catch {
    return null
  }
}

/**
 * @param {'accepted'|'declined'} value
 */
export function setCookieConsent(value, storage = globalThis?.localStorage) {
  try {
    storage?.setItem?.(KEY, value)
    return true
  } catch {
    return false
  }
}

export function clearCookieConsent(storage = globalThis?.localStorage) {
  try {
    storage?.removeItem?.(KEY)
    return true
  } catch {
    return false
  }
}

export function notifyCookieConsentChanged(value) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('cookie-consent', { detail: { value } }))
}

export function notifyCookieConsentReset() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('cookie-consent-reset'))
}

