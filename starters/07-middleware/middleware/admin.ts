export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuth()

  if (user.value?.role !== 'admin') {
    return abortNavigation(
      createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required' })
    )
  }
})
