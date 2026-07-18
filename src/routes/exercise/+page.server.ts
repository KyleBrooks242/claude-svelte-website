import { db } from '$lib/db';
import { exercisePrs, hevyWorkouts, workoutStats } from '$lib/schema';
import { fetchLatestHevyWorkout, upsertHevyWorkout } from '$lib/hevy';
import { desc, eq } from 'drizzle-orm';
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
			console.error('[exercise] live backfill from Hevy failed:', err);
		}
	}

	const [prRows, [weightStats], [skipStats]] = await Promise.all([
		db.select().from(exercisePrs).orderBy(exercisePrs.exerciseName),
		db.select().from(workoutStats).where(eq(workoutStats.name, 'total_weight_lifted')).limit(1),
		db.select().from(workoutStats).where(eq(workoutStats.name, 'skip_count')).limit(1),
	]);

	const totalWeightLifted = weightStats?.value ?? 0;
	const skippedCount = skipStats?.value ?? 0;

	if (!row) {
		return { workout: null, skippedCount, totalWeightLifted, exercisePrs: prRows };
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
		skippedCount,
		totalWeightLifted,
		exercisePrs: prRows,
	};
};
