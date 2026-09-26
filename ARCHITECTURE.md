# Architecture

KoolTech Fix IT Academy — a Next.js 16 (App Router) LMS for IT courses, with separate learner and instructor experiences, quizzes/final assessments, progress tracking, and certificate generation.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19, React Compiler enabled) |
| Language | TypeScript (strict) |
| Database | PostgreSQL |
| ORM | Prisma 7 (`prisma-client` generator, `@prisma/adapter-pg` driver adapter) |
| Auth | JWT sessions via `jose`, HTTP-only cookie (`academy_session`), `bcrypt` password hashing |
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
│   └── prisma/                  # Legacy/scratch prisma contract file (not the active schema)
├── public/                      # Static assets (brand mark, svgs)
└── node_modules/next/dist/docs/ # Vendored Next.js docs — read before writing Next.js code (see AGENTS.md)
```

## Layered backend architecture

Requests flow through a strict layering, enforced by convention:

```
Route Handler (src/app/api/**/route.ts)
        │  parses request, calls guard, delegates
        ▼
Auth Guard (src/lib/auth/auth-guard.ts)     — requireAuth / requireLearner / requireInstructor
        │
        ▼
Service (src/Services/*.service.ts)         — business rules, orchestration, DTO shaping
        │
        ▼
Repository (src/Repositories/*Repository.ts) — Prisma queries, the only Prisma import point
        │
        ▼
Prisma Client (src/generated/prisma)  ──►  PostgreSQL
```

- **Repositories** (`src/Repositories/`) wrap `prisma.<model>` calls (e.g. `CourseRepository`, `EnrollmentRepository`, `QuizRepository`). Nothing outside this folder should import `@/lib/prisma` directly.
- **Services** (`src/Services/`) contain business logic and call one or more repositories. Note there are two naming generations coexisting: PascalCase (`CourseService.ts`, `LearnerQuizService.ts`) and kebab-case (`course.service.ts`, `learner-quiz.service.ts`) — check which one a given route actually imports before extending it, as both exist side-by-side.
- **Schemas** (`src/Schemas/`) hold Zod schemas for request validation (`auth.schema.ts`, `course.schema.ts`, `enrollment.schema.ts`, `login.schema.ts`).
- **Auth** (`src/lib/auth/`): `session.ts` (JWT sign/verify via `jose`), `cookies.ts` (cookie read/write), `auth-guard.ts` (role-based guards: `requireAuth`, `requireLearner`, `requireInstructor` — the latter also checks `InstructorStatus.APPROVED`).

## Routing (`src/app`)

Two parallel surfaces sharing one Next.js app:

- **Learner surface**: `/`, `/login`, `/register`, `/catalog`, `/courses`, `/courses/[id]`, `/courses/[id]/lessons/[lessonId]`, `/courses/[id]/quiz`, `/courses/[id]/modules/[moduleId]/quiz`, `/courses/[id]/certificate`, `/dashboard`, `/settings`.
- **Instructor surface**: nested under `/instructor` with its own `layout.tsx` — `/instructor`, `/instructor/courses`, `/instructor/courses/new`, `/instructor/courses/[id]`, `/instructor/courses/[id]/edit`, `/instructor/courses/[id]/enrollees`, `/instructor/courses/[id]/enrollees/[learnerId]`, `/instructor/settings`.
- **API routes** live under `src/app/api/**/route.ts`, mirroring the same split:
  - `api/auth/*` — login, logout, me
  - `api/learner/*` — registration, courses, enrollments, lessons, dashboard, progress, module quizzes
  - `api/instructor/*` — registration, course CRUD, modules, lessons, quizzes/questions, publish/unpublish, final assessment, settings
  - `api/courses/*` — public course listing/detail
  - `api/settings/*` — shared account/profile/notification settings

## Domain model (Prisma, `prisma/schema.prisma`)

```
User ──< CourseAuthor >── Course ──< Module ──< Lesson >── Progress >── User
  │                          │           │
  │                          │           └──< Quiz (MODULE) ──< Question
  │                          └──< Quiz (FINAL, one per course)
  ├──< Enrollment >── Course
  └──< QuizAttempt >── Quiz
```

- `User.role`: `LEARNER | INSTRUCTOR`; instructors additionally carry `instructorStatus`: `PENDING | APPROVED | SUSPENDED` (gates access via `requireInstructor`).
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
lib/api/*Api.ts (authApi, instructorApi, learnerApi) — typed request builders
     │  uses
     ▼
lib/api/axios.ts (axios instance, baseURL "/api")  +  createApi.ts (factory helpers)
     │
     ▼
Next.js API route (src/app/api/**) → Service → Repository → Prisma
```

- `src/providers/query-provider.tsx` wraps the app in a `QueryClientProvider` (set up in `src/app/layout.tsx`).
- Hooks are grouped by audience: `hooks/auth/`, `hooks/instructor/`, `hooks/learner/`, plus top-level shared hooks (`use-toast.ts`, `use-mobile.tsx`, `use-public-courses.ts`, `use-settings.ts`).
- `src/lib/api/api-error.ts` centralizes API error shaping/handling for the Axios layer.

## UI composition

- `src/components/ui/*` — low-level, mostly-generic primitives built on Radix (button, dialog, dropdown-menu, sidebar, form, table, chart, …), following the shadcn/ui pattern (`class-variance-authority` + `tailwind-merge` + `clsx`).
- `src/components/*` — app-specific composites: `navbar.tsx`, `page-shell.tsx`, `auth-layout.tsx`, `academy-ui.tsx` (Button/Badge/ProgressBar wrappers around the custom CSS classes), `academy-brand.tsx` (logo/wordmark), `error-boundary.tsx`, `language-switch.tsx`, `Loader.tsx`.
- `src/components/instructor/*` — instructor-only composites: course card, module list, and modal-based editors (`lesson-form-modal.tsx`, `module-form-modal.tsx`, `quiz-form-modal.tsx`, `final-assessment-editor.tsx`).

## Styling model

Two systems coexist deliberately:

1. **Tailwind v4** (`@import "tailwindcss"` in `globals.css`) — used by the `ui/` primitives via utility classes and CVA variants.
2. **Custom CSS design system** (the bulk of `globals.css`, ~1,900 lines) — hand-written classes (`.navbar`, `.button-primary`, `.card`, `.badge-*`, `.instructor-navbar`, etc.) driving the marketing/learner/instructor chrome, built on CSS custom properties defined in `:root` (see BRAND.md for the palette).

## Build/config notes

- `next.config.ts` enables `reactCompiler: true` (Babel plugin `babel-plugin-react-compiler`).
- `eslint.config.mjs`/`.mts` — flat ESLint config (`eslint-config-next`, `typescript-eslint`).
- Path alias: `@/*` → `src/*` (see `tsconfig.json`).
- Prisma: schema at `prisma/schema.prisma`, config in `prisma7.config.ts` (uses `DIRECT_URL` env var), client generated into `src/generated/prisma` (checked into `src`, not hand-edited — regenerate via `prisma generate`).
- `src/prisma/contract.prisma` is a leftover/generic sample schema (unrelated `User`/`Post` models) — the **real** schema is `prisma/schema.prisma`; don't confuse the two.
- This repo runs a customized Next.js build (see `AGENTS.md`): consult `node_modules/next/dist/docs/` before assuming standard Next.js behavior.
