import { db } from '$lib/db';
import { hevyWorkouts } from '$lib/schema';
import { fetchLatestHevyWorkout, upsertHevyWorkout } from '$lib/hevy';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	let [row] = await db
		.select()
		.from(hevyWorkouts)
		.orderBy(desc(hevyWorkouts.startTime))
		.limit(1);

	if (!row) {
		try {
			const latest = await fetchLatestHevyWorkout();
			if (latest) {
				await upsertHevyWorkout(latest);
				[row] = await db
					.select()
					.from(hevyWorkouts)
					.orderBy(desc(hevyWorkouts.startTime))
					.limit(1);
			}
		} catch (err) {
			console.error('[keep-me-honest] live backfill from Hevy failed:', err);
		}
	}

	if (!row) {
		return { workout: null };
	}

	return {
		workout: {
			id: row.id,
			title: row.title,
			description: row.description,
			startTime: row.startTime.toISOString(),
			endTime: row.endTime.toISOString(),
			exercises: row.exercises,
		},
	};
};
