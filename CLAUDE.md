# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (http://localhost:5173)
npm run build      # production build
npm run preview    # preview production build
npm run check      # type-check with svelte-check (no separate lint step)
```

There are no tests. `npm run check` is the closest equivalent to CI validation.

## Architecture

SvelteKit project running Svelte 5 in **runes mode** (enforced globally via `vite.config.ts` — `$state`, `$derived`, `$effect`, `$props` are available everywhere; the Options API is not used).

### Routing

File-based routing under `src/routes/`:

| Route | File(s) |
|---|---|
| `/` | `+page.svelte` |
| `/projects` | `projects/+page.svelte` |
| `/blog` | `blog/+page.svelte` |
| `/blog/[slug]` | `blog/[slug]/+page.ts` (data load) + `blog/[slug]/+page.svelte` |
| `/contact` | `contact/+page.svelte` |

`+layout.svelte` wraps all pages with the nav, footer, theme toggle, and global CSS import.

### Styling

All styles live in `src/app.css` — there is no CSS framework. Design tokens are CSS custom properties on `:root` (light) and `[data-theme="dark"]`. Components use inline styles or scoped `<style>` blocks that reference those variables. Don't introduce a CSS framework without discussion.

Key tokens: `--bg`, `--bg-secondary`, `--text`, `--text-muted`, `--accent`, `--border`, `--card-bg`. Utility classes defined in `app.css`: `.container`, `.page`, `.card`, `.btn`, `.btn-outline`, `.badge`, `.form-group`, `.section-tag`, `.prose`.

### Theme

Dark/light mode is driven by a `data-theme` attribute on `<html>`. It's set synchronously by a blocking inline script in `app.html`'s `<head>` (reads `localStorage`, falls back to `prefers-color-scheme`) so it's applied before first paint, avoiding a flash of the wrong theme. `+layout.svelte` mirrors that attribute into a `$state` variable on mount purely to drive the toggle button's icon.

### Content

Blog posts and projects are currently hardcoded as TypeScript arrays — there is no CMS or markdown pipeline. Blog posts live in `src/routes/blog/[slug]/+page.ts`. The blog post renderer is a simple regex-based markdown-to-HTML function in `+page.svelte`; it handles headings, bold, and inline code only.

### Path alias

`$lib` resolves to `src/lib/`. Currently only contains `src/lib/assets/favicon.svg` and an empty `src/lib/index.ts`.
