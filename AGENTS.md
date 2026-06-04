# AGENTS.md

Repo for a Chilean public-procurement monitor: a React/Vite frontend (`client/`) that talks to an Express/TypeScript proxy (`server/`) which caches Chile's Mercado Público API.

## Layout

- `client/` — Vite 5 + React 18 + TypeScript + Tailwind 3. Runs on port 5173, binds `0.0.0.0` (see `client/vite.config.ts`).
  - Entry: `client/src/main.tsx` → `client/src/App.tsx` (single-page app with two tabs: licitaciones, proveedores).
  - Components: `client/src/components/LicitacionesTable.tsx`, `ProveedorCard.tsx`.
  - Shared types: `client/src/types.ts` (mirrors the Mercado Público JSON shape; uses `MontoEstimado` with a `MontoEstimated` alias).
  - Tailwind theme: custom `chilecompra-{50..950}` palette, custom `slate-850`/`slate-950` shades, glassmorphism utility classes in `client/src/index.css` (`.glass-panel`, `.glass-card`, `.glow-effect`).
  - `BACKEND_URL` is hard-coded to `http://localhost:3001/api` in `App.tsx:47`.
- `server/` — Express + TypeScript proxy on port 3001. Entry: `server/src/server.ts`.
  - Endpoints: `GET /api/licitaciones?fecha=DDMMAAAA&modo=demo|prod`, `GET /api/proveedor?rut=...&modo=demo|prod`, `GET /api/status`.
  - File-based cache in `server/.cache/` (`server/src/utils/cache.ts`). Default TTL 24h; 30d for proveedores; emergency fallback at 10d/180d.
  - Mock data in `server/src/utils/mockData.ts` powers the default demo mode.

## Run / build

Two independent packages, no root-level orchestrator. Run from each directory.

```
# server (terminal 1)
cd server
npm install   # if needed
npm run dev   # ts-node-dev, auto-restart, port 3001
# or: npm run build && npm start

# client (terminal 2)
cd client
npm install
npm run dev   # vite, port 5173
# or: npm run build   # tsc && vite build
# or: npm run preview
```

There are **no tests, no linter, and no formatter** configured. Don't invent `npm test` / `npm run lint` commands.

`client` builds with `tsc && vite build`; `tsc` is a real typecheck step, so build failures are usually type errors. `server` emits CommonJS to `server/dist/` from `server/src/`.

## Modes and the ticket

The server has two modes, toggled by `?modo=demo|prod` (and the client's UI toggle):

- **demo** (default) — no ticket needed, returns data from `mockData.ts`. Always cached.
- **prod** — calls `https://api.mercadopublico.cl/...`. Requires a ticket from `MERCADO_PUBLICO_TICKET` in `server/.env` or the `x-api-ticket` request header / `?ticket=` query. Returns HTTP 400 if `modo=prod` is requested without a ticket.

The upstream API has a hard **10,000 req/day** limit per ticket; the proxy exists primarily to stay under it via caching. On 502/timeout, the server falls back to expired cache (10d for licitaciones, 180d for proveedores) and tags the response `source: 'fallback_cache'` with a `warning` field.

The `fecha` param is `DDMMAAAA` (e.g. `04062026`), **not** ISO. The client converts from a `<input type="date">` value before calling.

## Environment / secrets

- `server/.env` exists locally with `PORT=3001` and a real `MERCADO_PUBLICO_TICKET`. The file is matched by `.gitignore` (`**/server/.env`) — **do not commit it**. The committed `.env` is a leak risk; rotate the ticket if it has ever been pushed.
- The `client` reads no env vars. The ticket is injected server-side or via the `x-api-ticket` header from the client UI.

## Conventions worth knowing

- Server is CommonJS, ES2022 target, strict TS. Client is ESNext/bundler, `noUnusedLocals` and `noUnusedParameters` are on — don't leave dead imports.
- Tailwind config uses `export default` (ESM) — `client` is `"type": "module"`.
- RUTs are normalized server-side (`formatRut` in `server/src/server.ts:23`) before use; the client sends raw RUTs.
- Response objects always include a `source` discriminator: `cache | demo_api | official_api | fallback_cache`. The UI uses this to show badges.
- Cache files are sanitized keys (`[^a-zA-Z0-9_-]` → `_`) with `.json` extension in `server/.cache/`. Safe to delete the directory to force a cold start.
