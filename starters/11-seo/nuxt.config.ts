export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  devtools: { enabled: true },

  typescript: {
    strict: true,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: 'http://localhost:3000',
    },
  },
})
