export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  devtools: { enabled: true },

  typescript: {
    strict: true,
  },

  experimental: {
    payloadExtraction: true,
  },
})
