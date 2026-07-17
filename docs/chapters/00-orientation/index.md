---
title: "Orientation"
layout: chapter
nav_order: 1
parent: Home
starter: "00-blank"
official_docs:
  - https://nuxt.com/docs/4.x/getting-started/introduction
  - https://nuxt.com/docs/4.x/guide/concepts/auto-imports
---

# Orientation

## TL;DR

Nuxt is a full-stack Vue framework that gives you SSR, SSG, SPA, ISR, and hybrid rendering out of one codebase. You pick the rendering strategy per route. Nitro is the universal server engine that compiles your server code to any deployment target. Auto-imports eliminate boilerplate. Understanding these three pillars — rendering spectrum, Nitro, and auto-imports — is the foundation for everything else in this syllabus.

## Mental Model

Think of Nuxt as a compiler that takes your Vue components, server routes, and configuration, then produces an optimized full-stack application tuned for your deployment target. It's not "Vue with extra steps" — it's a different mental model where the framework owns the build pipeline, the server, and the rendering strategy.

### The Rendering Spectrum

Every web page lives somewhere on this spectrum:

```
SSG ←————→ ISR ←————→ SSR ←————→ SPA
(build)    (cached)   (per-req)  (client)
```

- **SSG (Static Site Generation):** HTML generated at build time. Fastest TTFB, but content is stale until you rebuild. Use for: marketing pages, docs, blogs.
- **SSR (Server-Side Rendering):** HTML generated on every request. Always fresh, but requires a running server. Use for: dashboards, personalized content, real-time data.
- **SPA (Single Page Application):** Empty HTML shell, JavaScript renders everything client-side. No server needed after deploy. Use for: internal tools, apps behind auth where SEO doesn't matter.
- **ISR (Incremental Static Regeneration):** Cached SSR — serve stale while regenerating in the background. Best of both worlds for content that changes occasionally. Use for: e-commerce product pages, news articles.
- **Hybrid:** Mix all of the above per route in a single app. This is Nuxt's superpower.

Nuxt defaults to **universal rendering** (SSR + client hydration). The server renders HTML on first load, then Vue takes over on the client for subsequent navigation. This gives you fast initial paint AND full SPA-like interactivity.

### What is Nitro?

Nitro is Nuxt's universal server engine. It's a separate project (`nitro.build`) that Nuxt uses under the hood. Here's why it matters:

1. **Write once, deploy anywhere.** Nitro compiles your server code into a self-contained output for Node.js, Deno, Cloudflare Workers, Vercel Edge, Netlify, AWS Lambda — you just change a config preset.
2. **Not Express.** Nitro uses H3, a minimal HTTP framework. If you're expecting `req.body` or `app.use()` Express patterns, stop. H3 has its own API (`getQuery`, `readBody`, `defineEventHandler`).
3. **Server routes are filesystem-based.** Files in `server/api/` and `server/routes/` become API endpoints automatically. Same convention as pages.
4. **Built-in features:** Caching (route rules), server middleware, storage (key-value with multiple drivers), scheduled tasks.

Think of Nitro as "Vite for the backend" — it handles bundling, HMR, and output optimization for your server code.

### Auto-Imports Explained

Nuxt auto-imports:
- **Vue APIs:** `ref`, `computed`, `watch`, `onMounted`, etc.
- **Nuxt composables:** `useFetch`, `useRoute`, `useRouter`, `useState`, `useHead`, etc.
- **Your own code:** anything exported from `composables/`, `utils/`, and components from `components/`.

No `import { ref } from 'vue'` needed. The framework scans these directories and generates the import statements at build time.

**How it works under the hood:** Nuxt generates `.nuxt/imports.d.ts` with type declarations and uses `unimport` to inject actual imports during compilation. Your source code stays clean; the compiled output has explicit imports.

**The IDE problem:** Without the generated types, your editor shows red squiggles everywhere. The fix: run `nuxi prepare` (or `npm run dev` which does it automatically). This generates the `.nuxt/` directory with TypeScript declarations. Your `tsconfig.json` extends `.nuxt/tsconfig.json` which adds the auto-import types.

### Directory Conventions

