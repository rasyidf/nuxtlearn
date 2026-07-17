# Changes from 02-routing

## What was added

- **`layouts/` directory** — shared wrapper components for pages
- **`layouts/default.vue`** — header with nav, wraps all pages by default
- **`layouts/dashboard.vue`** — sidebar layout with flexbox
- **`definePageMeta({ layout })`** — per-page layout selection
- **`<NuxtLayout>`** in `app.vue` — the layout outlet

## Key concepts

- Pages use `default` layout unless they specify otherwise via `definePageMeta`
- Layouts must contain a `<slot />` to render page content
- Layout changes animate with Vue transitions (configurable)
- Navigation moved from `app.vue` into layout components

## Key files

| File | Purpose |
|------|---------|
| `layouts/default.vue` | Standard nav + content layout |
| `layouts/dashboard.vue` | Sidebar layout variant |
| `pages/dashboard.vue` | Uses `definePageMeta` to select layout |
