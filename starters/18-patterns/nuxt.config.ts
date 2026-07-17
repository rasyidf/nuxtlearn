export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  typescript: { strict: true },
  runtimeConfig: {
    public: {
      features: {
        betaPage: false,
        darkMode: true,
      },
    },
  },
  nitro: {
    experimental: {
      websocket: true,
    },
  },
})
