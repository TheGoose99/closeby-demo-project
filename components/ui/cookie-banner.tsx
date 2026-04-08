'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { ClientConfig } from '@/types/client-config'
import { clearCookieConsent, getCookieConsent, setCookieConsent, notifyCookieConsentChanged } from '@/lib/cookie-consent'

export function CookieBanner({ config }: { config: Pick<ClientConfig, 'gdpr'> }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = getCookieConsent()
    if (!consent) {
      const t = setTimeout(() => setVisible(true), 2500)
      return () => clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    const onReset = () => {
      clearCookieConsent()
      setVisible(true)
    }
    window.addEventListener('cookie-consent-reset', onReset as EventListener)
    return () => window.removeEventListener('cookie-consent-reset', onReset as EventListener)
  }, [])

  const handleAccept = () => {
    setCookieConsent('accepted')
    notifyCookieConsentChanged('accepted')
    setVisible(false)
  }

  const handleDecline = () => {
    setCookieConsent('declined')
    notifyCookieConsentChanged('declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom)+5.5rem)] sm:bottom-4 left-4 right-4 z-50 max-w-2xl mx-auto bg-ink text-white/80 rounded-xl p-4 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-up">
      <p className="text-sm leading-relaxed flex-1">
        Folosim cookie-uri esențiale pentru funcționarea site-ului.{' '}
        <Link href={config.gdpr.privacyPolicyUrl} className="text-sage underline">
          Politică de confidențialitate
        </Link>
        {' '}· Date stocate în {config.gdpr.serverLocation}.
      </p>
      <div className="flex gap-3 flex-shrink-0">
        <button
          onClick={handleDecline}
          className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
        >
          Refuză
        </button>
        <button
          onClick={handleAccept}
          className="px-4 py-2 rounded-full text-sm font-medium bg-sage-d hover:bg-sage text-white transition-colors"
        >
          Acceptă
        </button>
      </div>
    </div>
  )
}
