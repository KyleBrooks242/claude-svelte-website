import { db } from '$lib/db';
import { projects } from '$lib/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db.select().from(projects).orderBy(desc(projects.createdAt));
	return {
		projects: rows.map((r) => ({
			...r,
			createdAt: r.createdAt.toISOString(),
			updatedAt: r.updatedAt.toISOString(),
		})),
	};
};
