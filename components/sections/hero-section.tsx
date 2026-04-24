import Image from 'next/image'
import type { ClientConfig } from '@/types/client-config'

const FALLBACK_BLUR_DATA_URL =
  'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA='

export function HeroSection({ config }: { config: ClientConfig }) {
  return (
    <section className="min-h-svh pt-16 pb-0 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-[1200px] mx-auto px-6 lg:px-10">
      {/* Text side */}
      <div className="pt-8 lg:pt-0 order-2 lg:order-1 text-center lg:text-left">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-sage-xl text-sage-d px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-d" />
          {config.content.heroAvailability}
        </div>

        {/* Heading */}
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] text-ink mb-5">
          {config.content.heroTitle}{' '}
          <em className="text-sage-d not-italic">{config.content.heroTitleAccent}</em>
        </h1>

        <p className="text-base lg:text-lg text-ink-l leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
          {config.content.heroSubtitle}
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 flex-wrap justify-center lg:justify-start mb-10">
          <a
            href="#programare"
            className="inline-flex items-center gap-2 bg-sage-d text-white px-7 py-4 rounded-full text-[0.9375rem] font-medium shadow-[0_4px_16px_rgba(77,122,94,0.3)] hover:bg-ink hover:-translate-y-0.5 transition-all duration-200"
          >
            {config.content.heroCta} →
          </a>
          <a
            href="#despre"
            className="inline-flex items-center gap-1.5 text-ink-m text-[0.9375rem] font-medium border-b border-ink-xl hover:text-sage-d hover:border-sage-d transition-colors pb-0.5"
          >
            {config.content.heroCtaSecondary}
          </a>
        </div>

        {/* Trust signals */}
        <div className="flex items-center gap-5 flex-wrap justify-center lg:justify-start">
          <div className="flex items-center gap-1.5 text-sm text-ink-l">
            <span className="text-clay">★★★★★</span>
            <strong className="text-ink font-medium">{config.aggregateRating.ratingValue}</strong>
            <span>/ 5.0</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-ink-xl" />
          <span className="text-sm text-ink-l">{config.aggregateRating.reviewCount} recenzii Google</span>
          <span className="w-1 h-1 rounded-full bg-ink-xl" />
          <span className="text-sm text-ink-l">{config.yearsExperience}+ ani experiență</span>
        </div>
      </div>

      {/* Visual side */}
      <div className="relative order-1 lg:order-2 flex justify-center">
        <div className="relative max-w-sm w-full">
          {/* Morphic blob image container */}
          <div
            className="relative overflow-hidden aspect-[3/4] bg-gradient-to-br from-sage-xl to-sage-l"
            style={{ borderRadius: '40% 60% 55% 45% / 45% 40% 60% 55%' }}
          >
            {config.images.therapist ? (
              <Image
                src={config.images.therapist}
                alt={`Dr. ${config.shortName} — psihoterapeut ${config.address.sector} ${config.address.city}`}
                fill
                priority
                quality={80}
                sizes="(max-width: 768px) 80vw, (max-width: 1024px) 50vw, 384px"
                placeholder="blur"
                blurDataURL={FALLBACK_BLUR_DATA_URL}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-sage-d">
                <svg width="72" height="72" viewBox="0 0 64 64" fill="none" className="opacity-30">
                  <circle cx="32" cy="24" r="12" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 56c0-11 9-20 20-20s20 9 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="font-serif italic text-lg opacity-50">Dr. {config.shortName}</span>
              </div>
            )}
          </div>

          {/* Rating badge */}
          <div className="absolute -bottom-4 -left-4 lg:bottom-8 lg:-left-8 bg-white rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 min-w-[180px]">
            <div>
              <div className="text-clay text-sm tracking-wider">★★★★★</div>
              <div className="text-xs">
                <strong className="text-ink font-medium text-sm block">{config.aggregateRating.reviewCount} recenzii Google</strong>
                <span className="text-ink-xl">Acreditat CPR · {config.yearsExperience} ani exp.</span>
              </div>
            </div>
          </div>

          {/* Free session badge */}
          <div className="absolute -top-4 -right-4 lg:top-8 lg:-right-8 bg-clay-l border border-clay/20 text-clay text-sm font-medium px-4 py-2 rounded-xl whitespace-nowrap">
            ✓ Prima ședință gratuită
          </div>
        </div>
      </div>
    </section>
  )
}
