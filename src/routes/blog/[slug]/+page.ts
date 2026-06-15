import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

interface Post {
	slug: string;
	title: string;
	date: string;
	tags: string[];
	readingTime: string;
	content: string;
}

const posts: Post[] = [
	{
		slug: 'why-svelte',
		title: 'Why I switched to Svelte for personal projects',
		date: '2026-05-20',
		tags: ['Svelte', 'Frontend'],
		readingTime: '4 min',
		content: `
## The React fatigue

After years of writing React, I started to notice the same patterns creeping into every project: a bundled runtime, virtual DOM diffing, and the ever-growing mental overhead of hooks and context. For small personal projects these costs don't pay for themselves.

## What Svelte does differently

Svelte shifts the work to compile time. There's no virtual DOM — the compiler generates surgical DOM update instructions. The result is smaller bundles and often faster updates.

The component syntax is also remarkably close to plain HTML, CSS, and JS. There's a low conceptual overhead that I find refreshing for side projects where I want to move fast.

## SvelteKit sealed the deal

SvelteKit's file-based routing, server-side rendering, and excellent TypeScript support made it a natural fit for this site. The \`+page.ts\` / \`+layout.svelte\` conventions are intuitive once you internalize the mental model.

Would I use it for a large team project? Maybe — but React's ecosystem breadth still has advantages there. For personal projects, Svelte is my default now.
		`,
	},
	{
		slug: 'rust-cli-tools',
		title: 'Building fast CLI tools in Rust',
		date: '2026-04-10',
		tags: ['Rust', 'CLI', 'DevOps'],
		readingTime: '7 min',
		content: `
## Why Rust for CLIs?

Startup time matters for developer tools. A CLI that takes 200ms to start is annoying; one that takes 5ms disappears into the workflow. Rust compiles to a single static binary with no runtime, making it ideal for distribution and speed.

## The crate ecosystem

A few crates I reach for on almost every project:

- **clap** — argument parsing with derive macros; reduces boilerplate dramatically
- **anyhow** / **thiserror** — ergonomic error handling
- **indicatif** — progress bars that don't look terrible
- **serde** + **serde_json** / **toml** — serialization for config files

## Pattern: command enum

Structuring subcommands as an enum with \`#[derive(Subcommand)]\` keeps the dispatch logic clean and lets clap generate help text automatically.

## Distributing binaries

I use GitHub Actions to cross-compile for Linux (x86_64 + ARM64) and macOS (x86_64 + Apple Silicon) and attach the artifacts to releases. Users install with a single \`curl | sh\` script.
		`,
	},
	{
		slug: 'postgres-performance',
		title: 'PostgreSQL performance tips I keep forgetting',
		date: '2026-02-28',
		tags: ['PostgreSQL', 'Performance'],
		readingTime: '5 min',
		content: `
## EXPLAIN (ANALYZE, BUFFERS)

Always use the full form. \`EXPLAIN ANALYZE\` alone misses buffer-hit statistics that reveal whether you're hitting disk or cache. The \`BUFFERS\` option adds those numbers.

## Index strategies

Partial indexes are underused. If a column has a low-cardinality flag (e.g., \`status = 'pending'\`), a partial index on just the interesting subset is dramatically smaller and faster.

Multi-column index column order matters: put the equality-filtered column first, range-filtered second.

## autovacuum tuning

The default autovacuum thresholds (\`autovacuum_vacuum_scale_factor = 0.2\`) work fine for small tables but are too conservative for high-write tables. Lower the threshold and increase \`autovacuum_vacuum_cost_delay\` to keep bloat in check without stalling writes.

## connection pooling

PostgreSQL's per-connection memory cost is real. For applications with many short-lived connections, PgBouncer in transaction-mode pooling can cut idle memory usage significantly.
		`,
	},
];

export const load: PageLoad = ({ params }) => {
	const post = posts.find((p) => p.slug === params.slug);
	if (!post) throw error(404, 'Post not found');
	return { post };
};
