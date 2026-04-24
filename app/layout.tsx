import type { Metadata } from 'next'
import './globals.css'
import clientConfig from '@/config/client'
import { getMergedClientConfig } from '@/lib/integrations/getMergedClientConfig'
import { ClientConfigProvider } from '@/components/providers/client-config-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MobileBar } from '@/components/layout/mobile-bar'
import { CookieBanner } from '@/components/ui/cookie-banner'
import { SchemaLocalBusiness, SchemaPerson, SchemaWebSite } from '@/components/seo/schema'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'

const fontSerif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const fontSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: clientConfig.seo.metaTitle,
    template: `%s | ${clientConfig.shortName} | Psihoterapeut Sector 3 București`,
  },
  description: clientConfig.seo.metaDescription,
  keywords: clientConfig.seo.keywords,
  metadataBase: new URL(clientConfig.website),
  alternates: { canonical: '/' },

  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: clientConfig.website,
    siteName: `Cabinet Psihoterapie ${clientConfig.shortName}`,
    title: clientConfig.seo.metaTitle,
    description: clientConfig.seo.metaDescription,
  },

  twitter: {
    card: 'summary_large_image',
    title: clientConfig.seo.metaTitle,
    description: clientConfig.seo.metaDescription,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },

  // Geo meta tags — semnale locale puternice pentru Google
  other: {
    'geo.region': 'RO-B',
    'geo.placename': `${clientConfig.address.sector}, ${clientConfig.address.city}`,
    'geo.position': `${clientConfig.address.lat};${clientConfig.address.lng}`,
    'ICBM': `${clientConfig.address.lat}, ${clientConfig.address.lng}`,
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const mergedConfig = await getMergedClientConfig()
  return (
    <html lang="ro">
      <head>
        {/* Schema.org sitewide */}
        <SchemaLocalBusiness config={mergedConfig} />
        <SchemaPerson config={mergedConfig} />
        <SchemaWebSite config={mergedConfig} />
      </head>
      <body className={`${fontSerif.variable} ${fontSans.variable} font-sans bg-cream text-ink antialiased pb-24 md:pb-0`}>
        <ClientConfigProvider value={mergedConfig}>
          <Header config={mergedConfig} />
          <main>{children}</main>
          <Footer config={mergedConfig} />
          <MobileBar config={mergedConfig} />
          <CookieBanner config={mergedConfig} />
        </ClientConfigProvider>
      </body>
    </html>
  )
}
