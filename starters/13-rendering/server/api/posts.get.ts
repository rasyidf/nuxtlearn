export default defineEventHandler(() => {
  const renderedAt = new Date().toISOString()

  return {
    renderedAt,
    posts: [
      {
        id: 1,
        title: 'Understanding ISR in Nuxt',
        excerpt: 'Incremental Static Regeneration lets you get the best of both worlds.',
        date: '2026-07-10',
      },
      {
        id: 2,
        title: 'Route Rules Deep Dive',
        excerpt: 'Configure rendering per-route with routeRules in nuxt.config.ts.',
        date: '2026-07-12',
      },
      {
        id: 3,
        title: 'Hybrid Rendering Patterns',
        excerpt: 'Mix prerender, ISR, SSR, and SPA in a single Nuxt application.',
        date: '2026-07-15',
      },
    ],
  }
})
