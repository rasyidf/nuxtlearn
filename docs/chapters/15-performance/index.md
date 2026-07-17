---
title: "Performance"
layout: chapter
nav_order: 16
parent: Home
starter: "15-performance"
official_docs:
  - https://nuxt.com/docs/4.x/api/composables/use-nuxt-data
---

# Performance

## TL;DR

Performance in Nuxt means: smaller bundles (tree-shaking, code-splitting, lazy imports), faster rendering (payload optimization, lazy hydration), and optimized assets (responsive images, font loading). Run `nuxi analyze` to visualize what's in your bundle. Measure before optimizing — don't guess where the bottleneck is.

## Mental Model

Four performance bottlenecks in SSR apps:

```
1. Time to First Byte (TTFB)     → Server render speed
2. Bundle Size                    → Download + parse time
3. Hydration Cost                 → Time to Interactive (TTI)
4. Asset Loading                  → Images, fonts, third-party scripts
```

Each has specific Nuxt-level solutions. The order matters — optimizing images is pointless if your bundle is 2MB. Start from the top.

### Bundle Analysis

```bash
npx nuxi analyze
```

This generates an interactive treemap showing exactly what's in your client bundle. You'll see:
- Which dependencies are largest
- Which ones were unexpectedly included
- Server vs client chunk breakdown
- Code-split boundaries

**Common findings:**
- A full `lodash` import (400KB) when you only use `debounce` — fix: `import debounce from 'lodash-es/debounce'`
- A date library (moment.js: 300KB) — fix: switch to `date-fns` (tree-shakeable) or native `Intl`
- An entire icon library — fix: use individual SVG imports or a tree-shakeable icon package
- Server-only code leaking into client bundle — fix: use `server/utils/` not `utils/` for server logic

### Payload Optimization

The SSR payload (`window.__NUXT__`) is HTML-embedded JSON containing all `useFetch`/`useState` data. Large payloads = slower page loads.

**Strategies:**

```vue
<script setup lang="ts">
// ✗ Bad: fetches entire API response into payload
const { data } = await useFetch('/api/users')
// payload: [{ id, name, email, address, phone, company, website, ... }, ...]

// ✓ Good: pick only needed fields
const { data } = await useFetch('/api/users', {
  pick: ['id', 'name', 'email'],
})
// payload: [{ id, name, email }, ...]

// ✓ Good: transform to minimal shape
const { data } = await useFetch('/api/users', {
  transform: (users) => users.map(u => ({
    id: u.id,
    displayName: `${u.firstName} ${u.lastName}`,
  })),
})
</script>
```

**Pagination** — fetch 20 items instead of 1000:

```vue
<script setup>
const page = ref(1)
const { data } = await useFetch('/api/products', {
  query: { page, limit: 20 },
})
</script>
```

**Payload extraction** — Nuxt can extract payload into separate `.json` files instead of embedding in HTML:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: {
    payloadExtraction: true,
  },
})
```

This reduces HTML size and allows browsers to cache payloads separately. Useful for pages with large data sets.

### Lazy Hydration

Default behavior: Nuxt hydrates the entire page at once (all components become interactive simultaneously). Lazy hydration defers hydration of non-critical components until they're actually needed.

**Available strategies with `nuxt-lazy-hydrate` or built-in `LazyHydration`:**

```vue
<template>
  <!-- Hydrate when component enters viewport -->
  <LazyHydrationOnVisible>
    <HeavyFooter />
  </LazyHydrationOnVisible>

  <!-- Hydrate when browser is idle (requestIdleCallback) -->
  <LazyHydrationOnIdle>
    <CommentSection />
  </LazyHydrationOnIdle>

  <!-- Hydrate on user interaction (hover, focus, click) -->
  <LazyHydrationOnInteraction :triggers="['mouseover', 'focus']">
    <SearchWidget />
  </LazyHydrationOnInteraction>

  <!-- Never hydrate (static content, no interactivity needed) -->
  <LazyHydrationNever>
    <StaticMarkdownContent :html="article.body" />
  </LazyHydrationNever>
</template>
```

With Nuxt 4's built-in lazy hydration (experimental):

```vue
<template>
  <HeavyComponent hydrate:visible />
  <SearchWidget hydrate:idle />
  <Footer hydrate:never />
