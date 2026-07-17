# 03 — Layouts

Named layouts with `layouts/` directory and `definePageMeta` for per-page layout selection.

## What to explore

- Default layout applies to all pages automatically
- `definePageMeta({ layout: 'dashboard' })` switches layout
- Layouts use `<slot />` to render page content
- Notice the DOM structure changes when navigating between layouts

## Run

```bash
npm install
npm run dev
```

Visit `/` (default layout) and `/dashboard` (dashboard layout).
