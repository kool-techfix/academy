# Brand

## Identity

- **Product name:** Kool TechFix I.T Academy
- **Brand lockup** (`src/components/academy-brand.tsx`, `Brand()`): badge image + two-tone wordmark + motto.
  - Wordmark: "Kool" (black) "Tech" (green) "Fix" (black) "I.T" (red) "Academy" (black).
  - Motto: **LEARN · APPLY · INNOVATE** in red, uppercase, wide letter-spacing, with a thin green rule on each side. Hidden in the navbar below 900px; the wordmark stacks onto two lines at phone width.
- **Badge image:** `Kool_TechFix_IT_Academy_Badge_Only.png`, currently served from Cloudinary (`BADGE_SRC` in `academy-brand.tsx`; allowed in `next.config.ts`). To serve it locally, add it to `/public` and point `BADGE_SRC` at `/Kool_TechFix_IT_Academy_Badge_Only.png`.
- **On dark surfaces** (the auth panel) the lockup sits on a white plate so the black/green letters stay legible.
- **Document `<title>`** (`src/app/layout.tsx`): "Kool TechFix ITAcad"
- **Tagline** (`src/app/layout.tsx` metadata description): "Practical IT learning, built for the real world"

> Canonical spelling: **Kool TechFix I.T Academy** (used in the brand lockup and the auth/landing footers). Older copy still says "KoolTech" in places — instructor emails (`ACADEMY_NAME` in `InstructorEmailService.ts`), the loading-screen alt text, the page `<title>`, and short in-copy mentions like "New to KoolTech?" — worth reconciling.

## Typography

Loaded via Google Fonts in `src/app/globals.css`:

| Role | Font | CSS variable | Usage |
|---|---|---|---|
| Body / UI text | **DM Sans** (400, 500, 600, 700) | `--app-font-sans` | default `body` font, buttons, nav |
| Display / Headings | **Outfit** (500, 600, 700, 800) | `--app-font-display` | `h1`–`h4`, `.brand` wordmark |
| Monospace | DM Sans (fallback, no dedicated mono face) | `--app-font-mono` | — |

`src/app/layout.tsx` also loads `Geist` / `Geist_Mono` (Next.js default font vars `--font-geist-sans` / `--font-geist-mono`) — these appear to be leftover from the `create-next-app` template and are not the fonts actually used by `globals.css`.

Heading style: tight letter-spacing (`-0.02em` to `-0.04em`), large clamped sizes (`h1: clamp(34px, 5vw, 56px)`).

## Color palette

Five brand colours, defined **once** as CSS custom properties on `:root` in `src/app/globals.css`. Components use the tokens, never raw hex. The tokens are also exposed to Tailwind via `@theme inline` (`bg-brand-green`, `text-brand-red`, `border-brand-gray`, …).

### Brand tokens

| Token | Hex | Role |
|---|---|---|
| `--brand-black` | `#060807` | Body text and headings; dark panels (welcome card, auth panel, video frame) |
| `--brand-green` | `#085D1B` | **Primary** — primary buttons, active states, progress, links, focus rings |
| `--brand-red` | `#C6070C` | Accent and destructive/attention — errors, instructor navbar accent, motto, "I.T" |
| `--brand-white` | `#FEFEFE` | Page and card surfaces; text on green/red/black |
| `--brand-gray` | `#DCDFDA` | Borders, dividers, muted backgrounds; secondary text on dark panels |

### Derived tokens (mixed from the brand tokens with `color-mix`)

| Token | Recipe | Use |
|---|---|---|
| `--brand-green-hover` / `--brand-red-hover` | 82% colour + black | Button hover |
| `--brand-green-tint` | 9% green on white (≈ `#E8F0EA`) | Active nav items, success panels, stat card |
| `--brand-red-tint` | 8% red on white (≈ `#FAEAEB`) | Error panels, coral-style accents, streak card |
| `--brand-green-soft` / `--brand-red-soft` | 35% colour on white | Soft borders (card hover, error borders) |
| `--brand-gray-light` | 45% gray on white | Subtle surfaces, ghost-button hover, dropzones |
| `--brand-text-muted` | 68% black on white (≈ `#555756`) | Secondary text (~6.9:1 on white) |
| `--nav-learner` | = green tint | Learner navbar background |
| `--nav-instructor` | = red tint | Instructor/admin navbar background |

