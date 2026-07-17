/**
 * Sets a canonical URL for the current page based on the route path.
 * Uses runtimeConfig.public.siteUrl or falls back to http://localhost:3000.
 */
export function useCanonical() {
  const route = useRoute()
  const config = useRuntimeConfig()

  const siteUrl = config.public.siteUrl || 'http://localhost:3000'
  const canonicalUrl = `${siteUrl}${route.path}`

  useHead({
    link: [
      { rel: 'canonical', href: canonicalUrl },
    ],
  })

  return { canonicalUrl }
}
