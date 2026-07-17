export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  devtools: { enabled: true },

  typescript: {
    strict: true,
  },

  runtimeConfig: {
    apiSecret: '',
    public: {
      appVersion: '1.0.0',
      apiBase: '/api',
    },
  },
})
