# Changes from 01-scaffold

## What was added

- **`pages/` directory** — enables file-based routing (Nuxt auto-generates vue-router config)
- **`<NuxtPage />`** in `app.vue` — renders the matched page component
- **`<NuxtLink>`** — client-side navigation (no full-page reload)
- **Dynamic route** — `pages/posts/[id].vue` captures URL params via `useRoute()`

## Key files

| File | Purpose |
|------|---------|
| `pages/index.vue` | Home page (`/`) |
| `pages/about.vue` | Static page (`/about`) |
| `pages/posts/index.vue` | Posts list (`/posts`) |
| `pages/posts/[id].vue` | Dynamic route (`/posts/1`, `/posts/2`, etc.) |

## What was removed

- The single `app.vue` content was replaced with navigation + `<NuxtPage />` router outlet
