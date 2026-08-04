import { error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { posts } from '$lib/schema';
import { renderMarkdown } from '$lib/markdown';
import { readingTime } from '$lib/types';
import { eq, and } from 'drizzle-orm';
import { ISR_BYPASS_TOKEN } from '$env/static/private';
import type { Config } from '@sveltejs/adapter-vercel';
import type { PageServerLoad } from './$types';

export const config: Config = {
	isr: { expiration: 3600, bypassToken: ISR_BYPASS_TOKEN },
};

export const load: PageServerLoad = async ({ params }) => {
	const [post] = await db
		.select()
		.from(posts)
		.where(and(eq(posts.slug, params.slug), eq(posts.status, 'published')))
		.limit(1);

	if (!post) throw error(404, 'Post not found');

	return {
		post: {
			id: post.id,
			slug: post.slug,
			title: post.title,
			tags: post.tags,
			publishedAt: post.publishedAt?.toISOString() ?? null,
			readingTime: readingTime(post.content),
		},
		html: renderMarkdown(post.content),
	};
};
