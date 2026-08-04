import { db } from '$lib/db';
import { projectImages, projects } from '$lib/schema';
import { renderMarkdown } from '$lib/markdown';
import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { isrConfig } from '$lib/cache';
import type { PageServerLoad } from './$types';

export const config = isrConfig;

export const load: PageServerLoad = async ({ params }) => {
	const [[project], images] = await Promise.all([
		db.select().from(projects).where(eq(projects.id, params.id)).limit(1),
		db
			.select()
			.from(projectImages)
			.where(eq(projectImages.projectId, params.id))
			.orderBy(asc(projectImages.position)),
	]);
	if (!project) throw error(404, 'Project not found');

	return {
		project: {
			...project,
			createdAt: project.createdAt.toISOString(),
			updatedAt: project.updatedAt.toISOString(),
		},
		descriptionHtml: renderMarkdown(project.description),
		images,
	};
};
