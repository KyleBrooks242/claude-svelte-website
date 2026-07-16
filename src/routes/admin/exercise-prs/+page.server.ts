import { db } from '$lib/db';
import { exercisePrs, workoutStats } from '$lib/schema';
import { seedTotalWeightLifted, upsertExercisePr } from '$lib/hevy';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [rows, [stats]] = await Promise.all([
		db.select().from(exercisePrs).orderBy(exercisePrs.exerciseName),
		db.select().from(workoutStats).where(eq(workoutStats.id, 'singleton')).limit(1),
	]);

	return {
		exercisePrs: rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString() })),
		totalWeightLifted: stats?.totalWeightLifted ?? 0,
	};
};

export const actions: Actions = {
	addExercise: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const templateId = data.get('templateId') as string;
		if (!name || !templateId) return fail(400, { message: 'Missing name or template id' });

		try {
			await upsertExercisePr(name, templateId);
		} catch (err) {
			console.error('[admin exercise-prs] failed to add exercise', templateId, err);
			return fail(500, { message: 'Failed to fetch/compute PR from Hevy' });
		}

		redirect(303, '/admin/exercise-prs');
	},

	recalcTotal: async () => {
		try {
			await seedTotalWeightLifted();
		} catch (err) {
			console.error('[admin exercise-prs] failed to recalculate total weight lifted', err);
			return fail(500, { message: 'Failed to recalculate total weight lifted' });
		}

		redirect(303, '/admin/exercise-prs');
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'Missing id' });
		await db.delete(exercisePrs).where(eq(exercisePrs.id, id));
		redirect(303, '/admin/exercise-prs');
	},
};
