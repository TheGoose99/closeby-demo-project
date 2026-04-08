import Link from 'next/link'
import type { ClientConfig } from '@/types/client-config'
import { buildWhatsAppUrl } from '@/lib/utils'
import { CookiePreferencesButton } from '@/components/ui/cookie-preferences-button'

const NAV_LINKS = [
  { href: '#despre', label: 'Despre mine' },
  { href: '#servicii', label: 'Servicii & Prețuri' },
  { href: '#recenzii', label: 'Recenzii' },
  { href: '#faq', label: 'Întrebări frecvente' },
  { href: '#contact', label: 'Locație & Contact' },
]

export function Footer({ config }: { config: ClientConfig }) {
  const [first, ...rest] = config.shortName.split(' ')
  const waUrl = buildWhatsAppUrl(config.integrations.whatsappNumber ?? '', config.integrations.whatsappMessage)

  return (
    <footer className="bg-ink text-white/55 pt-12 pb-8 px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-white/8 mb-6">
          {/* Brand */}
          <div>
            <span className="font-serif text-xl font-semibold text-white block mb-3">
              {first} <span className="text-sage">{rest.join(' ')}</span>
            </span>
            <p className="text-sm leading-relaxed max-w-xs">{config.bioShort}</p>
            <p className="text-xs mt-3 text-white/35">Acreditat Colegiul Psihologilor din România</p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-sm font-medium text-white mb-4">Navigare</h4>
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="block text-sm mb-2 hover:text-sage transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-medium text-white mb-4">Contact</h4>
            <a href={`tel:${config.phone}`} className="block text-sm mb-2 hover:text-sage transition-colors">
              📞 {config.phoneDisplay}
            </a>
            <a href={`mailto:${config.email}`} className="block text-sm mb-2 hover:text-sage transition-colors">
              ✉️ {config.email}
            </a>
            {config.integrations.whatsappNumber && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block text-sm mb-2 hover:text-sage transition-colors">
                💬 WhatsApp
              </a>
            )}
            <div className="mt-4 space-y-1">
              <Link href={config.gdpr.privacyPolicyUrl} className="block text-xs hover:text-sage transition-colors">
                Politică de confidențialitate
              </Link>
              <Link href="/termeni" className="block text-xs hover:text-sage transition-colors">
                Termeni și condiții
              </Link>
              <CookiePreferencesButton className="block text-left text-xs hover:text-sage transition-colors" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} Cabinet Psihoterapie {config.shortName}</p>
          <span className="inline-flex items-center gap-1.5 bg-sage/15 text-sage rounded-full px-3 py-1 text-[0.7rem] font-medium">
            🔒 Date pe servere {config.gdpr.serverLocation} · GDPR compliant
          </span>
        </div>
      </div>
    </footer>
  )
}