</template>
```

**Impact:** Reducing hydration work means faster Time to Interactive. A page with 50 components but only 5 above the fold — hydrate those 5 immediately, defer the rest. Users perceive the page as interactive faster.

**Trade-off:** Components that aren't hydrated don't respond to events. A button with `hydrate:visible` won't fire its `@click` handler until it's hydrated. For interactive elements above the fold, don't use lazy hydration.

### @nuxt/image

Responsive, optimized images without manual srcset management:

```bash
npx nuxi module add image
```

```vue
<template>
  <!-- Responsive: generates srcset for multiple sizes -->
  <NuxtImg
    src="/photos/hero.jpg"
    sizes="sm:100vw md:50vw lg:400px"
    format="webp"
    quality="80"
    loading="lazy"
    placeholder
  />

  <!-- Picture with art direction -->
  <NuxtPicture
    src="/photos/product.jpg"
    sizes="xs:100vw sm:50vw md:400px"
    :imgAttrs="{ class: 'rounded-lg' }"
  />
</template>
```

**What `@nuxt/image` does:**
- Generates responsive `srcset` automatically (multiple sizes)
- Converts to modern formats (WebP, AVIF) on-the-fly
- Lazy loads images below the fold
- Provides blur placeholder while loading
- Integrates with CDN providers (Cloudinary, imgix, Vercel Image)

**Self-hosted optimization (IPX):**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  image: {
    provider: 'ipx',  // Self-hosted (default)
    quality: 80,
    format: ['webp', 'avif'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
})
```

IPX processes images on-demand at runtime (requires server). For static export, use a build-time provider or external CDN.

### Font Optimization

Fonts are a common source of layout shift and slow rendering:

```bash
npx nuxi module add fonts
```

`@nuxt/fonts` automatically handles:
- Font file downloading and self-hosting
- Preload hints for critical fonts
- `font-display: swap` (prevent invisible text)
- Subsetting (only include characters you use)
- Variable font optimization

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400] },
    ],
  },
})
```

**Manual optimization (without module):**

```css
/* Preload critical font */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap;
  font-weight: 100 900;
  unicode-range: U+0000-007F; /* Basic Latin subset */
}
```

```vue
<!-- app.vue: preload hint -->
<script setup>
useHead({
  link: [
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      href: '/fonts/inter-var.woff2',
      crossorigin: '',
    },
  ],
})
</script>
```

### useNuxtData for Cache Sharing

Access previously fetched data by key — avoid duplicate requests across components:

```vue
<!-- pages/users/index.vue — fetches the list -->
<script setup lang="ts">
const { data: users } = await useFetch('/api/users', { key: 'users-list' })
</script>
```

```vue
<!-- components/UserCount.vue — reads cached data without re-fetching -->
<script setup lang="ts">
const { data: users } = useNuxtData('users-list')
// users.value is the same ref — no new network request
</script>

<template>
  <span>{{ users?.length ?? 0 }} users</span>
</template>
```

**Optimistic updates:**

```vue
<script setup lang="ts">
const { data: users } = useNuxtData('users-list')

