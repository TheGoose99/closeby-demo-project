import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Prevent Next from choosing a wrong workspace root when multiple lockfiles exist.
  outputFileTracingRoot: __dirname,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  trailingSlash: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'maps.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    // Prefer stronger caching for remote optimized images (helps LCP when hero is remote).
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  compress: true,
}

export default nextConfig