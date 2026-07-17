# 05 — Server Routes

Full CRUD server API with middleware, shared utils, and in-memory storage.

## What to explore

- `server/utils/` auto-imports into all server routes (no explicit import needed)
- `server/middleware/` runs on every request — check terminal for logs
- Method-specific filenames: `.get.ts`, `.post.ts`, `.delete.ts`
- `createError` for proper HTTP error responses
- `$fetch` for client-side mutations (bypasses useFetch caching)
- `refresh()` to re-fetch after mutations

## Run

```bash
npm install
npm run dev
```

Try adding and deleting items. Watch the terminal for middleware logs.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/items` | List all items |
| POST | `/api/items` | Create item (`{ name: "..." }`) |
| GET | `/api/items/:id` | Get single item |
| DELETE | `/api/items/:id` | Delete item |