async function deleteUser(id: number) {
  // Optimistic: remove from UI immediately
  const previous = users.value
  users.value = users.value?.filter(u => u.id !== id)

  try {
    await $fetch(`/api/users/${id}`, { method: 'DELETE' })
  } catch {
    // Rollback on failure
    users.value = previous
  }
}
</script>
```

### Tree-Shaking Best Practices

1. **Import from subpaths, not barrel files:**
   ```typescript
   // ✗ Imports entire library
   import { debounce } from 'lodash'

   // ✓ Imports only the function
   import debounce from 'lodash-es/debounce'
   ```

2. **Use dynamic imports for heavy client-only libs:**
   ```typescript
   // ✗ Bundled immediately
   import Chart from 'chart.js/auto'

   // ✓ Loaded on demand
   const loadChart = () => import('chart.js/auto')
   ```

3. **Keep server-only code out of client bundle:**
   ```typescript
   // ✗ In composables/ — bundled for client too
   import { PrismaClient } from '@prisma/client'

   // ✓ In server/utils/ — never reaches client
   import { PrismaClient } from '@prisma/client'
   ```

4. **Check for CJS dependencies:** CommonJS modules can't be tree-shaken. Prefer ESM packages (`lodash-es` over `lodash`). Run `nuxi analyze` after adding dependencies.

### Third-Party Script Loading

Defer non-critical scripts:

```vue
<script setup>
useHead({
  script: [
    // Critical: load immediately
    { src: '/scripts/critical.js' },

    // Non-critical: defer loading
    { src: 'https://analytics.example.com/track.js', defer: true },

    // Load after interaction
    {
      src: 'https://widget.example.com/chat.js',
      async: true,
      tagPosition: 'bodyClose',
    },
  ],
})
</script>
```

Or use the `useScript` composable from `@unhead/vue` for programmatic control:

```typescript
const { load } = useScript({
  src: 'https://maps.googleapis.com/maps/api/js',
  trigger: 'idle',  // Load when browser is idle
})
```

## Walkthrough

1. **Run `nuxi analyze`** — identify the 3 largest chunks in your bundle. Note their sizes.

2. **Optimize a dependency** — if you find a large library, replace with a lighter alternative or use subpath imports. Re-analyze and compare.

3. **Add `@nuxt/image`** — replace `<img>` tags with `<NuxtImg>`. Set sizes and quality. Check Network tab for optimized image delivery.

4. **Implement lazy hydration** — wrap a below-fold component in lazy hydration. Measure TTI before and after using Lighthouse.

5. **Optimize payload** — find a `useFetch` that returns too much data. Add `pick` or `transform`. Compare payload size in page source.

6. **Use `useNuxtData`** — share fetched data between a page and a header component without a second request.

## Gotchas

- **Lazy hydration on interactive elements feels broken.** A button with `hydrate:visible` won't respond to clicks until hydrated. Never defer hydration on above-the-fold interactive elements.
- **`@nuxt/image` IPX requires a server.** Won't work with `nuxi generate` for purely static sites. Use a CDN provider (Cloudinary, Vercel Image) or pre-generate images at build time.
- **Tree-shaking only works with ESM.** CJS packages (`require()` style) import everything. Check your dependencies with `nuxi analyze`.
- **`useNuxtData` returns stale data.** It reads from cache — if the data was fetched 10 minutes ago, that's what you get. Always check freshness if critical.
- **Payload extraction can break hydration.** If the extracted payload file fails to load (network error), the client has no data to hydrate with. Test offline/slow-network scenarios.
- **Over-optimization is premature.** Don't lazy-hydrate everything. Don't split every component. Measure first — Lighthouse, WebPageTest, or Core Web Vitals field data. Optimize what's actually slow.
- **Bundle analysis only shows client bundle.** Server-side bundle size matters less (no download to user). Focus on what ships to the browser.
- **Dynamic imports add request waterfalls.** Splitting too aggressively means the browser makes many sequential requests. Balance chunk count vs size.

## Exercise

Take a Nuxt app and optimize it:

1. **Baseline:** Run `nuxi analyze`. Record total client bundle size. Run Lighthouse and record LCP, TTI, CLS scores.

2. **Bundle optimization:**
   - Replace any full library imports with subpath imports
   - Move server-only dependencies to `server/utils/`
   - Lazy-load the heaviest client-only component

3. **Image optimization:**
   - Install `@nuxt/image`
   - Replace `<img>` with `<NuxtImg>` using responsive sizes
   - Add `loading="lazy"` for below-fold images
   - Set quality to 80, format to WebP

4. **Payload optimization:**
   - Find the largest `useFetch` call
   - Add `pick` or `transform` to reduce payload size
   - Verify smaller payload in view-source

5. **Results:** Re-run `nuxi analyze` and Lighthouse. Compare before/after. Target: 20%+ bundle reduction and improved Lighthouse scores.

## Further Reading

- [useNuxtData API](https://nuxt.com/docs/4.x/api/composables/use-nuxt-data)
- [@nuxt/image](https://image.nuxt.com)
- [@nuxt/fonts](https://fonts.nuxt.com)
- [Web Vitals](https://web.dev/vitals)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse)
