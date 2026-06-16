import { db } from '$lib/db';
import { posts } from '$lib/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db
		.select({
			id: posts.id,
			slug: posts.slug,
			title: posts.title,
			status: posts.status,
			publishedAt: posts.publishedAt,
			updatedAt: posts.updatedAt,
		})
		.from(posts)
		.orderBy(posts.updatedAt);

	return {
		posts: rows.map((r) => ({
			...r,
			publishedAt: r.publishedAt?.toISOString() ?? null,
			updatedAt: r.updatedAt.toISOString(),
		})),
	};
};

export const actions: Actions = {
	publish: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'Missing id' });

		await db
			.update(posts)
			.set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
			.where(eq(posts.id, id));

		return { success: true };
	},

	unpublish: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'Missing id' });

		await db
			.update(posts)
			.set({ status: 'draft', publishedAt: null, updatedAt: new Date() })
			.where(eq(posts.id, id));

		return { success: true };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'Missing id' });

		await db.delete(posts).where(eq(posts.id, id));
		redirect(303, '/admin');
	},
};
