# Vaultforge

**Your games. Your record. Your forge.**

Vaultforge is a portfolio-grade gaming platform: personal game tracker, discovery (via RAWG behind a service layer), platform achievements, activity feed, leaderboard, and admin RBAC.

This repository is implemented in phases. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) and [`docs/openapi.yaml`](./docs/openapi.yaml).

## Stack

- Next.js App Router · React · TypeScript · Tailwind CSS · shadcn/ui · Radix
- Zustand (UI only) · TanStack Query · React Hook Form · Zod
- PostgreSQL · Prisma · Auth.js · REST `/api/v1` · OpenAPI
- Jest · Testing Library · Cypress · Docker · GitHub Actions · Vercel · Neon · Sentry

## Getting started (Phase 2)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script                 | Purpose                    |
| ---------------------- | -------------------------- |
| `npm run dev`          | Next.js development server |
| `npm run build`        | Production build           |
| `npm run lint`         | ESLint                     |
| `npm run typecheck`    | TypeScript check           |
| `npm run format`       | Prettier write             |
| `npm run format:check` | Prettier check             |

Husky + lint-staged run ESLint and Prettier on staged files before commit.

### Environment

Copy `.env.example` to `.env.local` and fill values as later phases unlock database, auth, and RAWG.

## Design

**Obsidian Terminal** — dark charcoal surfaces, steel-blue primary (`#3B82F6`), restrained cyan accent, Outfit + JetBrains Mono via `next/font`.

## Route groups

- `(marketing)` — landing, games, leaderboard, legal
- `(auth)` — login / register
- `(app)` — dashboard, library, achievements, activity, settings
- `admin` — ADMIN-only shell (enforcement in Phase 6/13)

## Documentation

- Architecture: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- OpenAPI outline: [`docs/openapi.yaml`](./docs/openapi.yaml)

## License

Private portfolio project.
