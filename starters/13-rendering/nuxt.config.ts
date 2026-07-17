export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  typescript: { strict: true },
  routeRules: {
    '/': { prerender: true },
    '/about': { prerender: true },
    '/blog/**': { isr: 60 },
    '/app/**': { ssr: false },
    '/api/**': { cors: true, headers: { 'Cache-Control': 'max-age=60' } },
  },
})
