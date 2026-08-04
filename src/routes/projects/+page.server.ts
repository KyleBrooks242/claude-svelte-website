import { db } from '$lib/db';
import { projectImages, projects } from '$lib/schema';
import { desc, eq } from 'drizzle-orm';
import { isrConfig } from '$lib/cache';
import type { PageServerLoad } from './$types';

export const config = isrConfig;

export const load: PageServerLoad = async () => {
	const [rows, covers] = await Promise.all([
		db.select().from(projects).orderBy(desc(projects.createdAt)),
		db
			.select({ projectId: projectImages.projectId, url: projectImages.url })
			.from(projectImages)
			.where(eq(projectImages.position, 0)),
	]);

	const coverMap = new Map(covers.map((c) => [c.projectId, c.url]));

	return {
		projects: rows.map((r) => ({
			...r,
			coverImage: coverMap.get(r.id) ?? null,
			createdAt: r.createdAt.toISOString(),
			updatedAt: r.updatedAt.toISOString(),
		})),
	};
};
