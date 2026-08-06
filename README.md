# Boron

Boron is a project & task management web app. It lets users organize work into projects, milestones and tasks, track costs, and search across everything. Built with Next.js (App Router), Prisma, and MySQL, with authentication via NextAuth (email/password, Google, and GitHub).

## Prerequisites

- Node.js 18+ (20 recommended) and npm
- A running MySQL 8+ server (Docker container or native install) with a **blank database already created** — Prisma will build the schema inside it, but it won't create the database itself
- Git

## Getting started

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd boron
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root (there is no committed `.env.example` since `.env*` is gitignored):

```bash
# Required — MySQL connection string for an existing, blank database
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"

# Required — secret used by NextAuth to sign/encrypt sessions and tokens
# Generate one with: npx auth secret
# (or: openssl rand -base64 32)
AUTH_SECRET="replace-with-generated-secret"

# Required when running a production build (`npm start` / Docker) anywhere
# other than Vercel — Auth.js otherwise rejects requests with an
# "UntrustedHost" error, since without one of these it won't trust the Host
# header on an incoming request. Not needed for `npm run dev`.
# Prefer AUTH_URL (a fixed canonical URL) — it sidesteps the Host-header
# trust question entirely. Only use AUTH_TRUST_HOST=true if you can't fix
# the URL in advance (e.g. multiple domains) AND a reverse proxy in front
# of the app already guarantees the Host header can't be spoofed by a client.
AUTH_URL="https://your-real-domain.example.com"

# Optional — enables "Sign in with Google" if set
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional — enables "Sign in with GitHub" if set
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Optional — enables AI chat features if set
OPENAI_API_KEY=

# Optional — plaintext passwords used when seeding the two demo accounts below.
# If left blank, the seeded accounts get an empty password.
USER_PASSWORD_USER=
USER_PASSWORD_ADMIN=
```

### 3. Build the database schema

With `DATABASE_URL` pointing at your blank database, apply the existing migration history:

```bash
npx prisma migrate deploy
```

This is all first-time setup needs, and it works with a scoped, least-privilege MySQL user (like the example in `.env`) that only has grants on its own database.

**Only if you're developing new schema changes** (i.e. editing `prisma/schema.prisma` and generating new migration files), use `npx prisma migrate dev` instead. Be aware this requires an *additional* privilege: `migrate dev` (and `migrate reset`) create a temporary "shadow database" to diff schema state, which needs `CREATE DATABASE` permission at the MySQL instance level. A scoped user like the `.env` example will fail with:

```
Error: P3014
Prisma Migrate could not create the shadow database...
```

If you hit that, either:

