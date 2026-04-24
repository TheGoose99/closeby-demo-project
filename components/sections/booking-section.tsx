'use client'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { ConfirmationResult } from 'firebase/auth'
import type { ClientConfig } from '@/types/client-config'
import { buildWhatsAppUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { buildBookingOptions } from '@/lib/booking-options'
import {
  LOCAL_BOOKING_LOCK_TTL_MS,
  readLockUntil,
  readOverrideAllowed,
  writeLockUntil,
  writeOverrideAllowed,
  isLocallyLocked,
} from '@/lib/antiAbuse/localBookingLock'
import { useMergedClientConfig } from '@/components/providers/client-config-provider'
import { getFirebaseWebAuth } from '@/lib/firebase/clientApp'
import { tryGetFirebaseAppCheckTokenForRequest } from '@/lib/firebase/appCheckClient'
import { confirmPhoneOtp, FIREBASE_PHONE_RECAPTCHA_BUTTON_ID, startPhoneOtp } from '@/lib/firebase/phoneAuthClient'

type EventSlugKey = 'initial' | 'session' | 'couple'

const CalEmbed = dynamic(async () => {
  const mod = await import('@calcom/embed-react')
  return mod.default
}, { ssr: false })

function safeReadLockUntil(): number | null {
  try {
    return readLockUntil(window.localStorage)
  } catch {
    return null
  }
}

function safeWriteLockUntil(untilMs: number) {
  try {
    writeLockUntil(window.localStorage, untilMs)
  } catch {
    // ignore
  }
}

function safeReadOverrideAllowed(): boolean {
  try {
    return readOverrideAllowed(window.localStorage)
  } catch {
    return false
  }
}

function safeWriteOverrideAllowed(allowed: boolean) {
  try {
    writeOverrideAllowed(window.localStorage, allowed)
  } catch {
    // ignore
  }
}

export function BookingSection({ config }: { config: ClientConfig }) {
  const merged = useMergedClientConfig()
  const effectiveConfig = merged ?? config
  const [selected, setSelected] = useState<EventSlugKey>('initial')
  const [calReady, setCalReady] = useState(false)
  const [calVisible, setCalVisible] = useState(false)
  const [lockUntilMs, setLockUntilMs] = useState<number | null>(null)
  const [overrideAllowed, setOverrideAllowed] = useState(false)
  const [suppressLockOverlay, setSuppressLockOverlay] = useState(false)
  const [phoneForGuard, setPhoneForGuard] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [phoneStep, setPhoneStep] = useState<'phone' | 'code'>('phone')
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)
  const [isCheckingGuard, setIsCheckingGuard] = useState(false)
  const [guardError, setGuardError] = useState<string | null>(null)
  const [backendAllowed, setBackendAllowed] = useState(false)
  const [backendLocked, setBackendLocked] = useState(false)
  const calContainerRef = useRef<HTMLDivElement | null>(null)
  const recaptchaVerifierRef = useRef<unknown>(null)

  function clearRecaptchaVerifier() {
    const v = recaptchaVerifierRef.current as { clear?: () => void } | null
    try {
      v?.clear?.()
    } catch {
      // ignore
    }
    recaptchaVerifierRef.current = null
  }

  const { calComUsername, calComCanonicalEventSlugs, calComEventSlugs, whatsappNumber, whatsappMessage } =
    effectiveConfig.integrations
  // Canonical slugs are stable across projects for automation; override slugs are only for embedding on legacy/demo Cal accounts.
  const embedSlugs = calComEventSlugs ?? calComCanonicalEventSlugs
  const calLink = `${calComUsername}/${embedSlugs[selected]}`
  const waUrl = buildWhatsAppUrl(whatsappNumber ?? '', whatsappMessage)
  const bookingOptions = buildBookingOptions(effectiveConfig)
  const selectedOption = bookingOptions.find((o) => o.key === selected)
  // UX nuance: after the *first* successful booking, we still store the 24h lock,
  // but we don't immediately replace the embed with the "already requested" overlay.
  // The overlay should show on a subsequent attempt (e.g., user returns/reloads).
  const locallyLocked = !suppressLockOverlay && isLocallyLocked(Date.now(), lockUntilMs, overrideAllowed)

  useEffect(() => {
    // When switching event types, Cal's embed iframe may not fully refresh from prop changes.
    // We force a remount via `key` and reset the loading state.
    setCalReady(false)
    setBackendAllowed(false)
    setBackendLocked(false)
    setPhoneStep('phone')
    setConfirmation(null)
    setOtpCode('')
    setGuardError(null)
    clearRecaptchaVerifier()
  }, [calLink])

  useEffect(() => {
    setLockUntilMs(safeReadLockUntil())
    setOverrideAllowed(safeReadOverrideAllowed())
  }, [])

  useEffect(() => {
    const el = calContainerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setCalVisible(true)
          observer.disconnect()
        }
      },
      { root: null, threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!calVisible) return
    if (locallyLocked) return
    if (!backendAllowed) return
    let cancelled = false
    ;(async () => {
      const mod = await import('@calcom/embed-react')
      const cal = await mod.getCalApi({ namespace: calLink })
      if (cancelled) return
      cal('ui', {
        theme: 'light',
        cssVarsPerTheme: {
          light: { 'cal-brand': '#4d7a5e' },
          dark:  { 'cal-brand': '#7a9e87' },
        },
        hideEventTypeDetails: false,
        layout: 'month_view',
      })

      // When user completes a booking flow in the embed, store a local lock (UX helper).
      // This prevents repeat attempts from the same device in the next 24h.
      // NOTE: Cal embed types don't expose a cancellable "before confirm" hook.
      cal('on', {
        action: 'bookingSuccessfulV2',
        callback: () => {
          const until = Date.now() + LOCAL_BOOKING_LOCK_TTL_MS
          safeWriteLockUntil(until)
          setLockUntilMs(until)
          safeWriteOverrideAllowed(false)
          setOverrideAllowed(false)
          setSuppressLockOverlay(true)
        },
      })

      setCalReady(true)
    })()
    return () => { cancelled = true }
  }, [calLink, calVisible, locallyLocked, backendAllowed])

  async function handleSendSms(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!phoneForGuard.trim()) {
      setGuardError('Te rugăm să introduci un număr de telefon valid.')
      return
    }

    setIsCheckingGuard(true)
    setGuardError(null)
    try {
      clearRecaptchaVerifier()
      const auth = getFirebaseWebAuth()
      const { confirmation, verifier } = await startPhoneOtp(
        auth,
        phoneForGuard.trim(),
        FIREBASE_PHONE_RECAPTCHA_BUTTON_ID,
      )
      recaptchaVerifierRef.current = verifier
      setConfirmation(confirmation)
      setPhoneStep('code')
    } catch (e) {
      clearRecaptchaVerifier()
      setGuardError(e instanceof Error ? e.message : 'Nu am putut trimite SMS-ul de verificare.')
    } finally {
      setIsCheckingGuard(false)
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!confirmation) {
      setGuardError('Te rugăm să trimiți mai întâi codul SMS.')
      return
    }
    if (!otpCode.trim()) {
      setGuardError('Introdu codul primit prin SMS.')
      return
    }

    setIsCheckingGuard(true)
    setGuardError(null)
    try {
      const cred = await confirmPhoneOtp(confirmation, otpCode.trim())
      const idToken = await cred.user.getIdToken(true)
      const appCheckToken = await tryGetFirebaseAppCheckTokenForRequest()

      const verifyResponse = await fetch('/api/booking/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(appCheckToken ? { 'x-firebase-appcheck': appCheckToken } : {}),
        },
        body: JSON.stringify({
          idToken,
          phone: phoneForGuard,
          clientSlug: effectiveConfig.slug,
        }),
      })

      const payload = await verifyResponse.json().catch(() => ({}))
      if (!verifyResponse.ok) {
        setGuardError(payload?.error ?? 'Verificarea a eșuat.')
        return
      }

      if (payload.allowed) {
        setBackendAllowed(true)
        setBackendLocked(false)
        return
      }
      if (payload.locked) {
        setBackendLocked(true)
        setBackendAllowed(false)
        return
      }

      setGuardError(payload?.error ?? 'Nu am putut continua după verificare.')
    } catch (e) {
      setGuardError(e instanceof Error ? e.message : 'Verificarea a eșuat.')
    } finally {
      setIsCheckingGuard(false)
    }
  }

  return (
    <section id="programare" className="py-24 px-6 lg:px-10 bg-ink">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: text + options */}
          <div>
            <span className="text-xs font-medium tracking-[0.1em] uppercase text-white/40 block mb-4">
              Programare
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium text-white mb-4 leading-tight">
              Primul pas este{' '}
              <em className="text-sage italic">cel mai important</em>
            </h2>
            <p className="text-white/55 text-base mb-10">
              Prima consultație este gratuită. Alege tipul ședinței și rezervă direct în calendar.
            </p>

            {/* Event type selector */}
            <div className="space-y-3 mb-10">
              {bookingOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSelected(opt.key)}
                  className={cn(
                    'w-full flex items-center gap-4 rounded-xl px-5 py-4 text-left transition-all duration-150 border',
                    selected === opt.key
                      ? 'bg-sage-d/20 border-sage-d text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                  )}
                >
                  <div className={cn(
                    'w-11 h-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0',
                    selected === opt.key ? 'bg-sage-d' : 'bg-white/10'
                  )}>
                    {opt.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{opt.label}</div>
                    <div className={cn('text-xs mt-0.5', selected === opt.key ? 'text-white/60' : 'text-white/35')}>
                      {opt.note}
                    </div>
                  </div>
                  {selected === opt.key && (
                    <span className="ml-auto text-sage text-lg">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Alternative contacts */}
            <div className="space-y-3">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Sau contactează direct</p>
              <a
                href={`tel:${effectiveConfig.phone}`}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-sage-d/60 flex items-center justify-content:center justify-center text-lg flex-shrink-0">📞</div>
                <div>
                  <div className="text-sm font-medium text-white">{effectiveConfig.phoneDisplay}</div>
                  <div className="text-xs text-white/40">{effectiveConfig.openingHoursDisplay}</div>
                </div>
              </a>
              {whatsappNumber && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-sage-d/60 flex items-center justify-center text-lg flex-shrink-0">💬</div>
                  <div>
                    <div className="text-sm font-medium text-white">WhatsApp</div>
                    <div className="text-xs text-white/40">Răspund în max. 2 ore în zilele lucrătoare</div>
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* Right: Cal.com embed */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
            <div className="px-6 pt-6 pb-4 border-b border-sage-l/30">
              <h3 className="font-serif text-xl font-medium text-ink">
                {selectedOption?.label}
              </h3>
              <p className="text-sm text-ink-l mt-1">
                {selectedOption?.note} · {effectiveConfig.address.sector} sau online
              </p>
              <p className="text-xs text-ink-xl mt-2">
                Durata exactă este setată în Cal.com.
              </p>
            </div>

            {/* Cal.com embed */}
            <div ref={calContainerRef} className="relative min-h-[500px]">
              {(!calVisible || !calReady) && (
                <div className="absolute inset-0 flex items-center justify-center bg-sage-xl">
                  <div className="text-center text-sage-d">
                    <div className="text-3xl mb-3 animate-pulse">📅</div>
                    <p className="text-sm font-medium">
                      {calVisible ? 'Se încarcă calendarul...' : 'Calendarul se va încărca când ajungi aici'}
                    </p>
                  </div>
                </div>
              )}
              {calVisible && !locallyLocked && !backendAllowed && !backendLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-sage-xl">
                  {phoneStep === 'phone' ? (
                    <form onSubmit={handleSendSms} className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                      <h4 className="font-serif text-xl text-ink">Verificare telefon (SMS)</h4>
                      <p className="mt-2 text-sm text-ink-l">
                        Confirmă numărul folosit la programare. După SMS, îți deschidem calendarul.
                      </p>
                      <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-ink-l">
                        Număr de telefon
                      </label>
                      <input
                        type="tel"
                        value={phoneForGuard}
                        onChange={(e) => setPhoneForGuard(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-sage-l px-3 py-2 text-sm text-ink outline-none focus:border-sage-d"
                        placeholder="+40 7xx xxx xxx"
                      />
                      {guardError && <p className="mt-2 text-xs text-red-700">{guardError}</p>}
                      <button
                        id={FIREBASE_PHONE_RECAPTCHA_BUTTON_ID}
                        type="submit"
                        disabled={isCheckingGuard}
                        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-sage-d px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                      >
                        {isCheckingGuard ? 'Trimitem SMS...' : 'Trimite cod SMS'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                      <h4 className="font-serif text-xl text-ink">Introdu codul SMS</h4>
                      <p className="mt-2 text-sm text-ink-l">Ți-am trimis un cod la {phoneForGuard}</p>
                      <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-ink-l">Cod</label>
                      <input
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-sage-l px-3 py-2 text-sm text-ink outline-none focus:border-sage-d"
                        placeholder="123456"
                      />
                      {guardError && <p className="mt-2 text-xs text-red-700">{guardError}</p>}
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneStep('phone')
                            setConfirmation(null)
                            setOtpCode('')
                            setGuardError(null)
                            clearRecaptchaVerifier()
                          }}
                          className="inline-flex flex-1 items-center justify-center rounded-lg border border-sage-l px-4 py-2 text-sm font-medium text-ink hover:bg-sage-xl transition-colors"
                        >
                          Schimbă numărul
                        </button>
                        <button
                          type="submit"
                          disabled={isCheckingGuard}
                          className="inline-flex flex-1 items-center justify-center rounded-lg bg-sage-d px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                        >
                          {isCheckingGuard ? 'Verificăm...' : 'Verifică și continuă'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
              {calVisible && !locallyLocked && backendAllowed && (
                <CalEmbed
                  key={calLink}
                  namespace={calLink}
                  calLink={calLink}
                  style={{ width: '100%', height: '100%', minHeight: '500px', overflow: 'scroll' }}
                  config={{
                    layout: 'month_view',
                    theme: 'light',
                  }}
                />
              )}
              {calVisible && !locallyLocked && backendLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-sage-xl">
                  <div className="text-center text-sage-d max-w-md px-6">
                    <div className="text-3xl mb-3">⏳</div>
                    <p className="text-sm font-medium">
                      Acest număr are deja o cerere activă în ultimele 24h
                    </p>
                    <p className="text-xs mt-2 text-sage-d/80">
                      Din motive de protecție anti-abuz, te rugăm să revii mai târziu sau să ne contactezi direct.
                    </p>
                  </div>
                </div>
              )}
              {calVisible && locallyLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-sage-xl">
                  <div className="text-center text-sage-d max-w-md px-6">
                    <div className="text-3xl mb-3">🔒</div>
                    <p className="text-sm font-medium">
                      Ai trimis deja o cerere de programare în ultimele 24h
                    </p>
                    <p className="text-xs mt-2 text-sage-d/80">
                      Dacă ai nevoie urgent, poți suna direct la {effectiveConfig.phoneDisplay} sau revino mai târziu.
                    </p>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          safeWriteOverrideAllowed(true)
                          setOverrideAllowed(true)
                        }}
                        className="inline-flex items-center justify-center rounded-lg bg-sage-d px-4 py-2 text-sm font-medium text-white hover:bg-sage-d/90 transition-colors"
                      >
                        Programează pentru altcineva
                      </button>
                      <p className="mt-2 text-[11px] leading-snug text-sage-d/70">
                        Dacă programezi pentru altă persoană, folosește numărul ei de telefon în formularul Cal.com.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-sage-l/40 border-t border-sage-l/30 flex items-center gap-2">
              <span className="text-xs text-sage-d">🔒</span>
              <span className="text-xs text-sage-d/80">
                Date stocate pe servere în {effectiveConfig.gdpr.serverLocation} · GDPR compliant ·{' '}
                {effectiveConfig.gdpr.dataProcessorName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
