export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:finish', () => {
    console.log('[analytics] Page view:', useRoute().fullPath)
  })
})
