# Vaultforge

**Your games. Your record. Your forge.**

Vaultforge is a portfolio-grade gaming platform: personal game tracker, discovery catalog, platform achievements, activity feed, XP leaderboard, profiles, and admin RBAC. Seeded covers come from the **Steam CDN** (no API key). Optional live discovery via `RAWG_API_KEY` when that service is available.

Architecture details: [`ARCHITECTURE.md`](./ARCHITECTURE.md) · OpenAPI: [`docs/openapi.yaml`](./docs/openapi.yaml)

## Stack

- Next.js App Router · React · TypeScript · Tailwind CSS · shadcn/ui · Radix
- Zustand (UI only) · React Hook Form · Zod
- SQLite locally (Postgres-ready) · Prisma · Auth.js (credentials + optional GitHub)
- REST `/api/v1` · Jest · Testing Library · Docker · GitHub Actions
- Steam CDN game art (covers + cinematic `library_hero` landing backdrop)

## Quick start (no Docker required)

```bash
npm install
cp .env.example .env
# default DATABASE_URL is SQLite: file:./dev.db

npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### How to log in

1. Open `/login`
2. Use a seeded account:
   - `admin@vaultforge.dev` / `Password123!` (ADMIN)
   - `aria@vaultforge.dev` / `Password123!` (USER)
3. After login you land on `/dashboard`

> Local database is **SQLite** so the app works without installing Docker/Postgres.
> Docker Compose remains available later for Postgres parity if you want it.

### Demo accounts (after seed)

Password for all seeded users: `Password123!`

| Email                | Username   | Role  |
| -------------------- | ---------- | ----- |
| admin@vaultforge.dev | forgeadmin | ADMIN |
| aria@vaultforge.dev  | aria       | USER  |

## Scripts

| Script                                         | Purpose       |
| ---------------------------------------------- | ------------- |
| `npm run dev`                                  | Dev server    |
| `npm run build` / `start`                      | Production    |
| `npm run lint` / `typecheck` / `test`          | Quality gates |
| `npm run db:migrate` / `db:seed` / `db:studio` | Database      |

## Product surfaces

- Public: landing, Discover (`/games`), game details, leaderboard, profiles `/u/[username]`
- Auth: register / login (credentials; GitHub when env configured)
- App: dashboard, library (+ wishlist/backlog), achievements, activity, settings
- Admin: stats, users, achievement CRUD (`ADMIN` only)

## Architecture highlights

- **Catalog adapter:** `GameCatalogService` → `RawgGameCatalog` or `LocalGameCatalog`
- **Auth/RBAC:** Auth.js JWT sessions, middleware + server helpers, IDOR checks on library
- **Achievements:** criteria engine evaluates after library mutations and awards XP
- **Security:** Zod validation, rate limits on search/register, security headers, env secrets only

## Docker

```bash
docker compose up -d db     # database only (recommended while developing)
# or full stack:
docker compose up --build
```

## CI/CD

GitHub Actions runs on push/PR: install → prisma generate → lint → typecheck → test → build.

## Deployment (when ready)

- App: Vercel
- DB: Neon PostgreSQL
- Set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, optional `RAWG_API_KEY`, `AUTH_GITHUB_*`, `SENTRY_DSN`
- Run migrations against production (`prisma migrate deploy`)

## License

Private portfolio project.
