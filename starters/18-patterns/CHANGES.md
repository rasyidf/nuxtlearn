# Changes from Previous Chapter

This starter introduces **real-world production patterns** commonly used in Nuxt applications.

## What's New

### Feature Flags (Runtime Config + Route Middleware)

- **`runtimeConfig.public.features`** defines boolean flags (`betaPage`, `darkMode`)
- **`middleware/feature-gate.ts`** blocks routes based on flag values (returns 404 if disabled)
- Flags are overridable at runtime via environment variables:
  ```bash
  NUXT_PUBLIC_FEATURES_BETA_PAGE=true nuxt dev
  ```
- The layout shows a badge when a feature is enabled

### WebSocket (Nitro Experimental + Client Composable)

- **`nitro.experimental.websocket: true`** enables WebSocket support in Nitro
- **`server/routes/_ws.ts`** defines a WebSocket handler using `defineWebSocketHandler`
  - Manages connected peers, broadcasts messages to all except sender
  - Uses the `crossws` Peer type (Nitro's WebSocket abstraction)
- **`composables/useWebSocket.ts`** provides `useChat()` composable
  - Auto-connects on mount, reconnects on close (3s delay)
  - Exposes reactive `messages`, `connected`, and `send()` function
- **`pages/chat.vue`** demonstrates real-time messaging UI

### Rate Limiting (Server Middleware)

- **`server/middleware/rate-limit.ts`** implements per-IP sliding window rate limiting
  - 30 requests per 60-second window for `/api/*` routes
  - Sets `X-RateLimit-Limit` and `X-RateLimit-Remaining` headers
  - Returns 429 when limit exceeded
- **`pages/rate-limit-test.vue`** provides a UI to test the limiter by firing rapid requests

## Patterns Overview

| Pattern | Files | Key Concept |
|---------|-------|-------------|
| Feature Flags | `nuxt.config.ts`, `middleware/feature-gate.ts`, `layouts/default.vue` | Runtime toggles without redeployment |
| WebSocket | `server/routes/_ws.ts`, `composables/useWebSocket.ts`, `pages/chat.vue` | Real-time bidirectional communication |
| Rate Limiting | `server/middleware/rate-limit.ts` | API protection at the edge |

## Key Takeaways

1. **Feature flags via runtimeConfig** — no rebuild needed, just set env vars per environment
2. **WebSocket in Nitro** — `defineWebSocketHandler` + `crossws` peer abstraction makes it simple
3. **Server middleware** — runs on every request, perfect for cross-cutting concerns like rate limiting
4. **Composables encapsulate complexity** — the chat page doesn't know about WebSocket reconnection logic
