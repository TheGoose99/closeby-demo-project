export interface Service {
  id: string
  title: string
  description: string
  duration: number
  price?: number
  currency: 'RON' | 'EUR'
  calEventSlug: string
  featured?: boolean
  icon: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface OpeningHours {
  dayOfWeek: string[]
  opens: string
  closes: string
}

export interface Review {
  id: string
  author: string
  initials: string
  rating: number
  text: string
  timeAgo: string
  highlight?: boolean
}

export interface ClientConfig {
  id: string
  slug: string
  name: string
  shortName: string
  credentials: string
  bio: string
  bioShort: string
  approach: string
  approaches: string[]
  yearsExperience: number
  patientsHelped: number

  address: {
    street: string
    sector: string
    city: string
    postalCode: string
    lat: number
    lng: number
    mapsEmbedUrl: string
    mapsPlaceId?: string
    nearbyTransport: string[]
    parking: string
  }

  phone: string
  phoneDisplay: string
  email: string
  website: string
  openingHours: OpeningHours[]
  openingHoursDisplay: string

  integrations: {
    calComUsername: string
    /**
     * Canonical event slugs used across ALL client projects for automation.
     * Your Cal.com account should be provisioned to match these slugs.
     */
    calComCanonicalEventSlugs: {
      initial: string
      session?: string
      couple?: string
    }
    /**
     * Optional per-client override for legacy/demo Cal.com accounts where event slugs differ.
     * If provided, the embed will use these slugs, while UI/service mapping remains canonical.
     */
    calComEventSlugs?: {
      initial: string
      session?: string
      couple?: string
    }
    googlePlaceId?: string
    whatsappNumber?: string
    whatsappMessage: string
    reviewLink: string
    googleMapsApiKey?: string
  }

  content: {
    heroTitle: string
    heroTitleAccent: string
    heroSubtitle: string
    heroCta: string
    heroCtaSecondary: string
    heroAvailability: string
    aboutTitle: string
    servicesTitle: string
    servicesSubtitle: string
    faqTitle: string
    reviewsTitle: string
  }

  services: Service[]
  faqs: FAQ[]
  reviews: Review[]

  theme: {
    primaryColor: string
    primaryDark: string
    primaryLight: string
    primaryXLight: string
    accentColor: string
    accentLight: string
    inkColor: string
    inkMid: string
    inkLight: string
    creamColor: string
    headingFont: string
    bodyFont: string
  }

  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
    ogImage?: string
  }

  images: {
    hero?: string
    therapist?: string
    gallery: string[]
  }

  gdpr: {
    privacyPolicyUrl: string
    dataProcessorName: string
    serverLocation: string
  }

  aggregateRating: {
    ratingValue: string
    reviewCount: number
  }
}
