# Chapter 11: SEO & Head — Changes

## What's New

This starter demonstrates Nuxt's built-in head management and SEO utilities.

### `useHead`

The low-level composable for setting any `<head>` element — title, meta, link, script, style, htmlAttrs, bodyAttrs.

Used in:
- `app.vue` — sets `titleTemplate` globally
- `pages/about.vue` — sets page title and canonical link
- `pages/blog/[slug].vue` — injects JSON-LD structured data via `<script type="application/ld+json">`

### `useSeoMeta`

A type-safe helper that flattens meta tag definitions into a simple object. Handles `og:*`, `twitter:*`, and standard meta automatically.

Used in:
- `pages/index.vue` — title, description, Open Graph
- `pages/about.vue` — description, Open Graph
- `pages/blog/index.vue` — blog listing meta
- `pages/blog/[slug].vue` — dynamic meta from fetched post data

### `titleTemplate`

Set in `app.vue` as `'%s | NuxtLearn'`. Every page's `title` is interpolated into this template. The `%s` placeholder is replaced with the page-specific title.

### Canonical URLs

The `composables/useCanonical.ts` composable builds a canonical URL from:
1. `runtimeConfig.public.siteUrl` (set in `nuxt.config.ts`, overridable via `NUXT_PUBLIC_SITE_URL` env var)
2. The current route path

This ensures search engines know the preferred URL for each page, avoiding duplicate content issues.

### JSON-LD Structured Data

In `pages/blog/[slug].vue`, we inject an `Article` schema using `useHead` with a script tag:

```ts
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', ... }),
    },
  ],
})
```

This tells search engines the page is an article with a headline, author, publish date, and cover image — enabling rich results in SERPs.

## Key Concepts

| Concept | Composable | Use Case |
|---------|-----------|----------|
| Page title | `useHead({ title })` | Static titles |
| Title template | `useHead({ titleTemplate })` | Global suffix/prefix |
| SEO meta | `useSeoMeta()` | Type-safe OG/Twitter/meta |
| Canonical | `useHead({ link })` | Preferred URL |
| Structured data | `useHead({ script })` | JSON-LD for rich results |
| Runtime config | `useRuntimeConfig()` | Env-driven site URL |

## Files Added

```
starters/11-seo/
├── app.vue                        (titleTemplate)
├── nuxt.config.ts                 (head defaults, runtimeConfig)
├── layouts/default.vue            (navigation)
├── pages/
│   ├── index.vue                  (useSeoMeta)
│   ├── about.vue                  (useHead + useSeoMeta)
│   └── blog/
│       ├── index.vue              (list with useSeoMeta)
│       └── [slug].vue             (dynamic meta + JSON-LD)
├── composables/
│   └── useCanonical.ts            (canonical URL helper)
└── server/api/posts/
    ├── index.get.ts               (blog list endpoint)
    └── [slug].get.ts              (single post endpoint)
```
