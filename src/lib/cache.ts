import { ISR_BYPASS_TOKEN } from '$env/static/private';
import { db } from './db';
import { posts, projects } from './schema';
import { eq } from 'drizzle-orm';
import type { Config } from '@sveltejs/adapter-vercel';

/**
 * Shared ISR config for public, DB-backed, read-heavy routes (blog list/post,
 * projects list/detail). `expiration` is a ceiling, not the primary freshness
 * mechanism — the admin "Clear cache" button (revalidateCachedPages, below)
 * is what makes edits show up promptly; expiration just bounds staleness if
 * that's ever skipped.
 */
export const isrConfig: Config = {
	isr: { expiration: 60 * 60 * 24, bypassToken: ISR_BYPASS_TOKEN },
};

/**
 * Forces Vercel to regenerate the ISR cache for every public DB-backed page,
 * via the x-prerender-revalidate mechanism (see isr.bypassToken in each
 * route's `config` export). Used by the admin "Clear cache" button so
 * content edits show up immediately instead of waiting for isr.expiration.
 */
export async function revalidateCachedPages(
	origin: string,
	fetchFn: typeof fetch,
): Promise<{ path: string; ok: boolean }[]> {
	const [publishedPosts, allProjects] = await Promise.all([
		db.select({ slug: posts.slug }).from(posts).where(eq(posts.status, 'published')),
		db.select({ id: projects.id }).from(projects),
	]);

	const paths = [
		'/blog',
		'/projects',
		...publishedPosts.map((p) => `/blog/${p.slug}`),
		...allProjects.map((p) => `/projects/${p.id}`),
	];

	return Promise.all(
		paths.map(async (path) => {
			try {
				const res = await fetchFn(`${origin}${path}`, {
					headers: { 'x-prerender-revalidate': ISR_BYPASS_TOKEN },
				});
				return { path, ok: res.ok };
			} catch {
				return { path, ok: false };
			}
		}),
	);
}
