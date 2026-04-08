import Image from 'next/image'
import type { ClientConfig } from '@/types/client-config'

export function AboutSection({ config }: { config: ClientConfig }) {
  return (
    <section id="despre" className="py-24 px-6 lg:px-10 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image + credentials column */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-gradient-to-br from-sage-xl to-sage-l flex items-center justify-center">
              {config.images.therapist ? (
                <Image
                  src={config.images.therapist}
                  alt={`${config.shortName} — ${config.credentials}`}
                  width={600}
                  height={750}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-sage-d opacity-40">
                  <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="24" r="12" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 56c0-11 9-20 20-20s20 9 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="font-serif italic">Fotografie cabinet</span>
                </div>
              )}
            </div>

            {/* Credentials list */}
            <div className="mt-6 space-y-3">
              {[
                'Psiholog clinician specialist · CPR',
                `Psihoterapeut acreditat ${config.approach}`,
                'Universitatea București · Psihologie',
                'Supervizare continuă · 2024',
              ].map((cred) => (
                <div key={cred} className="flex items-center gap-3 text-sm text-ink-m">
                  <span className="w-2 h-2 rounded-full bg-sage-d flex-shrink-0" />
                  {cred}
                </div>
              ))}
            </div>
          </div>

          {/* Text column */}
          <div>
            <span className="text-xs font-medium tracking-[0.1em] uppercase text-sage-d block mb-4">
              Despre mine
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium text-ink mb-6 leading-tight">
              Psihoterapeut cu{' '}
              <span className="text-sage-d italic">{config.yearsExperience} ani</span>
              <br />
              lângă tine
            </h2>

            {/* Pull quote */}
            <div className="border-l-[3px] border-sage-d pl-5 mb-6">
              <p className="font-serif text-xl italic text-sage-d leading-relaxed">
                „Cred că fiecare persoană are în ea resursele necesare pentru schimbare.
                Rolul meu este să te ajut să le descoperi.”
              </p>
            </div>

            <p className="text-ink-l leading-relaxed mb-4 text-[0.9875rem]">{config.bio}</p>

            <p className="text-ink-l leading-relaxed text-[0.9875rem]">
              Cabinetul meu se află în {config.address.sector},{' '}
              la câteva minute de metrou {config.address.nearbyTransport[0]?.split('·')[1]?.trim() ?? 'Anghel Saligny'},
              și oferă și ședințe online pentru cei care preferă confortul casei.
            </p>

            {/* Approach chips */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.approaches.map((a) => (
                <div
                  key={a}
                  className="flex items-center gap-2 bg-sage-xl border border-sage-l rounded-lg px-4 py-2.5 text-sm text-sage-d font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-d flex-shrink-0" />
                  {a}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-sage-l/30">
              {[
                { value: `${config.yearsExperience}+`, label: 'ani experiență' },
                { value: `${config.patientsHelped}+`, label: 'pacienți ajutați' },
                { value: config.aggregateRating.ratingValue + '★', label: 'rating Google' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-serif text-3xl font-semibold text-sage-d">{s.value}</div>
                  <div className="text-xs text-ink-l mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
