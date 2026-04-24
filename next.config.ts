import type { NextConfig } from 'next'

function buildCspReportOnly(): string {
  // Report-only CSP to catch obvious issues without breaking embeds (Cal.com, Google Maps).
  // Keep this permissive; tighten later once scripts/frames are fully inventoried.
  // Firebase Phone Auth RecaptchaVerifier loads https://www.google.com/recaptcha/api.js + gstatic recaptcha bundles.
  const recaptchaScript = 'https://www.google.com https://www.gstatic.com'
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${recaptchaScript}`,
    `script-src-elem 'self' 'unsafe-inline' ${recaptchaScript}`,
    "connect-src 'self' https:",
    "frame-src 'self' https://cal.com https://app.cal.com https://www.google.com https://www.gstatic.com https://recaptcha.google.com",
    'report-to csp-endpoint',
    "upgrade-insecure-requests",
  ].join('; ')
}

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
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          { key: 'X-Download-Options', value: 'noopen' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          // Prefer CSP as report-only to avoid breaking Cal.com / Maps embeds.
          { key: 'Content-Security-Policy-Report-Only', value: buildCspReportOnly() },
          // Same-origin endpoint name referenced by `report-to` above (avoids “no report-uri” console noise).
          { key: 'Reporting-Endpoints', value: 'csp-endpoint="/api/csp-violation-report"' },
        ],
      },
    ]
  },
  trailingSlash: false,
  images: {
    qualities: [75, 80, 85, 90, 95, 100],
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