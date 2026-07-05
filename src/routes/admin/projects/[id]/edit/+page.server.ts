import { db } from '$lib/db';
import { projectImages, projects } from '$lib/schema';
import { asc, eq, max } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [project] = await db.select().from(projects).where(eq(projects.id, params.id)).limit(1);
	if (!project) throw error(404, 'Project not found');

	const images = await db
		.select()
		.from(projectImages)
		.where(eq(projectImages.projectId, params.id))
		.orderBy(asc(projectImages.position));

	return {
		project: {
			...project,
			createdAt: project.createdAt.toISOString(),
			updatedAt: project.updatedAt.toISOString(),
		},
		images,
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

	addImage: async ({ request, params }) => {
		const data = await request.formData();
		const url = (data.get('url') as string)?.trim();
		if (!url) return fail(422, { imageError: 'URL is required' });

		const [{ maxPos }] = await db
			.select({ maxPos: max(projectImages.position) })
			.from(projectImages)
			.where(eq(projectImages.projectId, params.id));

		await db.insert(projectImages).values({
			projectId: params.id,
			url,
			position: (maxPos ?? -1) + 1,
		});
	},

	removeImage: async ({ request, params }) => {
		const data = await request.formData();
		const imageId = data.get('imageId') as string;
		if (!imageId) return fail(400, { imageError: 'Missing image id' });

		await db
			.delete(projectImages)
			.where(eq(projectImages.id, imageId) && eq(projectImages.projectId, params.id));
	},

	delete: async ({ params }) => {
		await db.delete(projects).where(eq(projects.id, params.id));
		redirect(303, '/admin/projects');
	},
};
