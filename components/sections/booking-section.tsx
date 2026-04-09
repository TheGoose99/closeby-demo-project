'use client'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { ClientConfig } from '@/types/client-config'
import { buildWhatsAppUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { buildBookingOptions } from '@/lib/booking-options'

type EventSlugKey = 'initial' | 'session' | 'couple'

const CalEmbed = dynamic(async () => {
  const mod = await import('@calcom/embed-react')
  return mod.default
}, { ssr: false })

const LOCAL_LOCK_KEY = 'closeby_booking_lock_until_v1'
const LOCAL_LOCK_TTL_MS = 24 * 60 * 60 * 1000

function getLocalLockUntil(): number | null {
  try {
    const raw = window.localStorage.getItem(LOCAL_LOCK_KEY)
    if (!raw) return null
    const n = Number(raw)
    if (!Number.isFinite(n)) return null
    return n
  } catch {
    return null
  }
}

function setLocalLockUntil(untilMs: number) {
  try {
    window.localStorage.setItem(LOCAL_LOCK_KEY, String(untilMs))
  } catch {
    // ignore
  }
}

export function BookingSection({ config }: { config: ClientConfig }) {
  const [selected, setSelected] = useState<EventSlugKey>('initial')
  const [calReady, setCalReady] = useState(false)
  const [calVisible, setCalVisible] = useState(false)
  const [lockUntilMs, setLockUntilMs] = useState<number | null>(null)
  const calContainerRef = useRef<HTMLDivElement | null>(null)

  const { calComUsername, calComCanonicalEventSlugs, calComEventSlugs, whatsappNumber, whatsappMessage } = config.integrations
  // Canonical slugs are stable across projects for automation; override slugs are only for embedding on legacy/demo Cal accounts.
  const embedSlugs = calComEventSlugs ?? calComCanonicalEventSlugs
  const calLink = `${calComUsername}/${embedSlugs[selected]}`
  const waUrl = buildWhatsAppUrl(whatsappNumber ?? '', whatsappMessage)
  const bookingOptions = buildBookingOptions(config)
  const selectedOption = bookingOptions.find((o) => o.key === selected)
  const locallyLocked = lockUntilMs !== null && Date.now() < lockUntilMs

  useEffect(() => {
    // When switching event types, Cal's embed iframe may not fully refresh from prop changes.
    // We force a remount via `key` and reset the loading state.
    setCalReady(false)
  }, [calLink])

  useEffect(() => {
    setLockUntilMs(getLocalLockUntil())
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
          const until = Date.now() + LOCAL_LOCK_TTL_MS
          setLocalLockUntil(until)
          setLockUntilMs(until)
        },
      })

      setCalReady(true)
    })()
    return () => { cancelled = true }
  }, [calLink, calVisible, locallyLocked])

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
                href={`tel:${config.phone}`}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-sage-d/60 flex items-center justify-content:center justify-center text-lg flex-shrink-0">📞</div>
                <div>
                  <div className="text-sm font-medium text-white">{config.phoneDisplay}</div>
                  <div className="text-xs text-white/40">{config.openingHoursDisplay}</div>
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
                {selectedOption?.note} · {config.address.sector} sau online
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
              {calVisible && !locallyLocked && (
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
              {calVisible && locallyLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-sage-xl">
                  <div className="text-center text-sage-d max-w-md px-6">
                    <div className="text-3xl mb-3">🔒</div>
                    <p className="text-sm font-medium">
                      Ai trimis deja o cerere de programare în ultimele 24h
                    </p>
                    <p className="text-xs mt-2 text-sage-d/80">
                      Dacă ai nevoie urgent, poți suna direct la {config.phoneDisplay} sau revino mai târziu.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-sage-l/40 border-t border-sage-l/30 flex items-center gap-2">
              <span className="text-xs text-sage-d">🔒</span>
              <span className="text-xs text-sage-d/80">
                Date stocate pe servere în {config.gdpr.serverLocation} · GDPR compliant ·{' '}
                {config.gdpr.dataProcessorName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
