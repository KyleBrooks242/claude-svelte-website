import { db } from '$lib/db';
import { posts } from '$lib/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
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

		try {
			await db.insert(posts).values({
				title,
				slug,
				summary,
				content,
				tags,
				status,
				publishedAt: status === 'published' ? new Date() : null,
			});
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			if (msg.includes('unique') || msg.includes('duplicate')) {
				return fail(422, { errors: { slug: 'A post with this slug already exists' }, title, slug, summary, content, tagsRaw, status });
			}
			throw e;
		}

		redirect(303, '/admin');
	},
};
