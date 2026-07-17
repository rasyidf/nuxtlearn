export default defineNuxtRouteMiddleware((to, from) => {
  console.log(`[middleware:log] ${from.path} → ${to.path}`)
})
