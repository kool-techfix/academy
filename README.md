# Kool TechFix I.T Academy

A learning platform for practical IT courses. Learners enrol in courses, watch lessons, download lesson files, take module quizzes and a final assessment, track progress and earn certificates. Instructors build and publish courses once an admin approves them. Admins moderate instructors, courses and users.

Built with Next.js 16 (App Router, React 19), TypeScript, Prisma 7 on PostgreSQL, Better Auth, and Cloudflare R2.

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — layering, auth and access control, routing, data model, attachments
- **[BRAND.md](./BRAND.md)** — palette tokens, navbars, contrast rules, brand lockup
- **[AGENTS.md](./AGENTS.md)** — this repo runs a customised Next.js build; read the docs in `node_modules/next/dist/docs/` before changing Next.js code

## Prerequisites

- Node.js 22+
- pnpm 10 (`corepack enable` picks up the version pinned in `package.json`)
- PostgreSQL 15+
- A Cloudflare R2 bucket (lesson attachments)
- An SMTP server/account for email (password resets, instructor emails) — optional in development
- Optional: a Google OAuth client (Google sign-in)

## Getting started

```bash
pnpm install                 # also runs `prisma generate`
cp .env.example .env         # then fill in the values (see below)
pnpm prisma migrate deploy   # create/upgrade the database schema
pnpm dev                     # http://localhost:3000
```

### Password reset

`/login` → **Forgot password?** → `/forgot-password` emails a single-use link (valid 60 minutes) → `/reset-password` sets the new password and signs the user out everywhere. In development without SMTP, copy the link from the server console.

### Create an admin

There is no admin sign-up. Register a normal account, then promote it:

```bash
pnpm admin:promote someone@example.com
```

## Environment variables

All variables are server-only. `.env.example` documents each one.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection used by the app |
| `DIRECT_URL` | yes | Direct (non-pooled) connection used by Prisma migrations |
| `BETTER_AUTH_SECRET` | yes | Session signing secret, 32+ characters (`openssl rand -base64 32`). Required in production. |
| `BETTER_AUTH_URL` | yes | The app's base URL, e.g. `http://localhost:3000` — must match the URL you open the app on |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | for attachments | Cloudflare R2 bucket and API token (Object Read & Write, scoped to the bucket) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | for Google sign-in | Google OAuth web client |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` (`SMTP_SECURE` optional) | yes in production | SMTP server for password-reset and instructor emails (sent with nodemailer). In development, emails are logged to the console when `SMTP_HOST` is unset |
| `APP_URL` | optional | Public base URL used for the sign-in link in instructor emails |

## External setup

### Cloudflare R2 (lesson attachments)

Files upload directly from the browser to a **private** bucket using presigned URLs, so the bucket needs a CORS policy (R2 → bucket → Settings → CORS policy):

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

### Google sign-in

The Google buttons are currently **commented out** (search for `TODO(google-auth)` in `src/app/login/page.tsx` and `src/app/register/page.tsx`). To enable them:

1. In Google Cloud Console, create an OAuth client of type *Web application*.
2. Authorised JavaScript origins: `http://localhost:3000` and `https://your-production-domain.com`.
3. Authorised redirect URIs: `http://localhost:3000/api/auth/callback/google` and `https://your-production-domain.com/api/auth/callback/google`.
4. Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, then uncomment the `TODO(google-auth)` blocks.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | `prisma generate` + production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm admin:promote <email>` | Make an existing user an admin |
| `pnpm prisma migrate deploy` | Apply pending database migrations |

## Project layout

```
prisma/              schema.prisma + migrations
src/app/             pages and API route handlers (src/app/api/**)
src/proxy.ts         optimistic auth redirect (Next 16 "proxy", formerly middleware)
src/Services/        PascalCase = server business logic; kebab-case = browser API clients
src/Repositories/    data access — the only layer that talks to Prisma
src/Schemas/         Zod request schemas
src/lib/auth/        Better Auth config, guards, redirects
src/lib/storage/     R2 client and attachment rules
src/hooks/           React Query hooks (auth / instructor / learner)
src/components/      app components; ui/ holds the Radix-based primitives
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full picture.
