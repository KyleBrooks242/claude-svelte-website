import { db } from '$lib/db';
import { projectImages, projects } from '$lib/schema';
import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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
