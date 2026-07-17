const posts = [
  {
    id: 1,
    slug: 'getting-started-with-nuxt',
    title: 'Getting Started with Nuxt',
    excerpt: 'Learn the fundamentals of building applications with Nuxt framework.',
    content: 'Nuxt is a powerful framework built on top of Vue.js that provides server-side rendering, static site generation, and more. In this guide, we will walk through the basics of setting up your first Nuxt application and understanding its core concepts.',
    author: 'Jane Doe',
    publishedAt: '2026-07-01T10:00:00Z',
    coverImage: 'https://picsum.photos/seed/nuxt1/1200/630',
  },
  {
    id: 2,
    slug: 'mastering-seo-in-nuxt',
    title: 'Mastering SEO in Nuxt',
    excerpt: 'A deep dive into SEO optimization techniques available in Nuxt.',
    content: 'Search Engine Optimization is critical for any web application. Nuxt provides built-in utilities like useHead and useSeoMeta that make managing meta tags straightforward. This article covers everything from basic title tags to structured data with JSON-LD.',
    author: 'John Smith',
    publishedAt: '2026-07-10T14:30:00Z',
    coverImage: 'https://picsum.photos/seed/nuxt2/1200/630',
  },
  {
    id: 3,
    slug: 'server-side-rendering-explained',
    title: 'Server-Side Rendering Explained',
    excerpt: 'Understanding how SSR works in Nuxt and when to use it.',
    content: 'Server-side rendering generates HTML on the server for each request, providing faster initial page loads and better SEO. Nuxt makes SSR the default rendering mode, handling hydration and state serialization automatically.',
    author: 'Jane Doe',
    publishedAt: '2026-07-15T09:00:00Z',
    coverImage: 'https://picsum.photos/seed/nuxt3/1200/630',
  },
]

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  const post = posts.find((p) => p.slug === slug)

  if (!post) {
    throw createError({
      statusCode: 404,
      statusMessage: `Post not found: ${slug}`,
    })
  }

  return post
})
