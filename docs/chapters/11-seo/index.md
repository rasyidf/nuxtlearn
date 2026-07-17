---
render_with_liquid: false
title: "SEO & Head Management"
layout: chapter
nav_order: 12
parent: Home
starter: "11-seo"
official_docs:
  - https://nuxt.com/docs/4.x/getting-started/seo-meta
  - https://nuxt.com/docs/4.x/api/composables/use-head
---

# SEO & Head Management

## TL;DR

`useHead` gives full control over the document `<head>` — title, meta, links, scripts, htmlAttrs. `useSeoMeta` is a typed shortcut for SEO-specific meta tags (Open Graph, Twitter, description). Both are reactive, SSR-compatible, and automatically deduplicated. Title templates, canonical URLs, and JSON-LD structured data complete the SEO toolkit.

## Mental Model

Head management is a merge tree. Each layer can add or override:

```
nuxt.config.ts (app.head)    → global defaults
  └── app.vue (useHead)       → app-wide settings
       └── layout (useHead)   → layout-specific
            └── page (useHead/useSeoMeta)  → page-specific
                 └── component (useHead)   → component additions
```

**Deduplication rules:**
- `title` — last one wins (only one title)
- `meta` with same `name` or `property` — last one wins
- `link` with same `rel` + `href` — deduplicated
- `script` — accumulates (all scripts render) unless you add a `key`

This means a page can override the default title set in `app.vue` just by calling `useHead({ title: 'My Page' })`. No cleanup needed.

### useHead

Full control over `<head>`:

```vue
<script setup lang="ts">
useHead({
  // Document title
  title: 'My Page Title',

  // Title template (set once, applies to all pages)
  titleTemplate: '%s | My Site',

  // Meta tags
  meta: [
    { name: 'description', content: 'Page description for search engines' },
    { property: 'og:title', content: 'Open Graph Title' },
    { property: 'og:image', content: 'https://mysite.com/og-image.png' },
    { name: 'robots', content: 'index, follow' },
  ],

  // Link tags
  link: [
    { rel: 'canonical', href: 'https://mysite.com/my-page' },
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
  ],

  // Scripts
  script: [
    { src: 'https://analytics.example.com/script.js', async: true },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'My Page',
      }),
    },
  ],

  // HTML attributes
  htmlAttrs: { lang: 'en', dir: 'ltr' },

  // Body attributes
  bodyAttrs: { class: 'dark-mode' },
})
</script>
```

**Reactive values** — use computed or refs for dynamic titles:

```vue
<script setup lang="ts">
const { data: post } = await useFetch(`/api/posts/${route.params.slug}`)

useHead({
  title: computed(() => post.value?.title ?? 'Loading...'),
  meta: [
    {
      property: 'og:title',
      content: computed(() => post.value?.title ?? ''),
    },
  ],
})
</script>
```

### useSeoMeta

Typed shortcut that covers 90% of SEO meta needs with a flat object API:

```vue
<script setup lang="ts">
useSeoMeta({
  // Basic SEO
  title: 'My Amazing Post',
  description: 'A comprehensive guide to Nuxt 4 data fetching patterns',

  // Open Graph (Facebook, LinkedIn, etc.)
  ogTitle: 'My Amazing Post',
  ogDescription: 'A comprehensive guide to Nuxt 4 data fetching patterns',
  ogImage: 'https://mysite.com/images/post-cover.png',
  ogUrl: 'https://mysite.com/posts/my-amazing-post',
  ogType: 'article',
  ogSiteName: 'My Site',

  // Twitter Card
  twitterCard: 'summary_large_image',
  twitterTitle: 'My Amazing Post',
  twitterDescription: 'A comprehensive guide to Nuxt 4 data fetching patterns',
  twitterImage: 'https://mysite.com/images/post-cover.png',
  twitterSite: '@mysite',

  // Robots
  robots: 'index, follow',
})
</script>
```

**Why `useSeoMeta` over `useHead` for meta tags?**
- Fully typed — autocomplete for all standard meta properties
- No `meta: [{ property: ..., content: ... }]` boilerplate
- Less error-prone (no typos in property names)
- XSS-safe — values are automatically escaped

