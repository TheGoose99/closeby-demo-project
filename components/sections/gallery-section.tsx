import Image from 'next/image'
import type { ClientConfig } from '@/types/client-config'

export function GallerySection({ config }: { config: Pick<ClientConfig, 'images' | 'shortName'> }) {
  const images = config.images.gallery ?? []
  if (images.length === 0) return null

  return (
    <section id="galerie" className="py-24 px-6 lg:px-10 bg-cream">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-10">
          <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d">Cabinet</span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink mt-3">
            Galerie foto
          </h2>
          <p className="text-ink-l mt-3 max-w-2xl">
            Un spațiu calm, sigur și discret.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {images.slice(0, 6).map((src, idx) => (
            <div key={`${src}-${idx}`} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-sage-xl">
              <Image
                src={src}
                alt={`Cabinet ${config.shortName} — foto ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 380px"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

