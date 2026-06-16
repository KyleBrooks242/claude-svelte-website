import { db } from '$lib/db';
import { posts } from '$lib/schema';
import type { PostListItem } from '$lib/types';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db
		.select({
			id: posts.id,
			slug: posts.slug,
			title: posts.title,
			summary: posts.summary,
			tags: posts.tags,
			status: posts.status,
			publishedAt: posts.publishedAt,
			createdAt: posts.createdAt,
			updatedAt: posts.updatedAt,
		})
		.from(posts)
		.where(eq(posts.status, 'published'))
		.orderBy(desc(posts.publishedAt));

	const serialized: PostListItem[] = rows.map((r) => ({
		...r,
		publishedAt: r.publishedAt?.toISOString() ?? null,
		createdAt: r.createdAt.toISOString(),
		updatedAt: r.updatedAt.toISOString(),
	}));

	return { posts: serialized };
};
