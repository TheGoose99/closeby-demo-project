import type { ClientConfig } from '@/types/client-config'

// ─── 1. LocalBusiness + MedicalBusiness — schema principal ───────────────────
export function SchemaLocalBusiness({ config }: { config: ClientConfig }) {
  const priceRange = config.services
    .filter((s) => s.price)
    .map((s) => `${s.price} ${s.currency}`)
    .join(' – ')

  const schema = {
    '@context': 'https://schema.org',
    '@type': ['MedicalBusiness', 'LocalBusiness'],
    '@id': `${config.website}/#business`,

    // Identitate
    name: `Cabinet Psihoterapie ${config.shortName}`,
    alternateName: [
      `Psiholog ${config.shortName}`,
      `Psihoterapeut ${config.shortName} Sector 3`,
      `Cabinet CBT Pallady București`,
    ],
    description: config.seo.metaDescription,
    url: config.website,

    // Specializare medicală (keep broad; Cal.com is source of booking data)
    medicalSpecialty: 'Psychiatry',

    // Contact
    telephone: config.phone,
    email: config.email,

    // Adresă completă
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.address.street,
      addressLocality: config.address.city,
      addressRegion: 'București',
      postalCode: config.address.postalCode,
      addressCountry: 'RO',
    },

    // Coordonate GPS
    geo: {
      '@type': 'GeoCoordinates',
      latitude: config.address.lat,
      longitude: config.address.lng,
    },

    // Zona de servire — Sector 3 + zone adiacente
    areaServed: [
      {
        '@type': 'AdministrativeArea',
        name: 'Sector 3, București',
      },
      {
        '@type': 'City',
        name: 'București',
      },
      {
        '@type': 'Place',
        name: 'Pallady, București',
      },
      {
        '@type': 'Place',
        name: 'Titan, București',
      },
      {
        '@type': 'Place',
        name: 'Republica, București',
      },
      {
        '@type': 'Place',
        name: 'Dristor, București',
      },
      {
        '@type': 'Place',
        name: 'Vitan, București',
      },
    ],

    // Program
    openingHoursSpecification: config.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek,
      opens: h.opens,
      closes: h.closes,
    })),

    // Prețuri
    priceRange,
    currenciesAccepted: 'RON',
    paymentAccepted: 'Cash, Transfer bancar',

    // Limbi
    availableLanguage: [
      { '@type': 'Language', name: 'Română' },
    ],

    // Rating
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: config.aggregateRating.ratingValue,
      reviewCount: config.aggregateRating.reviewCount,
      bestRating: '5',
      worstRating: '1',
    },

    // Recenzii individuale
    review: config.reviews.map((r) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: '5',
      },
      author: {
        '@type': 'Person',
        name: r.author,
      },
      reviewBody: r.text,
    })),

    // Catalog servicii
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicii psihoterapie',
      itemListElement: config.services.map((s, i) => ({
        '@type': 'Offer',
        position: i + 1,
        name: s.title,
        description: s.description,
        ...(typeof s.price === 'number'
          ? { price: s.price, priceCurrency: s.currency }
          : {}),
        availability: 'https://schema.org/InStock',
        itemOffered: {
          '@type': 'MedicalTherapy',
          name: s.title,
          description: s.description,
          relevantSpecialty: 'Psychiatry',
        },
      })),
    },

    // Acreditări
    memberOf: [
      {
        '@type': 'Organization',
        name: 'Colegiul Psihologilor din România',
        url: 'https://www.copsi.ro',
      },
    ],

    // Fundat în
    foundingDate: '2016',

    // Same-as pentru profil extern (GBP va fi adăugat când e known)
    sameAs: [
      config.website,
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  )
}

// ─── 2. Person schema — terapeutul ca individ ────────────────────────────────
export function SchemaPerson({ config }: { config: ClientConfig }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${config.website}/#therapist`,
    name: config.name,
    jobTitle: 'Psihoterapeut',
    description: config.bio,
    url: `${config.website}/despre`,
    telephone: config.phone,
    email: config.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: config.address.city,
      addressRegion: config.address.sector,
      postalCode: config.address.postalCode,
      addressCountry: 'RO',
    },
    knowsAbout: [
      'Terapie cognitiv-comportamentală',
      'Anxietate',
      'Depresie',
      'Burnout',
      'Atacuri de panică',
      'Terapie de cuplu',
      'Mindfulness',
      'Psihoterapie individuală',
    ],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Acreditare profesională',
        recognizedBy: {
          '@type': 'Organization',
          name: 'Colegiul Psihologilor din România',
        },
      },
    ],
    worksFor: {
      '@id': `${config.website}/#business`,
    },
    image: config.images.therapist
      ? `${config.website}${config.images.therapist}`
      : undefined,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  )
}

// ─── 3. FAQPage schema ────────────────────────────────────────────────────────
export function SchemaFAQ({ config }: { config: ClientConfig }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  )
}

// ─── 4. BreadcrumbList schema ─────────────────────────────────────────────────
export function SchemaBreadcrumb({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  )
}

// ─── 5. WebSite schema cu SearchAction ────────────────────────────────────────
export function SchemaWebSite({ config }: { config: ClientConfig }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${config.website}/#website`,
    name: `Cabinet Psihoterapie ${config.shortName}`,
    url: config.website,
    inLanguage: 'ro-RO',
    description: config.seo.metaDescription,
    publisher: {
      '@id': `${config.website}/#business`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  )
}

// ─── 6. MedicalWebPage — pentru paginile de servicii ─────────────────────────
export function SchemaMedicalWebPage({
  config,
  pageUrl,
  pageName,
  pageDescription,
}: {
  config: ClientConfig
  pageUrl: string
  pageName: string
  pageDescription: string
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: pageName,
    description: pageDescription,
    url: pageUrl,
    inLanguage: 'ro-RO',
    isPartOf: {
      '@id': `${config.website}/#website`,
    },
    about: {
      '@id': `${config.website}/#business`,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.speakable'],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  )
}
