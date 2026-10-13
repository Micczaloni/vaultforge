# Vaultforge — Architecture

**Product:** personal gaming vault + light social layer  
**Tagline:** _Your games. Your record. Your forge._  
**Visual system:** Obsidian Terminal (dark, steel-blue primary, restrained cyan accent)  
**Status:** Phase 1 freeze — implementation follows this document.

---

## 1. Goals

Vaultforge demonstrates production-style frontend/full-stack engineering:

- Track games (playing / completed / backlog / wishlist / played)
- Discover games via an external catalog (RAWG), abstracted behind a service layer
- Earn platform achievements, gain XP, appear on a leaderboard
- Public profiles + activity feed (no friends graph / DMs in v1)
- Auth (credentials + GitHub OAuth), RBAC (`USER` | `ADMIN`)

---

## 2. High-level system

```
┌─────────────────┐     ┌──────────────────────────┐     ┌─────────────┐
│  Browser        │────▶│  Next.js (Vercel)        │────▶│ Neon Postgres│
│  RSC + Client   │     │  App Router + Route API  │     └─────────────┘
└─────────────────┘     │  Auth.js (JWT cookies)   │────▶ RAWG API
                        │  Prisma ORM              │────▶ Sentry
                        └──────────────────────────┘
                                      ▲
                                      │
                               GitHub Actions CI
```

**Deploy:** Vercel (app) + Neon (PostgreSQL) + Sentry (errors).

---

## 3. Repository layout

```
app/
  (marketing)/          # landing, about, legal
  (auth)/               # login, register
  (app)/                # authenticated shell: dashboard, library, …
  admin/                # ADMIN-only
  api/v1/               # REST Route Handlers
  api/auth/             # Auth.js handlers
components/
  ui/                   # shadcn primitives
  games/ library/ …     # domain components
lib/
  auth/ db/ rbac/
  games/catalog/        # GameCatalogService + RawgGameCatalog
  validations/          # Zod schemas
  api/                  # response helpers, errors, rate limit
stores/                 # Zustand (UI chrome only)
hooks/
types/
prisma/
  schema.prisma
  seed.ts
docs/
  openapi.yaml
```

---

## 4. Page map

| Area       | Routes                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Public     | `/`, `/games`, `/games/[slug]`, `/search`, `/u/[username]`, `/leaderboard`, `/login`, `/register`, `/about`, `/privacy`, `/terms`         |
| App (auth) | `/dashboard`, `/library`, `/library/wishlist`, `/library/backlog`, `/achievements`, `/activity`, `/settings/profile`, `/settings/account` |
| Admin      | `/admin`, `/admin/users`, `/admin/achievements`, `/admin/stats`                                                                           |

Route groups use `loading.tsx`, `error.tsx`, and `not-found.tsx` where useful.

---

## 5. Data model

### Entities

| Entity                                      | Purpose                                               |
| ------------------------------------------- | ----------------------------------------------------- |
| `User`                                      | Auth identity, `role`, optional `passwordHash`        |
| `Account` / `Session` / `VerificationToken` | Auth.js adapter tables                                |
| `Profile`                                   | username, displayName, bio, avatarUrl, isPublic, xp   |
| `Game`                                      | Local cache of external catalog entries               |
| `Genre` / `Platform`                        | Taxonomy                                              |
| `GameGenre` / `GamePlatform`                | M2M                                                   |
| `UserGame`                                  | Library row; status enum; rating; notes; favorited    |
| `Achievement`                               | Platform achievements (code, criteria JSON, xpReward) |
| `UserAchievement`                           | Unlock + progress                                     |
| `Activity`                                  | Feed events                                           |

### Not in v1

- Separate `Wishlist` table → `UserGame.status = WISHLIST`
- `Notification` → deferred
- External game achievements from RAWG → deferred

### Enums

```
Role: USER | ADMIN
LibraryStatus: PLAYING | COMPLETED | BACKLOG | WISHLIST | PLAYED
```

**Semantics:**

- `PLAYING` — currently in progress
- `COMPLETED` — finished / 100% intent
- `BACKLOG` — owned or planned, not started
- `WISHLIST` — want to play / buy
- `PLAYED` — touched / dropped / finished casually without “completed”

### Constraints & indexes

- Unique: `User.email`, `Profile.username`, `Game.externalId`, `Game.slug`, `UserGame(userId, gameId)`, `Achievement.code`
- Indexes: `UserGame(userId, status)`, `Activity(createdAt)`, `Activity(actorId, createdAt)`, `Game(title)`
- Cascade: delete `User` → Profile, UserGame, UserAchievement, Activity
- Games: keep cached rows even if unused (no aggressive cascade)

### Cardinality

```
User 1──1 Profile
User 1──* UserGame *──1 Game
Game *──* Genre | Platform
User 1──* UserAchievement *──1 Achievement
User 1──* Activity
```

---

## 6. API conventions

- Base path: `/api/v1`
- Auth: Auth.js session cookie; handlers use `requireSession()` / `requireRole('ADMIN')`
- Envelope success: `{ data, meta? }`
- Envelope error: `{ error: { code, message, details? } }`
- Pagination: `page`, `pageSize` (default 20, max 50)
- Filter/sort: query params (`q`, `genre`, `platform`, `status`, `sort`, `order`)
- Validation: Zod on all mutating bodies and critical query params
- Rate limit: auth, search, mutations (in-memory locally; Upstash optional in prod)
- OpenAPI: [`docs/openapi.yaml`](docs/openapi.yaml)

