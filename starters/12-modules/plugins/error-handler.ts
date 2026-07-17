export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vue:error', (error) => {
    console.error('[error-handler]', error)
  })
})
