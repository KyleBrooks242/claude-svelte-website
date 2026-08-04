# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # start dev server (http://localhost:5173)
npm run build          # production build
npm run preview        # preview production build
npm run check          # type-check with svelte-check (no separate lint step)
npx drizzle-kit push   # push schema.ts changes directly to the DB (no migration files are checked in)
```

There are no tests. `npm run check` is the closest equivalent to CI validation.

## Architecture

SvelteKit project running Svelte 5 in **runes mode** (enforced globally via `vite.config.ts` — `$state`, `$derived`, `$effect`, `$props` are available everywhere; the Options API is not used). Deployed via `@sveltejs/adapter-vercel`.

This is no longer a purely static site: blog posts, projects, and contact messages are backed by a Postgres (Neon) database via Drizzle ORM, edited through a Basic-Auth-gated `/admin` CMS, and there's a fitness-tracking feature backed by the Hevy workout API.

### Routing

File-based routing under `src/routes/`:

| Route | Purpose |
|---|---|
| `/` | Home (`+page.svelte`) |
| `/projects`, `/projects/[id]` | Project list/detail, loaded from the `projects` table |
| `/blog`, `/blog/[slug]` | Blog list/detail, loaded from the `posts` table (only `status: 'published'` is public) |
| `/contact` | Contact form → `messages` table, Turnstile + honeypot + per-IP rate limiting |
| `/exercise` | Public workout/PR dashboard sourced from Hevy data cached in the DB |
| `/experience` | Static page |
| `/admin` | CMS: dashboard, post/project CRUD, exercise PR management, contact message inbox |
| `/api/hevy/webhook` | Bearer-token-authenticated webhook that ingests a single Hevy workout on completion |

`+layout.svelte` wraps all pages with the nav, footer, theme toggle, and global CSS import.

### Auth

`src/hooks.server.ts` gates every `/admin/*` request with HTTP Basic Auth: the password is checked against `ADMIN_PASSWORD_HASH` (bcrypt) and the result is stashed on `event.locals.isAdmin`. `src/routes/admin/+layout.server.ts` re-checks `locals.isAdmin` and throws a 403 if false — routes under `/admin` should not assume the hooks check alone is sufficient and should keep that pattern for new admin routes.

### Database

- Schema lives entirely in `src/lib/schema.ts` (Drizzle, `pg-core`); `src/lib/db.ts` creates the shared `db` client via `@neondatabase/serverless` + `drizzle-orm/neon-http`, reading `DATABASE_URL`.
- No migration files are checked in — schema changes are applied with `npx drizzle-kit push` (config in `drizzle.config.ts`) against whatever `DATABASE_URL` currently points to. Be deliberate about which database that is before pushing.
- Tables: `posts`, `projects`, `project_images`, `messages`, `hevy_workouts` (raw synced workouts, `exercises` stored as jsonb), `exercise_prs` (tracked PR per exercise template), `workout_stats` (generic key/value stats, e.g. `total_weight_lifted`, `skip_count`).

### Caching (ISR)

The public, DB-backed, read-heavy pages — `/blog`, `/blog/[slug]`, `/projects`, `/projects/[id]` — opt into Vercel ISR via `export const config = isrConfig` in their `+page.server.ts`, where `isrConfig` (`src/lib/cache.ts`) is a shared `{ isr: { expiration: 24h, bypassToken: ISR_BYPASS_TOKEN } }` config. This exists because the DB runs on low compute (Neon); serving cached responses avoids hitting it on every navigation. The 24h expiration is a staleness ceiling, not the primary freshness mechanism — content edited in `/admin` shows up immediately via the admin "Clear cache" button, which calls `revalidateCachedPages` (also in `src/lib/cache.ts`) to hit every published post/project URL with `x-prerender-revalidate: <token>`, forcing Vercel to regenerate them on demand. `ISR_BYPASS_TOKEN` must be the same value in `.env.local` and in Vercel's project env vars, or the bypass requests will silently fail to match.

### Hevy integration (`src/lib/hevy.ts`)

- Wraps the Hevy REST API (`HEVY_API_KEY`) for fetching single workouts, the latest workout, paginated full history, and per-exercise history.
- The webhook path (`/api/hevy/webhook`, guarded by `HEVY_WEBHOOK_SECRET`) is the hot path on every completed workout: it upserts the one workout, updates `exercise_prs` incrementally, increments `total_weight_lifted`, and recomputes `skip_count` from data already in the DB (no extra Hevy API calls).
- `backfillHevyWorkoutHistory` / `seedTotalWeightLifted` do full history syncs against the Hevy API and are expensive — only wire these to admin actions, never the webhook.
- `computeSkipCount` buckets workout start times into rolling weekly windows and compares each week's count against the median of recent weeks, rather than reasoning about individual gap lengths — see the docstring in `hevy.ts` if changing this, the bucketing approach is deliberate (avoids false positives from a recurring rest day and adapts to routine changes).
- Hevy's public API has no webhook-management endpoints, so the webhook payload shape was unverified at write time; `+server.ts` logs the raw body and tries several field names (`payload.workoutId`, `workoutId`, `workout_id`, `id`) to extract the workout id.

### Styling

All styles live in `src/app.css` — there is no CSS framework. Design tokens are CSS custom properties on `:root` (light) and `[data-theme="dark"]`. Components use inline styles or scoped `<style>` blocks that reference those variables. Don't introduce a CSS framework without discussion.

Key tokens: `--bg`, `--bg-secondary`, `--text`, `--text-muted`, `--accent`, `--border`, `--card-bg`. Utility classes defined in `app.css`: `.container`, `.page`, `.card`, `.btn`, `.btn-outline`, `.badge`, `.form-group`, `.section-tag`, `.prose`.

### Theme

Dark/light mode is driven by a `data-theme` attribute on `<html>`. It's set synchronously by a blocking inline script in `app.html`'s `<head>` (reads `localStorage`, falls back to `prefers-color-scheme`) so it's applied before first paint, avoiding a flash of the wrong theme. `+layout.svelte` mirrors that attribute into a `$state` variable on mount purely to drive the toggle button's icon.

### Content

Blog posts and projects are stored in the database (see above) and edited via `/admin`. Blog markdown is rendered with `marked` (`src/lib/markdown.ts`, GFM enabled, no line breaks on single newlines).

### Path alias

`$lib` resolves to `src/lib/`. Contains `db.ts`, `schema.ts`, `types.ts` (shared/Hevy types + `readingTime`), `hevy.ts`, `markdown.ts`, admin form components (`PostForm.svelte`, `ProjectForm.svelte`, `ImageCaptionForm.svelte`, `ImageWithSkeleton.svelte`), and `src/lib/assets/favicon.svg`.

### Environment variables

`DATABASE_URL`, `ADMIN_PASSWORD_HASH`, `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `HEVY_API_KEY`, `HEVY_WEBHOOK_SECRET`, `ISR_BYPASS_TOKEN` — all read via SvelteKit's `$env/static/private` (or `$env/static/public` for the Turnstile site key), set in `.env.local` locally.
