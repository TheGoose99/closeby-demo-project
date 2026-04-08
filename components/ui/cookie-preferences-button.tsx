'use client'

import { notifyCookieConsentReset } from '@/lib/cookie-consent'

export function CookiePreferencesButton({
  className,
}: {
  className?: string
}) {
  return (
    <button type="button" onClick={() => notifyCookieConsentReset()} className={className}>
      Preferințe cookie
    </button>
  )
}

