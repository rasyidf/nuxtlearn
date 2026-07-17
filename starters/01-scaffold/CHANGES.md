# Changes from 00-blank

## What was added

- **TypeScript strict mode** — enabled via `typescript.strict` in `nuxt.config.ts`
- **Devtools** — enabled via `devtools.enabled` in config
- **Compatibility date** — set to `2025-01-01` for Nuxt 4 defaults
- **Explored `nuxt.config.ts`** — the central configuration file for build, runtime, and module options

## Key files

| File | Purpose |
|------|---------|
| `nuxt.config.ts` | Project configuration — strict TS, devtools |
| `app.vue` | Root component (single-file app, no pages yet) |
| `tsconfig.json` | Extends Nuxt's generated tsconfig |
