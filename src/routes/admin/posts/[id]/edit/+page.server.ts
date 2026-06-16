import { db } from '$lib/db';
import { posts } from '$lib/schema';
import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [post] = await db.select().from(posts).where(eq(posts.id, params.id)).limit(1);
	if (!post) throw error(404, 'Post not found');

	return {
		post: {
			...post,
			publishedAt: post.publishedAt?.toISOString() ?? null,
			createdAt: post.createdAt.toISOString(),
			updatedAt: post.updatedAt.toISOString(),
		},
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const data = await request.formData();
		const title = (data.get('title') as string)?.trim();
		const slug = (data.get('slug') as string)?.trim();
		const summary = (data.get('summary') as string)?.trim() ?? '';
		const content = (data.get('content') as string)?.trim() ?? '';
		const tagsRaw = (data.get('tags') as string)?.trim() ?? '';
		const status = (data.get('status') as 'draft' | 'published') ?? 'draft';

		const errors: Record<string, string> = {};
		if (!title) errors.title = 'Title is required';
		if (!slug) errors.slug = 'Slug is required';
		if (Object.keys(errors).length) return fail(422, { errors, title, slug, summary, content, tagsRaw, status });

		const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [];

		const [existing] = await db.select({ status: posts.status, publishedAt: posts.publishedAt })
			.from(posts).where(eq(posts.id, params.id)).limit(1);

		const publishedAt = status === 'published'
			? (existing?.status === 'published' ? existing.publishedAt : new Date())
			: null;

		try {
			await db.update(posts).set({ title, slug, summary, content, tags, status, publishedAt, updatedAt: new Date() })
				.where(eq(posts.id, params.id));
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			if (msg.includes('unique') || msg.includes('duplicate')) {
				return fail(422, { errors: { slug: 'A post with this slug already exists' }, title, slug, summary, content, tagsRaw, status });
			}
			throw e;
		}

		redirect(303, '/admin');
	},

	delete: async ({ params }) => {
		await db.delete(posts).where(eq(posts.id, params.id));
		redirect(303, '/admin');
	},
};