### Core endpoints

| Method       | Path                     | Auth                       |
| ------------ | ------------------------ | -------------------------- |
| GET          | `/games`                 | public                     |
| GET          | `/games/search`          | public                     |
| GET          | `/games/:slug`           | public                     |
| GET/POST     | `/library`               | session                    |
| PATCH/DELETE | `/library/:id`           | owner                      |
| GET          | `/users/:username`       | public (respects isPublic) |
| GET          | `/users/:username/stats` | public (respects isPublic) |
| PATCH        | `/me/profile`            | session                    |
| GET          | `/achievements`          | public                     |
| GET          | `/me/achievements`       | session                    |
| GET          | `/feed`                  | session                    |
| GET          | `/leaderboard`           | public                     |
| *            | `/admin/*`               | ADMIN                      |

---

## 7. External game catalog

```ts
interface GameCatalogService {
  search(query: string, opts?: SearchOpts): Promise<CatalogGame[]>;
  getByExternalId(id: string): Promise<CatalogGame | null>;
  list(opts?: ListOpts): Promise<Paged<CatalogGame>>;
}
```

- Implementation: `RawgGameCatalog` (server-only; `RAWG_API_KEY`)
- Route Handlers and Server Components call the interface, never RAWG HTTP directly
- Persisted `Game` rows act as a cache / local join target for libraries

---

## 8. Auth & RBAC

| Decision  | Choice                                                                          |
| --------- | ------------------------------------------------------------------------------- |
| Library   | Auth.js (NextAuth v5)                                                           |
| Providers | Credentials + GitHub                                                            |
| Passwords | argon2id (or bcrypt if tooling friction)                                        |
| Session   | JWT strategy + httpOnly Secure SameSite=Lax cookies                             |
| Roles     | `USER`, `ADMIN` on `User.role`                                                  |
| Gates     | Middleware for route prefixes + server `requireRole` (never trust client alone) |
| IDOR      | Library/achievement mutations scoped to `session.user.id`                       |

---

## 9. Rendering & state

| Concern                                           | Approach                                              |
| ------------------------------------------------- | ----------------------------------------------------- |
| Landing, game detail, public profile, leaderboard | Server Components / SSR                               |
| Filters, forms, optimistic library toggles        | Client Components                                     |
| Discovery filters                                 | URL search params (shareable)                         |
| Server data on interactive pages                  | TanStack Query                                        |
| UI chrome (sidebar open, etc.)                    | Zustand — minimal                                     |
| Catalog / list caching                            | `unstable_cache` / tag revalidation where appropriate |

**Rule:** do not make everything a Client Component.

---

## 10. Security (baseline)

- Server-side Zod validation
- Secure password hashing
- RBAC + ownership checks
- No secrets in repo (`.env.example` only)
- RAWG key server-only
- Plain-text bios only (no rich HTML) in v1
- Security headers via Next config / middleware
- Rate limiting on sensitive routes

---

## 11. Testing

| Layer       | Tools          | Focus                                                 |
| ----------- | -------------- | ----------------------------------------------------- |
| Unit        | Jest           | Zod, XP, achievement criteria, RBAC, catalog mappers  |
| Component   | RTL            | forms, GameCard, status select                        |
| Integration | Jest + test DB | Route Handlers, authz                                 |
| E2E         | Cypress        | register → library → profile → leaderboard; admin 403 |

---

## 12. Quality, Docker, CI/CD

- ESLint + Prettier + Husky + lint-staged
- `Dockerfile` (multi-stage) + `docker-compose.yml` (`app` + Postgres 16)
- GitHub Actions: install → lint → typecheck → test → build
- Deploy: Vercel from `main`; migrations via Prisma against Neon

---

## 13. Design tokens (Obsidian Terminal)

| Token      | Value                                 |
| ---------- | ------------------------------------- |
| Primary    | `#3B82F6`                             |
| Accent     | `#22D3EE` (sparingly)                 |
| Background | `#0B0D10`                             |
| Surface    | `#12151A` / `#181C23`                 |
| Border     | `#2A303A`                             |
| Text       | `#E8ECF1` / muted `#9AA3B2`           |
| Fonts      | Outfit + JetBrains Mono (`next/font`) |
| Radius     | 6 / 10 / 14 px                        |

---

## 14. MoSCoW (scope lock)

- **MUST:** auth, RBAC, profiles, discovery, library, dashboard, achievements, feed, leaderboard, Prisma, tests, Docker, CI, Vercel+Neon, design system, a11y/SEO basics, README
- **SHOULD:** GitHub OAuth, OpenAPI UI, rate limit, Sentry, admin CRUD, favorites, private profiles, Cypress in CI
- **NICE:** notifications, side-by-side compare, recommendations, avatar upload
- **LATER:** IGDB swap, friends, realtime, i18n, GraphQL

---

## 15. Phase map (implementation order)

0 Discovery (done) → 1 Architecture (this doc) → 2 Setup → 3 Design system → 4 DB → 5 Catalog → 6 Auth → 7 Discovery → 8 Library → 9 Profiles → 10 Achievements → 11 Feed → 12 Leaderboard → 13 Admin → 14 Tests → 15 Security → 16 A11y → 17 Perf → 18 Docker → 19 CI → 20 Deploy → 21 Docs → 22 Portfolio polish

---

## 16. Learning rule

Before each complex feature: short concept brief → implement with understanding → note production failure modes. Prefer maintainable solutions over clever ones. No microservices / Kafka / GraphQL without a clear need.