```
your-app/
├── app.vue           → Root component (entry point)
├── pages/            → File-based routing (creates vue-router config)
├── components/       → Auto-imported Vue components
├── composables/      → Auto-imported composable functions
├── utils/            → Auto-imported utility functions
├── layouts/          → Page layout wrappers
├── middleware/       → Route navigation guards
├── plugins/          → App-level plugins (run before render)
├── server/
│   ├── api/          → API endpoints (/api/*)
│   ├── routes/       → Server routes (any path)
│   ├── middleware/   → Server middleware (runs on every request)
│   └── utils/        → Server-only utilities (auto-imported in server context)
├── public/           → Static assets (served as-is, no processing)
├── assets/           → Processed assets (CSS, images through Vite pipeline)
├── nuxt.config.ts    → Framework configuration
└── .nuxt/            → Generated types, build artifacts (gitignored)
```

Key distinction: `server/` runs on Nitro (backend). Everything else runs in the Vue app (frontend, or universal during SSR). Don't mix them up — you can't use `useFetch` in a server route, and you can't access the database directly from a component.

### How to Read Official Docs

The Nuxt docs are structured in layers:

1. **Getting Started** — linear walkthrough, read once. Covers what this chapter covers but less opinionated.
2. **Guide → Concepts** — deep dives into specific topics (rendering, auto-imports, server). Read when you hit a chapter that covers that concept.
3. **API Reference** — lookup table for composables, utils, components, and config options. Bookmark this; you'll use it daily.
4. **Examples** — runnable StackBlitz demos. Useful when prose isn't clicking.

**Pro tip:** The docs search is good. Use it. But the API reference pages for composables (`useFetch`, `useAsyncData`, etc.) have the most accurate type signatures and option descriptions — prefer them over blog posts or Stack Overflow.

## Walkthrough

Open the `00-blank` starter:

```bash
cd starters/00-blank
npm install
npm run dev
```

Now observe:

1. **Check the rendering mode.** View page source in the browser — you'll see fully rendered HTML. That's SSR (universal rendering) active by default.
2. **Open Nuxt DevTools.** Press Shift+Alt+D (or click the Nuxt icon at the bottom of the page). Explore the tabs: Components, Imports, Routes, Server Routes, Storage.
3. **Inspect auto-imports.** Look at `.nuxt/imports.d.ts` — every composable and Vue API that's available without explicit imports is declared there.
4. **Trace a request.** Open Network tab, navigate to the page. First request: full HTML from server. Client-side JS hydrates. Subsequent navigations: only JSON payload (no full page reload).

## Gotchas

- **Auto-imports confuse your IDE** until `.nuxt/` is generated. Run `nuxi prepare` if types aren't resolving. Never commit `.nuxt/` to git.
- **"SSR" in Nuxt means universal rendering** — server renders the initial HTML, then the client hydrates and takes over. It's not "server-only rendering" like PHP/Rails. The same components run in both environments.
- **Nitro routes are NOT Express.** Don't reach for `req.body` or Express middleware patterns. H3 has its own API. If you install `express` as a dependency, you're doing it wrong.
- **`server/` vs SSR rendering.** The `server/` directory contains your API/backend logic (Nitro). SSR is a rendering strategy for your Vue pages. They both run on the server, but they're completely separate concerns. A component rendered via SSR cannot directly call a function in `server/utils/` — it must go through an HTTP call (or `$fetch`).
- **The `.nuxt/` directory.** It's generated, gitignored, and essential for TypeScript. If types break, delete it and run `nuxi prepare` again.

## Exercise

1. Read the [official Introduction page](https://nuxt.com/docs/4.x/getting-started/introduction).
2. Draw the rendering spectrum on paper. For each of these, choose a rendering mode and justify why:
   - A company blog with 50 posts, updated weekly
   - A real-time stock trading dashboard
   - An internal HR tool behind corporate SSO
   - A product page for an e-commerce site with 10k products
3. Open the `00-blank` starter. Add a `<p>{{ message }}</p>` using a `ref()` — no import statement. Verify it works. Then check `.nuxt/imports.d.ts` to see where the type came from.

## Further Reading

- [Nuxt Introduction](https://nuxt.com/docs/4.x/getting-started/introduction)
- [Auto-Imports Concept](https://nuxt.com/docs/4.x/guide/concepts/auto-imports)
- [Nitro Documentation](https://nitro.build)
- [H3 Documentation](https://h3.unjs.io)
