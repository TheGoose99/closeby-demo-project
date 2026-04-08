import type { ClientConfig } from '@/types/client-config'
import { cn } from '@/lib/utils'

export function ReviewsSection({ config }: { config: ClientConfig }) {
  return (
    <section id="recenzii" className="py-24 px-6 lg:px-10 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-14">
          <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d">Recenzii Google</span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink mt-3 mb-4">
            {config.content.reviewsTitle}
          </h2>
          <a
            href={config.integrations.reviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border border-sage-l/40 rounded-full px-4 py-2 text-sm text-ink-m font-medium hover:border-sage-d transition-colors"
          >
            <span className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-yellow-400" />
            {config.aggregateRating.ratingValue} din 5 · {config.aggregateRating.reviewCount} recenzii Google
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {config.reviews.map((review) => (
            <div
              key={review.id}
              className={cn(
                'rounded-2xl p-7',
                review.highlight ? 'bg-sage-d text-white' : 'bg-cream'
              )}
            >
              <div className={cn('text-sm tracking-wider mb-4', review.highlight ? 'text-yellow-300' : 'text-clay')}>
                {'★'.repeat(review.rating)}
              </div>

              <blockquote
                className={cn(
                  'font-serif text-lg italic leading-relaxed mb-5',
                  review.highlight ? 'text-white/90' : 'text-ink-m'
                )}
              >
                „{review.text}”
              </blockquote>

              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
                    review.highlight ? 'bg-white/20 text-white' : 'bg-sage-xl text-sage-d'
                  )}
                >
                  {review.initials}
                </div>
                <div>
                  <div className={cn('text-sm font-medium', review.highlight ? 'text-white' : 'text-ink')}>
                    {review.author}
                  </div>
                  <div className={cn('text-xs', review.highlight ? 'text-white/50' : 'text-ink-xl')}>
                    {review.timeAgo}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
