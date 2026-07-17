# nuxtlearn

A dense, opinionated Nuxt 4 syllabus for onboarding software engineers. Not a docs rewrite — a guided learning path that connects the dots between official documentation, real patterns, and production gotchas.

## Target Audience

Software engineers already comfortable with:
- TypeScript, Vue 3 (Composition API)
- Component-based architecture
- Build tools (Vite), Node.js ecosystem
- REST APIs, basic SSR concepts

## Structure

```
nuxtlearn/
├── docs/          → Jekyll documentation site (the syllabus)
├── starters/      → Nuxt 4.4.x project snapshots per chapter
├── solutions/     → Exercise solutions
└── README.md
```

## Syllabus

| # | Chapter | Focus |
|---|---------|-------|
| 00 | Orientation | Mental model: rendering spectrum, Nitro, auto-imports |
| 01 | Scaffold & Config | `nuxi init`, `nuxt.config.ts`, devtools |
| 02 | Routing | File-based routing, dynamic params, navigation |
| 03 | Layouts & Views | Named layouts, transitions, slots |
| 04 | Data Fetching | `useFetch`, `useAsyncData`, `$fetch`, caching |
| 05 | Server Routes | Nitro, `server/api/`, H3 utils |
| 06 | State | `useState`, Pinia, hydration |
| 07 | Middleware & Auth | Route guards, redirect patterns |
| 08 | Components | `<ClientOnly>`, Islands, lazy loading |
| 09 | Composables | Custom composables, auto-import dirs |
| 10 | Error Handling | `error.vue`, boundaries, Nitro errors |
| 11 | SEO & Head | `useHead`, `useSeoMeta`, OG, sitemap |
| 12 | Modules & Plugins | Writing modules, plugin lifecycle, hooks |
| 13 | Rendering Modes | Hybrid, ISR, `routeRules`, prerendering |
| 14 | Testing | `@nuxt/test-utils`, vitest, component tests |
| 15 | Performance | Bundle analysis, lazy hydration, images |
| 16 | Deployment | Presets, Docker, env, edge vs Node |
| 17 | Layers & Monorepo | Extending apps, shared configs |
| 18 | Real Patterns | i18n, feature flags, multi-tenancy, WebSocket |

## Usage

### Docs Site (Jekyll)

```bash
cd docs
bundle install
bundle exec jekyll serve
# → http://localhost:4000
```

### Starters

Each starter is an independent, runnable Nuxt project:

```bash
cd starters/04-data-fetching
npm install
npm run dev
```

### Progression

Starters build on each other. Each includes a `CHANGES.md` describing what was added from the previous step.

## Nuxt Version

Pinned to **Nuxt 4.4.8** (latest stable as of July 2026).

## Philosophy

- **Dense** — assumes you can read code, skips hand-holding
- **Guided** — tells you what to read in official docs and when
- **Practical** — builds a real thing, not toy examples
- **Opinionated** — "here's how to do it" over "here are 5 ways"
- **Gotcha-aware** — highlights what trips people up