**Limitation:** `useSeoMeta` only handles `<meta>` tags. For `<link>` (canonical), `<script>` (JSON-LD), or `htmlAttrs`, still use `useHead`.

### Title Templates

Set once, applies to every page:

```vue
<!-- app.vue -->
<script setup lang="ts">
useHead({
  titleTemplate: '%s | NuxtLearn',
  // or as a function for more control:
  titleTemplate: (title) => {
    return title ? `${title} | NuxtLearn` : 'NuxtLearn'
  },
})
</script>
```

Pages set their title, the template wraps it:

```vue
<!-- pages/about.vue — renders: "About Us | NuxtLearn" -->
<script setup lang="ts">
useHead({ title: 'About Us' })
</script>
```

To show ONLY the template (no page title): set `title` to empty string or use the function form to handle the null case.

Override the template for a specific page:

```vue
<!-- pages/index.vue — renders: "NuxtLearn - The Dense Syllabus" (no template) -->
<script setup lang="ts">
useHead({
  title: 'NuxtLearn - The Dense Syllabus',
  titleTemplate: '',  // Disable template for this page
})
</script>
```

### Canonical URLs

Every page should have a canonical URL to prevent duplicate content issues:

```vue
<!-- composables/useCanonical.ts -->
export function useCanonical() {
  const route = useRoute()
  const config = useRuntimeConfig()

  useHead({
    link: [
      {
        rel: 'canonical',
        href: computed(() => `${config.public.siteUrl}${route.path}`),
      },
    ],
  })
}
```

```vue
<!-- pages/[...slug].vue -->
<script setup lang="ts">
useCanonical() // Sets canonical based on current path
</script>
```

**Handling trailing slashes:** Be consistent. If your site uses `/about/` (with trailing slash), the canonical must match. Nuxt doesn't normalize by default — configure this in your router options or use a middleware to enforce consistency.

### Open Graph Images

For static OG images, just point to the URL:

```vue
<script setup lang="ts">
useSeoMeta({
  ogImage: 'https://mysite.com/images/default-og.png',
})
</script>
```

For dynamic OG images (generated per page), use the `nuxt-og-image` module:

```bash
npx nuxi module add nuxt-og-image
```

```vue
<!-- pages/posts/[slug].vue -->
<script setup lang="ts">
const { data: post } = await useFetch(`/api/posts/${route.params.slug}`)

defineOgImage({
  component: 'BlogPost',  // ~/components/OgImage/BlogPost.vue
  title: post.value?.title,
  description: post.value?.excerpt,
})
</script>
```

Create the OG image template component:

```vue
<!-- components/OgImage/BlogPost.vue -->
<template>
  <div class="og-image">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    <span>mysite.com</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; description: string }>()
</script>
```

The module renders this component to an image at `/api/__og_image__/...` and injects the correct `og:image` meta tag.

### Structured Data (JSON-LD)

Search engines use JSON-LD for rich snippets (recipes, articles, products, FAQs):

```vue
<script setup lang="ts">
const { data: post } = await useFetch(`/api/posts/${route.params.slug}`)

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.value?.title,
        description: post.value?.excerpt,
        image: post.value?.coverImage,
        datePublished: post.value?.publishedAt,
        dateModified: post.value?.updatedAt,
        author: {
          '@type': 'Person',
          name: post.value?.author.name,
        },
        publisher: {
          '@type': 'Organization',
          name: 'My Site',
          logo: { '@type': 'ImageObject', url: 'https://mysite.com/logo.png' },
        },
      })),
    },
  ],
})
</script>
```

**Product page example:**

```typescript
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.value.name,
      image: product.value.images,
      description: product.value.description,
      offers: {
        '@type': 'Offer',
        price: product.value.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    }),
  }],
})
```

