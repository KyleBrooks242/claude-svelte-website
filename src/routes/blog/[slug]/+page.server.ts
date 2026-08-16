import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { postComments, posts } from '$lib/schema';
import { renderMarkdown } from '$lib/markdown';
import { readingTime } from '$lib/types';
import { eq, and, count, gt } from 'drizzle-orm';
import { isrConfig } from '$lib/cache';
import { TURNSTILE_SECRET_KEY } from '$env/static/private';
import type { Actions, PageServerLoad } from './$types';

const NAME_MAX = 50;
const COMMENT_MAX = 500;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

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

export const actions: Actions = {
	default: async ({ request, params, getClientAddress }) => {
		const data = await request.formData();
		const name = (data.get('name') as string ?? '').trim();
		const comment = (data.get('comment') as string ?? '').trim();
		const turnstileToken = (data.get('cf-turnstile-response') as string ?? '');

		// Honeypot: bots tend to fill every field, real users never see or fill this one.
		if ((data.get('company') as string ?? '') !== '') {
			return { success: true };
		}

		if (!name || !comment) {
			return fail(400, { message: 'Name and comment are required.', name, comment });
		}
		if (name.length > NAME_MAX || comment.length > COMMENT_MAX) {
			return fail(400, { message: 'One or more fields are too long.', name, comment });
		}

		const [post] = await db
			.select({ id: posts.id })
			.from(posts)
			.where(and(eq(posts.slug, params.slug), eq(posts.status, 'published')))
			.limit(1);

		if (!post) throw error(404, 'Post not found');

		const ip = getClientAddress();

		if (!turnstileToken) {
			return fail(400, { message: 'Please complete the verification challenge.', name, comment });
		}
		const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: turnstileToken, remoteip: ip }),
		});
		const verifyData = (await verifyRes.json()) as { success: boolean };
		if (!verifyData.success) {
			return fail(400, { message: 'Verification failed. Please try again.', name, comment });
		}

		const cutoff = new Date(Date.now() - RATE_WINDOW_MS);
		const [{ value: recentCount }] = await db
			.select({ value: count() })
			.from(postComments)
			.where(and(eq(postComments.ip, ip), gt(postComments.createdAt, cutoff)));

		if (recentCount >= RATE_LIMIT) {
			return fail(429, { message: 'Too many comments posted recently. Please try again later.', name, comment });
		}

		await db.insert(postComments).values({ postId: post.id, name, comment, ip });

		return { success: true };
	},
};
