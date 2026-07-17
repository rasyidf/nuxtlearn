# Changes from 04-data-fetching

## What was added

- **Full CRUD API** — GET, POST, DELETE operations on `/api/items`
- **Server middleware** — `server/middleware/log.ts` logs every request
- **Shared server utils** — `server/utils/db.ts` is auto-imported in all server routes
- **In-memory database** — demonstrates the pattern (replaced by real DB in production)
- **`$fetch` for mutations** — POST and DELETE from client using `$fetch` directly
- **`refresh()`** — re-fetches data after mutations to keep UI in sync

## Key files

| File | Purpose |
|------|---------|
| `server/utils/db.ts` | In-memory store, auto-imported in server context |
| `server/middleware/log.ts` | Runs on every request (check terminal output) |
| `server/api/items/index.get.ts` | `GET /api/items` — list all |
| `server/api/items/index.post.ts` | `POST /api/items` — create new |
| `server/api/items/[id].get.ts` | `GET /api/items/:id` — get one |
| `server/api/items/[id].delete.ts` | `DELETE /api/items/:id` — remove |
| `pages/index.vue` | CRUD UI with form + list |

## Key concepts

- `server/utils/` files are auto-imported in the Nitro server context
- `server/middleware/` runs on ALL requests (no route matching)
- Method-specific filenames (`.get.ts`, `.post.ts`, `.delete.ts`) restrict HTTP methods
- `createError` throws proper HTTP error responses
- `readBody` parses request body (POST/PUT/PATCH)
- Data resets on server restart (in-memory only)