Validate with [Google's Rich Results Test](https://search.google.com/test/rich-results).

### Sitemap

Install the sitemap module:

```bash
npx nuxi module add @nuxtjs/sitemap
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],
  site: {
    url: 'https://mysite.com',
  },
  sitemap: {
    // Dynamic routes from API
    sources: ['/api/__sitemap__/urls'],
  },
})
```

```typescript
// server/api/__sitemap__/urls.ts
export default defineSitemapEventHandler(async () => {
  const posts = await $fetch('/api/posts')
  return posts.map(post => ({
    loc: `/posts/${post.slug}`,
    lastmod: post.updatedAt,
    changefreq: 'weekly',
    priority: 0.8,
  }))
})
```

The module auto-generates `/sitemap.xml` at runtime. Prerendered routes are included automatically.

### robots.txt

```typescript
// nuxt.config.ts (with @nuxtjs/robots or manual)
export default defineNuxtConfig({
  routeRules: {
    '/admin/**': { robots: 'noindex, nofollow' },
    '/api/**': { robots: false },  // No robots meta
  },
})
```

Or create `public/robots.txt` manually:

```
User-agent: *
Disallow: /admin/
Disallow: /api/
Sitemap: https://mysite.com/sitemap.xml
```

## Walkthrough

1. **Set global title template in `app.vue`:**
   ```vue
   <script setup>
   useHead({ titleTemplate: '%s | My Site' })
   </script>
   ```

2. **Add per-page SEO:**
   ```vue
   <!-- pages/about.vue -->
   <script setup>
   useSeoMeta({
     title: 'About Us',
     description: 'Learn about our team and mission',
     ogTitle: 'About Us | My Site',
     ogImage: '/images/about-og.png',
   })
   </script>
   ```

3. **Add canonical URL composable.** Create `composables/useCanonical.ts` and call from pages.

4. **Add JSON-LD structured data** to a blog post page.

5. **Install and configure `@nuxtjs/sitemap`.** Visit `/sitemap.xml` to verify.

## Gotchas

- **`useHead` in a component runs on every render.** Use `computed()` for dynamic values — don't put API calls inside useHead options.
- **`useSeoMeta` doesn't support `<link>` tags.** Canonical URLs, favicons, and preload links need `useHead`.
- **OG images must be absolute URLs.** Social crawlers (Facebook, Twitter) cannot resolve relative paths. Always include the full `https://...` URL.
- **Title template applies AFTER the page title.** If a page sets `title: ''` (empty), only the template content shows. If no title is set, the template receives `null`.
- **`robots` meta vs `robots.txt` are different.** Meta controls per-page indexing. robots.txt controls crawl access. You often need both.
- **Duplicate meta tags from nested components.** If a child component sets `og:title` and the parent also does, both render. Use `key` on meta to force deduplication: `{ property: 'og:title', content: '...', key: 'og:title' }`.
- **SSR matters for SEO.** Meta tags set via `useSeoMeta`/`useHead` ARE in the initial HTML (SSR). But if you set them in a `ClientOnly` component or with `lazy` data, crawlers may not see them.
- **JSON-LD `innerHTML` with reactive data.** Wrap in `computed()` or the script tag won't update when data arrives. Without computed, it renders with `null` values on first pass.

## Exercise

Build a blog with complete SEO:

1. **Global setup** — title template `%s | My Blog`, default OG image, site description
2. **Blog list page** (`/posts`) — title "Blog", description, canonical
3. **Blog detail page** (`/posts/[slug]`) — dynamic title from post data, OG tags (title, description, image, type: article), Twitter card, JSON-LD Article schema, canonical URL
4. **Sitemap** — install `@nuxtjs/sitemap`, configure with dynamic routes from API
5. **Verify** — view page source for each page. Check that:
   - Title follows template
   - OG tags have absolute URLs
   - JSON-LD is valid (paste into Google's validator)
   - Sitemap XML lists all posts

## Further Reading

- [SEO & Meta Guide](https://nuxt.com/docs/4.x/getting-started/seo-meta)
- [useHead API](https://nuxt.com/docs/4.x/api/composables/use-head)
- [useSeoMeta API](https://nuxt.com/docs/4.x/api/composables/use-seo-meta)
- [Nuxt SEO Toolkit](https://nuxtseo.com)
- [Schema.org Validator](https://validator.schema.org)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
