export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/beta')) {
    const { features } = useRuntimeConfig().public
    if (!features.betaPage) {
      return abortNavigation(createError({ statusCode: 404, statusMessage: 'Not Found' }))
    }
  }
})