- Grant your local dev MySQL user broader privileges, e.g. `GRANT ALL PRIVILEGES ON *.* TO 'boron'@'%';` (fine for a local/dev-only database, don't do this for shared or production credentials), or
- Point Prisma at a separate shadow database your user already has access to, via a `shadowDatabaseUrl` in `prisma/schema.prisma` — not configured in this project by default.

### 4. Seed the database

```bash
npm run seed
```

This **wipes all existing data** and reseeds it, including sample projects, milestones and tasks, plus two demo accounts:

- `user@example.com` (role `USER`), password from `USER_PASSWORD_USER`
- `admin@example.com` (role `ADMIN`), password from `USER_PASSWORD_ADMIN`

### 5. Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Run in production

Build and start directly:

```bash
npm run build
npm start
```

Or with Docker:

```bash
docker build -t boron .
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME" \
  -e AUTH_SECRET="..." \
  -e AUTH_URL="https://your-real-domain.example.com" \
  boron
```

The Docker image does **not** run migrations on startup — apply `npx prisma migrate deploy` against the target database yourself before (or as part of) your deploy.

## Available scripts

| Script | Command | Description |
| --- | --- | --- |
| `npm run dev` | `next dev` | Start the development server with hot reload |
| `npm run build` | `next build` | Build the app for production |
| `npm start` | `next start` | Run the production build (run `build` first) |
| `npm run lint` | `next lint` | Lint the codebase |
| `npm run seed` | `tsx prisma/seed.ts` | Wipe and reseed the database with sample data and demo accounts |
| `npm run index` | `tsx scripts/backfill-search.ts` | Rebuild/backfill the search index |
| `npm run test:unit` | `vitest run` | Run unit and component tests once |
| `npm run test:unit:watch` | `vitest` | Run unit and component tests in watch mode |
| `npm run test:unit:coverage` | `vitest run --coverage` | Run unit/component tests with a coverage report |
| `npm run test:e2e` | `playwright test` | Run Playwright end-to-end tests against whatever's already at `http://localhost:3000` (or auto-starts one, see below) |
| `npm run test:e2e:seeded` | `npm run seed && npm run test:e2e` | Reseed the database, then run the e2e tests |
| `npm run test:coverage` | see `package.json` | Full pipeline: unit coverage, a production build, seeded e2e coverage, then merges both into one HTML report |
| `npm run test:coverage:merge` | `tsx scripts/merge-coverage.ts` | Merge already-generated unit + e2e coverage data into `coverage/merged/` (assumes both already ran) |

## Testing

### Unit and component tests

[Vitest](https://vitest.dev/) runs two separate test "projects" from a single `vitest.config.ts`: a `node` project for `services/`, `lib/`, `actions/`, `hooks/`, and `app/api/`, and a `components` project (jsdom + [React Testing Library](https://testing-library.com/react)) for React components. Component test coverage is intentionally partial right now — a handful of examples (`components/tasks/__tests__/`, `components/ui/__tests__/`, `hooks/__tests__/use-mobile.test.tsx`) establish the pattern rather than covering all components; that's a deliberate scoping choice, not an oversight.

```bash
npm run test:unit
```

### End-to-end tests

End-to-end tests use [Playwright](https://playwright.dev/) (migrated from Cypress — both Vitest and Playwright collect coverage in the same underlying v8 format, which is what makes the merged report below possible). Install browsers once after `npm install`:

```bash
npx playwright install
```

Then run the suite. `playwright.config.ts`'s `webServer` starts the app itself (`npm run dev` locally, or `npm start` in CI/when `COVERAGE=true`), so you don't need to start it manually first:

```bash
npm run test:e2e:seeded
```

Note this reseeds the database as a side effect, wiping any existing data.

Tests run against Chromium by default (`npm run test:e2e` = `playwright test --project=chromium`) — it's also the only browser that contributes to the coverage report below. Specs share one seeded database rather than isolated fixtures per test, so running multiple browser projects concurrently causes cross-browser data races; Firefox and WebKit are available for manual spot-checks one at a time, each against a freshly seeded database:

```bash
npm run seed && npx playwright test --project=firefox
npm run seed && npx playwright test --project=webkit
```

### Unified coverage report

`npm run test:coverage` produces a single HTML report covering **both** unit/component tests and e2e tests, at `coverage/merged/index.html`. Under the hood: Vitest uses a custom [`vitest-monocart-coverage`](https://github.com/cenfun/vitest-monocart-coverage) provider and Playwright collects coverage via Chromium's CDP API, both writing raw v8 coverage data that [`monocart-coverage-reports`](https://github.com/cenfun/monocart-coverage-reports) merges into one report (`scripts/merge-coverage.ts`).

A few things worth knowing:

- **e2e coverage is Chromium-only** — the CDP coverage API isn't available in Firefox/WebKit, so those browser runs contribute correctness testing but not coverage numbers.
- **Requires a production build with sourcemaps.** `next.config.ts` only emits browser sourcemaps when `COVERAGE=true` (so normal deploys don't ship them) — without a sourcemapped build, e2e coverage falls back to unreadable minified chunk names instead of real file paths. `npm run test:coverage` handles this for you.
- **A handful of rows named `dashboard` with no path** may appear in the report — these are Next.js's inline per-navigation hydration `<script>` payloads, not real source files; harmless but not worth chasing further.

## Continuous Integration

`.github/workflows/test.yml` runs on every push to `main` and every pull request: it spins up a MySQL service container, runs unit/component tests with coverage, seeds the database, builds the app, runs the Playwright e2e suite, merges both into the unified coverage report, and uploads it as a downloadable build artifact (`coverage-report`). On e2e failure it also uploads the Playwright HTML report (`playwright-report`) for debugging.

The workflow needs these repository secrets (Settings → Secrets and variables → Actions) — all optional, since the workflow falls back to safe dummy values for its throwaway CI database if they're unset:

- `AUTH_SECRET_CI` — a real generated secret (`npx auth secret`), separate from any production value.
- `CI_USER_PASSWORD` / `CI_ADMIN_PASSWORD` — passwords for the seeded demo accounts in CI's ephemeral database.

No coverage thresholds are enforced yet — the workflow reports coverage, it doesn't gate on it.

## Project health / audit report

This repo tracks a periodic quality and security self-audit under [`audit/`](audit/):

- [`audit/AUDIT.md`](audit/AUDIT.md) — the current snapshot: scores across security, tests, docs and code structure, plus prioritized findings. Regenerated fresh each run (gitignored, so it isn't committed).
- [`audit/AUDIT_HISTORY.md`](audit/AUDIT_HISTORY.md) — an append-only log of scores from every run, so progress over time stays visible.

Regenerate the audit with `npm run audit:report`.
