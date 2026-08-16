import { error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { postComments, posts } from '$lib/schema';
import { renderMarkdown } from '$lib/markdown';
import { readingTime } from '$lib/types';
import { eq, and } from 'drizzle-orm';
import { isrConfig } from '$lib/cache';
import type { PageServerLoad } from './$types';

export const config = isrConfig;

export const load: PageServerLoad = async ({ params }) => {
	const [post] = await db
		.select()
		.from(posts)
		.where(and(eq(posts.slug, params.slug), eq(posts.status, 'published')))
		.limit(1);

	if (!post) throw error(404, 'Post not found');

	const comments = await db
		.select({
			name: postComments.name,
			comment: postComments.comment,
			createdAt: postComments.createdAt
		})
		.from(postComments)
		.where(eq(postComments.postId, post.id));

	return {
		post: {
			id: post.id,
			slug: post.slug,
			title: post.title,
			tags: post.tags,
			publishedAt: post.publishedAt?.toISOString() ?? null,
			readingTime: readingTime(post.content),
		},
		comments: comments.map((c) => ({
			name: c.name,
			comment: c.comment,
			createdAt: c.createdAt.toISOString()
		})),
		html: renderMarkdown(post.content),
	};
};
