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
| `npm run test:unit` | `vitest run` | Run unit tests once |
| `npm run test:unit:watch` | `vitest` | Run unit tests in watch mode |
| `npm run test:unit:coverage` | `vitest run --coverage` | Run unit tests with a coverage report |
| `npm run test:e2e` | `npm run seed && npx cypress run` | Reseed the database, then run Cypress end-to-end tests |

## Testing

Unit tests use [Vitest](https://vitest.dev/):

```bash
npm run test:unit
```

End-to-end tests use [Cypress](https://www.cypress.io/) and expect the app to be reachable at `http://localhost:3000` (start it with `npm run dev` or `npm start` in another terminal first):

```bash
npm run test:e2e
```

Note this reseeds the database as a side effect, wiping any existing data.

## Project health / audit report

This repo tracks a periodic quality and security self-audit under [`audit/`](audit/):

- [`audit/AUDIT.md`](audit/AUDIT.md) — the current snapshot: scores across security, tests, docs and code structure, plus prioritized findings. Regenerated fresh each run (gitignored, so it isn't committed).
- [`audit/AUDIT_HISTORY.md`](audit/AUDIT_HISTORY.md) — an append-only log of scores from every run, so progress over time stays visible.

Regenerate the audit with `npm run audit:report`.