The legacy shadcn HSL channels (`--primary`, `--accent`, `--destructive`, …) are kept in sync with this palette for the `ui/*` primitives.

### Navbars

One `Navbar` component with two variants (chosen from the user's role, or forced via the `variant` prop):

| Variant | Background | Bottom border, active link, buttons, avatar |
|---|---|---|
| `learner` | `--nav-learner` (green tint) | green |
| `instructor` (also used for admins) | `--nav-instructor` (red tint) | red |

The navbar is sticky (`top: 0`, `z-index: 40`) with a solid background; text stays black.

### Contrast rules (WCAG AA)

- Text on green, red or black is always `--brand-white` (white on green ≈ 8:1, on red ≈ 6:1).
- Never put green or red text on black (≈ 2.5:1 / 3.3:1) — use `--brand-white` or `--brand-gray` on dark panels.
- Green and red text on their own tints pass (≈ 7:1 and ≈ 5.2:1).
- Secondary text uses `--brand-text-muted`, not lighter grays.

### Design direction

Clean and light: white surfaces, solid colours only (**no gradients**), no unnecessary animation, icons used sparingly. Exception: the Google sign-in button uses Google's official four-colour "G" logo, as Google's branding rules require.

No dark-mode theme is implemented (the toaster is pinned to `theme="light"`).

## Iconography & imagery

- **Icon set:** `lucide-react` (primary), with `react-icons` available as a secondary set.
- **Charts:** `recharts`, wrapped by `src/components/ui/chart.tsx`.
- **Illustration/misc SVGs:** `public/*.svg` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) — these are unmodified `create-next-app` template assets, not custom brand illustrations.

## UI component system (design-system packages)

| Package | Purpose |
|---|---|
| `@radix-ui/react-*` (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, hover-card, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, toggle, toggle-group, tooltip, aspect-ratio, collapsible, context-menu, label, slot) | Unstyled accessible primitives underlying `src/components/ui/*` (shadcn/ui pattern) |
| `class-variance-authority` (CVA) | Variant-driven component styling (`button.tsx`, `badge.tsx`, etc.) |
| `clsx` + `tailwind-merge` | Conditional/merged className composition (`src/lib/utils.ts` `cn()` helper) |
| `tailwindcss` v4 + `@tailwindcss/postcss` + `tw-animate-css` | Utility CSS + animation utilities |
| `@tailwindcss/typography` | Prose styling for long-form content |
| `cmdk` | Command palette (`ui/command.tsx`) |
| `vaul` | Drawer component (`ui/drawer.tsx`) |
| `sonner` | Toast notifications (`<Toaster>` mounted in `src/app/layout.tsx`) |
| `embla-carousel-react` | Carousel (`ui/carousel.tsx`) |
| `react-day-picker` | Calendar (`ui/calendar.tsx`) |
| `input-otp` | OTP input (`ui/input-otp.tsx`) |
| `react-resizable-panels` | Resizable layout panels (`ui/resizable.tsx`) |
| `next-themes` | Theme switching capability (installed, not currently activated) |
| `lucide-react`, `react-icons` | Icon sets |

## Application/runtime packages (non-UI)

| Package | Purpose |
|---|---|
| `next` 16.3.4, `react` / `react-dom` 19.2.8 | Framework/runtime |
| `@prisma/client` / `prisma` / `@prisma/adapter-pg` | ORM + PostgreSQL driver adapter |
| `pg` | Postgres driver |
| `better-auth` | Sessions, email/password and Google OAuth (Prisma adapter) |
| `bcrypt` | Password hashing (used by Better Auth's custom hash/verify) |
| `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` | Cloudflare R2 storage and presigned URLs for lesson attachments |
| `axios` | HTTP client for internal `/api` calls |
| `nodemailer` | Transactional email over SMTP (password resets, instructor emails) |
| `@tanstack/react-query` | Server-state/data fetching cache |
| `react-hook-form` + `@hookform/resolvers` + `zod` | Forms + schema validation |
| `date-fns` | Date utilities |
| `dotenv` | Env var loading (Prisma config) |
| `babel-plugin-react-compiler` | Powers `next.config.ts`'s `reactCompiler: true` |

## Package manager

- **pnpm** `10.14.0`, workspace defined in `pnpm-workspace.yaml`.
