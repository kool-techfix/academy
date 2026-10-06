# Architecture

KoolTech Fix IT Academy — a Next.js 16 (App Router) LMS for IT courses, with separate learner and instructor experiences, quizzes/final assessments, progress tracking, and certificate generation.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19, React Compiler enabled) |
| Language | TypeScript (strict) |
| Database | PostgreSQL |
| ORM | Prisma 7 (`prisma-client` generator, `@prisma/adapter-pg` driver adapter) |
| Auth | [Better Auth](https://www.better-auth.com) (Prisma adapter): database sessions, email/password (bcrypt hashes) + Google OAuth |
| File storage | Cloudflare R2 (S3 API via `@aws-sdk/client-s3`), private bucket, presigned URLs |
| Data fetching | `@tanstack/react-query` (client) + Axios wrapper (`/api` base URL) |
| Styling | Tailwind CSS v4 + a bespoke `globals.css` design system (custom classes: `.button`, `.card`, `.navbar`, `.badge`, …) |
| UI primitives | Radix UI (accordion, dialog, dropdown, tabs, etc.) wrapped as `src/components/ui/*` (shadcn-style) |
| Forms/validation | `react-hook-form` + `zod` |
| Icons/misc | `lucide-react`, `react-icons`, `recharts`, `embla-carousel-react`, `sonner` (toasts) |
| Package manager | pnpm (workspace: `pnpm-workspace.yaml`) |

## High-level structure

```
academy/
├── prisma/                      # Prisma schema + migrations (source of truth for the DB)
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/                     # Next.js App Router: pages + API routes
│   ├── components/              # React components (feature + ui/ primitives)
│   ├── hooks/                   # React Query hooks, grouped by domain
│   ├── lib/                     # Cross-cutting utilities (auth, api client, types)
│   ├── Services/                # Business logic layer (PascalCase legacy + newer kebab-case files)
│   ├── Repositories/            # Data access layer — the only layer that talks to Prisma
│   ├── Schemas/                 # Zod validation schemas
│   ├── generated/prisma/        # Prisma Client output (generated, not hand-edited)
│   ├── providers/               # App-wide React context providers
│   └── proxy.ts                 # Next 16 proxy (formerly middleware): optimistic auth redirect
├── public/                      # Static assets (brand mark, svgs)
└── node_modules/next/dist/docs/ # Vendored Next.js docs — read before writing Next.js code (see AGENTS.md)
```

## Layered backend architecture

Requests flow through a strict layering, enforced by convention:

```
Route Handler (src/app/api/**/route.ts)
        │  parses request, calls guard, delegates
        ▼
Auth Guard (src/lib/auth/auth-guard.ts)     — requireAuth / requireLearner / requireInstructor / requireAdmin
        │
        ▼
Service (src/Services/<Name>Service.ts)     — business rules, orchestration, DTO shaping
        │
        ▼
Repository (src/Repositories/*Repository.ts) — Prisma queries, the only Prisma import point
        │
        ▼
Prisma Client (src/generated/prisma)  ──►  PostgreSQL
```

- **Repositories** (`src/Repositories/`) wrap `prisma.<model>` calls (e.g. `CourseRepository`, `EnrollmentRepository`, `LessonAttachmentRepository`). Nothing outside this folder should import `@/lib/prisma` directly. Known exceptions: `src/lib/auth/server.ts` (the Better Auth Prisma adapter needs the client) and `api/instructor/settings/route.ts` (legacy).
- **Services** (`src/Services/`) — two kinds of file live here side by side:
  - **PascalCase** (`LessonService.ts`, `LearnerQuizService.ts`, …) are the **server** business-logic services that route handlers import.
  - **kebab-case** (`lesson.service.ts`, `learner-lesson.service.ts`, …) are **browser** API clients (typed Axios calls + DTO types) used by the React Query hooks.

  Check which one a route or hook actually imports before extending it.
- **Schemas** (`src/Schemas/`) hold Zod schemas for request validation (`auth.schema.ts`, `course.schema.ts`, `enrollment.schema.ts`, `login.schema.ts`, `lesson-attachment.schema.ts`).
- **Errors** are thrown as `Error(message)` in services and mapped to HTTP statuses in the route handler; responses are `{ data }` on success and `{ message }` on failure.

## Authentication & access control

Better Auth owns every session (`src/lib/auth/`):

- `server.ts` — the `betterAuth()` instance: Prisma adapter, email/password (bcrypt hashes kept from the old system; public sign-up endpoint disabled — our register routes create accounts), Google provider, account linking, and `databaseHooks` that force every Google-created user to `LEARNER`. Role/status fields are `input: false`, so a client can never set them.
- `client.ts` — `authClient` + `signInWithGoogle(flow, errorPath)` for the browser.
- `auth-guard.ts` — `getSession()`, `getCurrentUser()` (fresh DB read; suspended/removed accounts count as signed out), `requireAuth/Learner/Instructor/Admin()` for route handlers, and `guardPage()` for server layouts.
- `redirects.ts` — `homePathFor(user)` (where each role lands) and friendly copy for Google `?error=` codes.
- `api/auth/[...all]/route.ts` — Better Auth endpoints, incl. the Google callback `/api/auth/callback/google`. The static `api/auth/{login,logout,me}` routes wrap them for the existing UI.

Passwords live on `Account` rows with `providerId: "credential"`; `User.passwordHash` is legacy and no longer written.

**Password reset** uses Better Auth's built-in flow: `/forgot-password` → `authClient.requestPasswordReset` (always answers the same way, so it never reveals whether an email has an account) → `sendResetPassword` emails a link → `GET /api/auth/reset-password/:token` checks the token and redirects to `/reset-password?token=…` (or `?error=INVALID_TOKEN`) → `authClient.resetPassword` sets the new bcrypt hash. Tokens are single-use, stored in `Verification`, and expire after 60 minutes; a reset revokes all of the user's sessions and emails a "password changed" notice. Emails are sent with `after()` so they never delay or break the response, and the request/reset endpoints have tighter rate limits.

**Email** goes through `src/lib/email/email-transport.ts` (`sendEmail()`, nodemailer over SMTP; logs instead of sending in development when SMTP isn't configured) with a shared branded layout in `src/lib/email/template.ts`. Senders: `PasswordResetEmailService`, `InstructorEmailService`.

**Route protection** is two-layered:

1. `src/proxy.ts` — optimistic check: no session cookie → redirect to `/login` (matcher: `/dashboard`, `/courses`, `/settings`, `/instructor`, `/instructor-application`, `/instructor-status`, `/admin`).
2. Server `layout.tsx` guards (`guardPage`) per section do the real check against the database and redirect users to their own home. API routes are independently protected by `require*()`.

**Roles and landing pages** (`homePathFor`):

| User | Lands on |
|---|---|
| `LEARNER` | `/dashboard` |
| `LEARNER` with `instructorApplicationStarted` (Google sign-up from the instructor form, expertise not yet submitted) | `/instructor-application` |
| `INSTRUCTOR` + `APPROVED` | `/instructor` |
| `INSTRUCTOR` + `PENDING` / `REJECTED` / `SUSPENDED` | `/instructor-status` |
| `ADMIN` | `/admin` |

Instructors are never created by Google sign-in: the account stays a learner until the expertise form (`api/instructor/auth/application`) turns it into `INSTRUCTOR` + `PENDING`, and only an admin approves it. Admins are never created through sign-up — promote an existing account with `pnpm admin:promote <email>`.

Google sign-in is wired up but its buttons are commented out (`TODO(google-auth)` in the login/register pages) until OAuth credentials are configured.

## Lesson attachments (Cloudflare R2)

Instructors attach PDF/DOC/DOCX/TXT files (max 25 MB, 20 per lesson) to lessons. File bytes never pass through Next.js:

1. The modal asks `POST api/instructor/courses/[id]/lessons/upload-url` for a presigned PUT URL. The server checks course authorship, type and size, and signs Content-Type + Content-Length into the URL. Keys look like `lessons/{courseId}/{uuid}-{sanitized-name}`.
2. The browser `PUT`s the file straight to R2 (plain XHR, not the Axios `/api` instance).
3. The lesson create/update request includes the attachment descriptors. The server only accepts keys under the course's prefix that aren't already used, and verifies with `HeadObject` that the object exists with the declared type and size before saving `LessonAttachment` rows.
4. Learners download via `GET api/learner/attachments/[attachmentId]/download` → 5-minute presigned GET URL. Allowed for approved instructors of the course and learners with an `ACTIVE`/`COMPLETED` enrollment; storage keys are never sent to the client.

Deleting an attachment or lesson removes the rows, then deletes the R2 objects best-effort. Shared rules live in `src/lib/storage/constants.ts` (used by client and server); the S3 client is `src/lib/storage/r2.ts` (server-only, lazily configured from `R2_*` env vars).

## Routing (`src/app`)

Two parallel surfaces sharing one Next.js app:

- **Public**: `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/catalog`, `/auth/continue` (post-Google-sign-in redirect by role).
- **Learner surface**: `/courses`, `/courses/[id]`, `/courses/[id]/lessons/[lessonId]`, `/courses/[id]/quiz`, `/courses/[id]/modules/[moduleId]/quiz`, `/courses/[id]/certificate`, `/dashboard`, `/settings`.
- **Instructor surface**: nested under `/instructor` (guarded by `instructor/layout.tsx`: approved instructors only) — `/instructor`, `/instructor/courses/new`, `/instructor/courses/[id]/edit`, `/instructor/courses/[id]/enrollees`, `/instructor/courses/[id]/enrollees/[learnerId]`, `/instructor/settings`. Plus `/instructor-application` (Google instructor sign-up, step 2) and `/instructor-status` (pending/rejected/suspended).
- **Admin surface**: `/admin`, `/admin/instructors`, `/admin/courses`, `/admin/users`.
- **API routes** live under `src/app/api/**/route.ts`, mirroring the same split:
  - `api/auth/*` — login, logout, me, plus the Better Auth catch-all `[...all]`
  - `api/learner/*` — registration, courses, enrollments, lessons, attachment downloads, dashboard, progress, module quizzes
  - `api/instructor/*` — registration, Google instructor application, course CRUD, modules, lessons + attachments, quizzes/questions, publish/unpublish, final assessment, settings
  - `api/admin/*` — instructor approval, course moderation, user management, dashboard
  - `api/courses/*` — public course listing/detail
  - `api/settings/*` — shared account/profile/notification settings

## Domain model (Prisma, `prisma/schema.prisma`)

```
User ──< CourseAuthor >── Course ──< Module ──< Lesson >── Progress >── User
  │                          │           │        └──< LessonAttachment (R2 object)
  │                          │           └──< Quiz (MODULE) ──< Question
  │                          └──< Quiz (FINAL, one per course)
  ├──< Enrollment >── Course
  ├──< QuizAttempt >── Quiz
  ├──< Session          (Better Auth)
  └──< Account          (Better Auth: "credential" password or "google")
Verification            (Better Auth, standalone)
```

- `User.role`: `LEARNER | INSTRUCTOR | ADMIN`; instructors additionally carry `instructorStatus`: `PENDING | APPROVED | REJECTED | SUSPENDED` (only `APPROVED` passes `requireInstructor`). `User.accountStatus`: `ACTIVE | SUSPENDED | REMOVED` (non-active users are treated as signed out).
- `User.certificateName` is the name printed on certificates (defaults to `name`, editable in Settings).
- `Course.status`: `DRAFT | PUBLISHED` (publish/unpublish API routes flip this).
- `Quiz.type`: `MODULE` (attached to a `Module`) or `FINAL` (attached to a `Course` directly, one-to-one).
- `Enrollment.status`: `ACTIVE | COMPLETED | CANCELLED`.
- IDs are `cuid()`; timestamps are native `DateTime`.

## Frontend data flow

```
Page/Component
     │  calls a hook
     ▼
hooks/**/use-*.ts (React Query: useQuery/useMutation)
     │  calls
     ▼
Services/*.service.ts (kebab-case browser API clients, e.g. lessonApi)
     │  uses
     ▼
lib/api/{instructorApi,learnerApi,authApi}.ts (createApi(prefix) wrappers)
     │  or directly
     ▼
lib/api/axios.ts (axios instance, baseURL "/api")
     │
     ▼
Next.js API route (src/app/api/**) → Service → Repository → Prisma
```

- `src/providers/query-provider.tsx` wraps the app in a `QueryClientProvider` (set up in `src/app/layout.tsx`).
- Hooks are grouped by audience: `hooks/auth/`, `hooks/instructor/`, `hooks/learner/`, plus top-level shared hooks (`use-toast.ts`, `use-mobile.tsx`, `use-public-courses.ts`, `use-settings.ts`).
- `src/lib/api/api-error.ts` centralizes API error shaping/handling for the Axios layer (`getApiErrorMessage`).
- Toasts: `sonner`'s `<Toaster>` (via `components/ui/sonner.tsx`) is mounted in `src/app/layout.tsx`; call `toast.error(...)` from `sonner`.

## UI composition

- `src/components/ui/*` — low-level, mostly-generic primitives built on Radix (button, dialog, dropdown-menu, sidebar, form, table, chart, …), following the shadcn/ui pattern (`class-variance-authority` + `tailwind-merge` + `clsx`).
- `src/components/*` — app-specific composites: `navbar.tsx` (one navbar, `learner` / `instructor` variants), `page-shell.tsx`, `auth-layout.tsx`, `academy-ui.tsx` (Button/Badge/ProgressBar wrappers around the custom CSS classes), `academy-brand.tsx` (badge + wordmark + motto), `google-button.tsx`, `error-boundary.tsx`, `language-switch.tsx`, `Loader.tsx`.
- `src/components/instructor/*` — instructor-only composites: course card, module list, and modal-based editors (`lesson-form-modal.tsx`, `module-form-modal.tsx`, `quiz-form-modal.tsx`, `final-assessment-editor.tsx`).

## Styling model

Two systems coexist deliberately:

1. **Tailwind v4** (`@import "tailwindcss"` in `globals.css`) — used by the `ui/` primitives via utility classes and CVA variants.
2. **Custom CSS design system** (the bulk of `globals.css`) — hand-written classes (`.navbar`, `.navbar-instructor`, `.button-primary`, `.card`, `.badge-*`, `.attachment-*`, etc.) driving the marketing/learner/instructor chrome, built on the `--brand-*` CSS custom properties defined in `:root` (see BRAND.md for the palette). The brand tokens are also exposed to Tailwind via `@theme inline` (`bg-brand-green`, `text-brand-red`, …). Never hard-code hex values in components.

## Build/config notes

- `next.config.ts` enables `reactCompiler: true` (Babel plugin `babel-plugin-react-compiler`).
- `eslint.config.mjs`/`.mts` — flat ESLint config (`eslint-config-next`, `typescript-eslint`).
- Path alias: `@/*` → `src/*` (see `tsconfig.json`).
- Prisma: schema at `prisma/schema.prisma`, config in `prisma.config.ts` (migrations use the `DIRECT_URL` env var), client generated into `src/generated/prisma` (not hand-edited — regenerate via `prisma generate`; `pnpm build` and `postinstall` also run it). Apply migrations with `pnpm prisma migrate deploy`.
- `next.config.ts` allows remote images from `res.cloudinary.com/dcvyjmflf/**` (brand badge).
- Environment variables are documented in `.env.example` (database, Better Auth, Google OAuth, SMTP email, R2). All are server-only.
- This repo runs a customized Next.js build (see `AGENTS.md`): consult `node_modules/next/dist/docs/` before assuming standard Next.js behavior.
