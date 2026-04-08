import type { Metadata } from 'next'
import clientConfig from '@/config/client'
import { HeroSection } from '@/components/sections/hero-section'
import { ProofStrip } from '@/components/sections/proof-strip'
import { AboutSection } from '@/components/sections/about-section'
import { GallerySection } from '@/components/sections/gallery-section'
import { ServicesSection } from '@/components/sections/services-section'
import { ReviewsSection } from '@/components/sections/reviews-section'
import { BookingSection } from '@/components/sections/booking-section'
import { FAQSection } from '@/components/sections/faq-section'
import { LocationSection } from '@/components/sections/location-section'
import { SchemaFAQ } from '@/components/seo/schema'
import Link from 'next/link'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const serviceLinks = [
  {
    href: '/anxietate-depresie',
    title: 'Anxietate & Depresie',
    desc: 'CBT pentru anxietate, atacuri de panică și depresie. Rezultate în 8–16 ședințe.',
  },
  {
    href: '/terapie-cuplu',
    title: 'Terapie de Cuplu',
    desc: 'Comunicare, conflicte, intimitate. 390 RON / 75 min.',
  },
  {
    href: '/terapie-online',
    title: 'Terapie Online',
    desc: 'Ședințe prin Zoom sau Meet. 250 RON / 50 min. Date pe servere EU.',
  },
  {
    href: '/servicii',
    title: 'Toate serviciile',
    desc: 'Evaluare psihologică, pachet 8 ședințe, prețuri transparente.',
  },
]

export default function HomePage() {
  return (
    <>
      <SchemaFAQ config={clientConfig} />
      <HeroSection config={clientConfig} />
      <ProofStrip config={clientConfig} />
      <AboutSection config={clientConfig} />
      <GallerySection config={clientConfig} />

      {/* Internal linking hub — semnale puternice de relevanta topica */}
      <section className="py-16 px-6 lg:px-10 bg-sage-xl">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-serif text-3xl font-medium text-ink mb-2">
            Servicii de psihoterapie în{' '}
            <span className="text-sage-d">Sectorul 3, zona Pallady</span>
          </h2>
          <p className="text-ink-l mb-8">
            Cabinet pe Bd. Theodor Pallady 24 — lângă metrou M2 Anghel Saligny
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviceLinks.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow group"
              >
                <h3 className="font-medium text-ink mb-2 group-hover:text-sage-d transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-ink-l">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ServicesSection config={clientConfig} />
      <ReviewsSection config={clientConfig} />
      <BookingSection config={clientConfig} />
      <FAQSection config={clientConfig} />
      <LocationSection config={clientConfig} />
    </>
  )
}

