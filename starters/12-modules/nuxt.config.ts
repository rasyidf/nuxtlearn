export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  devtools: { enabled: true },

  typescript: {
    strict: true,
  },

  modules: ['~/modules/build-info'],
})
