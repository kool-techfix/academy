# Brand

## Identity

- **Product name:** KoolTech Fix IT Academy
- **Wordmark rendering** (`src/components/academy-brand.tsx`): logo mark + stacked text — "KoolTech Fix" with a small-caps subline "IT Academy".
- **Logo asset:** `public/images/images.png` (36×36, rounded 7px, 1px border `#dedbd0`).
- **Document `<title>`** (`src/app/layout.tsx`): "Kool TechFix ITAcad"
- **Tagline** (`src/app/layout.tsx` metadata description): "Practical IT learning, built for the real world"

> Note: the brand name is rendered inconsistently across the codebase ("KoolTech Fix IT Academy" in the component, "Kool TechFix ITAcad" in the page `<title>`) — worth reconciling to one canonical spelling.

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

Defined as HSL custom properties on `:root` in `src/app/globals.css`, consumed by Tailwind v4 utilities and by the custom `.button`/`.card`/`.badge` classes.

### Design tokens (HSL)

| Token | HSL value | Approx. hex | Role |
|---|---|---|---|
| `--background` | `48 33% 97%` | `#faf9f5` | page background |
| `--foreground` | `60 4% 18%` | `#2e2e2c` | primary text |
| `--primary` | `65 72% 64%` | `#d8e85c` | brand accent — lime/chartreuse |
| `--primary-foreground` | `60 4% 18%` | `#2e2e2c` | text on primary |
| `--secondary` | `60 7% 92%` | `#eceae4` | secondary surfaces |
| `--accent` | `8 72% 79%` | `#f2a79e` | coral accent |
| `--destructive` | `4 68% 62%` | `#e05a4a`-ish | errors/danger |
| `--muted` | `45 18% 93%` | `#f0eee5` | muted surfaces |
| `--muted-foreground` | `40 5% 42%` | `#77766f` | secondary text |
| `--border` / `--card-border` | `45 12% 86%` | `#e5e2d9` | borders |
| `--input` | `45 12% 82%` | `#dfdcd2` | input borders |
| `--ring` | `65 50% 45%` | — | focus ring base |
| `--radius` | `0.65rem` | — | default corner radius |

### Literal hex colors in `globals.css`

These are hard-coded directly in component classes (not routed through the tokens above) — the de facto working palette:

| Hex | Swatch role | Where used |
|---|---|---|
| `#2e2e2c` | **Ink / near-black** — primary text, instructor-mode background | headings, body text, `.instructor-navbar`, `.avatar`, `.button-secondary` |
| `#d8e85c` | **Brand lime** (signature accent color) | `.button-primary`, instructor badge border/text, avatar text, focus outline (`rgba(216,232,92,…)`) |
| `#c9dc45` | Lime, hover state | `.button-primary:hover` |
| `#69751b` | Lime, darkest shade | deep accent variant |
| `#faf9f5` | **Cream / off-white** — page background | `html`, `body`, `.navbar` background (95% opacity) |
| `#fcfcf9` | Near-white | subtle surface |
| `#77766f`, `#696861`, `#85827a`, `#68675f`, `#66655e`, `#4d4c47`, `#8a887e`, `#929089` | Warm greys | secondary/muted text, nav link colors |
| `#e5e2d9`, `#dfdcd2`, `#dedbd0`, `#e8e5dc`, `#ece9e1` | Warm greige borders/dividers | `.card`, `.navbar` border, input borders |
| `#eeefcf` | Pale lime tint | active/hover nav background, badges |
| `#f0f0e6`, `#f0efea` | Off-white hover surfaces | button-ghost hover, muted badges |
| `#fae2de` / `#f2a79e` / `#9b5048` | **Coral** family | `.badge-coral` (bg / text), `--accent` token |
| `#45443f` | Dark warm grey | `.instructor-navbar` border |
| `#f7f8df` / `#f7f5ee` | Pale tints | badge-dark text, misc |
| `#fff` | Pure white | `.card` background, dropdowns |

### Palette summary

- **Primary brand color:** lime/chartreuse `#d8e85c` (HSL `65 72% 64%`) — used for primary CTAs, the instructor-mode avatar and badge accents, and focus rings.
- **Neutral base:** warm cream `#faf9f5` background with near-black `#2e2e2c` text/ink — a warm, paper-like neutral system rather than pure white/black.
- **Secondary accent:** coral `#f2a79e` / `#9b5048` — used sparingly for a distinct badge tone (`.badge-coral`).
- **Instructor mode** uses an inverted theme: dark ink (`#2e2e2c`) navbar with lime (`#d8e85c`) accents, versus the learner-facing light cream theme.
- No dark-mode theme is implemented (only a `.badge-dark` *component* variant exists — `next-themes` is installed but not wired into `layout.tsx`).

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
| `sonner` | Toast notifications |
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
| `jose` | JWT session signing/verification |
| `bcrypt` | Password hashing |
| `axios` | HTTP client for internal `/api` calls |
| `@tanstack/react-query` | Server-state/data fetching cache |
| `react-hook-form` + `@hookform/resolvers` + `zod` | Forms + schema validation |
| `date-fns` | Date utilities |
| `dotenv` | Env var loading (Prisma config) |
| `babel-plugin-react-compiler` | Powers `next.config.ts`'s `reactCompiler: true` |

## Package manager

- **pnpm** `10.14.0`, workspace defined in `pnpm-workspace.yaml`.
