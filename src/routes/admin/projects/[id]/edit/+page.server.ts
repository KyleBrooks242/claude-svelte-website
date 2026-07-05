import { db } from '$lib/db';
import { projects } from '$lib/schema';
import { eq } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [project] = await db.select().from(projects).where(eq(projects.id, params.id)).limit(1);
	if (!project) throw error(404, 'Project not found');

	return {
		project: {
			...project,
			createdAt: project.createdAt.toISOString(),
			updatedAt: project.updatedAt.toISOString(),
		},
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const data = await request.formData();
		const kind = ((data.get('kind') as string) ?? 'software') as 'software' | 'woodworking';
		const title = (data.get('title') as string)?.trim();
		const description = (data.get('description') as string)?.trim() ?? '';
		const tagsRaw = (data.get('tags') as string)?.trim() ?? '';
		const github = (data.get('github') as string)?.trim() || null;
		const demo = (data.get('demo') as string)?.trim() || null;
		const status = ((data.get('status') as string) ?? 'wip') as 'live' | 'wip' | 'archived' | 'complete';

		const errors: Record<string, string> = {};
		if (!title) errors.title = 'Title is required';
		if (Object.keys(errors).length) {
			return fail(422, { errors, kind, title, description, tagsRaw, github, demo, status });
		}

		const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [];

		await db
			.update(projects)
			.set({ kind, title, description, tags, github, demo, status, updatedAt: new Date() })
			.where(eq(projects.id, params.id));

		redirect(303, '/admin/projects');
	},

	delete: async ({ params }) => {
		await db.delete(projects).where(eq(projects.id, params.id));
		redirect(303, '/admin/projects');
	},
};
