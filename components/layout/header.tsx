'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ClientConfig } from '@/types/client-config'

const NAV_LINKS = [
  { href: '#despre', label: 'Despre' },
  { href: '#servicii', label: 'Servicii' },
  { href: '#recenzii', label: 'Recenzii' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
]

export function Header({ config }: { config: Pick<ClientConfig, 'shortName' | 'phone' | 'phoneDisplay'> }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  const [first, ...rest] = config.shortName.split(' ')

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-shadow duration-300',
        'bg-cream/90 backdrop-blur-md border-b border-sage/10',
        scrolled && 'shadow-[0_2px_20px_rgba(26,32,24,0.08)]'
      )}
    >
      <nav className="max-w-[1200px] mx-auto flex items-center justify-between h-16 px-6 lg:px-10">
        {/* Logo */}
        <Link href="/" className="font-serif text-xl font-semibold text-ink tracking-tight truncate max-w-[60vw]">
          {first} <span className="text-sage-d">{rest.join(' ')}</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-ink-m hover:text-sage-d transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <a
          href="#programare"
          className="hidden md:inline-flex items-center gap-1.5 bg-sage-d text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-ink transition-all duration-200 hover:-translate-y-px"
        >
          Programează-te →
        </a>

        {/* Mobile: phone + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <a
            href={`tel:${config.phone}`}
            className="flex items-center gap-1.5 bg-sage-d text-white text-sm font-medium px-4 py-2 rounded-full"
          >
            📞 Sună
          </a>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-ink-m"
            aria-label="Meniu"
          >
            <div className="space-y-1.5">
              <span className={cn('block w-5 h-0.5 bg-current transition-transform', menuOpen && 'rotate-45 translate-y-2')} />
              <span className={cn('block w-5 h-0.5 bg-current transition-opacity', menuOpen && 'opacity-0')} />
              <span className={cn('block w-5 h-0.5 bg-current transition-transform', menuOpen && '-rotate-45 -translate-y-2')} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-cream border-t border-sage/10 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-base text-ink-m py-1"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#programare"
            onClick={() => setMenuOpen(false)}
            className="bg-sage-d text-white text-center py-3 rounded-full font-medium mt-2"
          >
            Programează-te →
          </a>
        </div>
      )}
    </header>
  )
}
