import { db } from '$lib/db';
import { projects } from '$lib/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db.select().from(projects).orderBy(projects.updatedAt);
	return {
		projects: rows.map((r) => ({
			...r,
			createdAt: r.createdAt.toISOString(),
			updatedAt: r.updatedAt.toISOString(),
		})),
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'Missing id' });
		await db.delete(projects).where(eq(projects.id, id));
		redirect(303, '/admin/projects');
	},
};
