import { HEVY_API_KEY } from '$env/static/private';
import { db } from './db';
import { asc, eq, sql } from 'drizzle-orm';
import { exercisePrs, hevyWorkouts, workoutStats } from './schema';
import type { HevyExercise, HevyExerciseHistoryEntry, HevyWorkout } from './types';

const HEVY_API_BASE = 'https://api.hevyapp.com/v1';

async function hevyFetch<T>(path: string): Promise<T> {
	const res = await fetch(`${HEVY_API_BASE}${path}`, {
		headers: { 'api-key': HEVY_API_KEY },
	});
	if (!res.ok) {
		throw new Error(`Hevy API ${path} failed: ${res.status} ${await res.text()}`);
	}
	return res.json() as Promise<T>;
}

export async function fetchHevyWorkout(workoutId: string): Promise<HevyWorkout> {
	return hevyFetch<HevyWorkout>(`/workouts/${workoutId}`);
}

export async function fetchLatestHevyWorkout(): Promise<HevyWorkout | null> {
	const res = await hevyFetch<{ page: number; page_count: number; workouts: HevyWorkout[] }>(
		'/workouts?page=1&pageSize=1',
	);
	if (res.workouts.length === 0) return null;
	return res.workouts[0]
}

export async function upsertHevyWorkout(workout: HevyWorkout): Promise<void> {
	const row = {
		id: workout.id,
		title: workout.title,
		description: workout.description ?? '',
		startTime: new Date(workout.start_time),
		endTime: new Date(workout.end_time),
		exercises: workout.exercises ?? [],
		syncedAt: new Date(),
	};

	await db
		.insert(hevyWorkouts)
		.values(row)
		.onConflictDoUpdate({ target: hevyWorkouts.id, set: row });
}

const EXERCISE_HISTORY_START_DATE = '2025-01-01T00:00:00.000Z';

export async function fetchExerciseHistory(templateId: string): Promise<HevyExerciseHistoryEntry[]> {
	const params = new URLSearchParams({
		start_date: EXERCISE_HISTORY_START_DATE,
		end_date: new Date().toISOString(),
	});
	const res = await hevyFetch<{ exercise_history: HevyExerciseHistoryEntry[] }>(
		`/exercise_history/${templateId}?${params}`,
	);
	return res.exercise_history;
}

export async function fetchAllHevyWorkouts(): Promise<HevyWorkout[]> {
	const workouts: HevyWorkout[] = [];
	let page = 1;
	let pageCount = 1;

	do {
		const res = await hevyFetch<{ page: number; page_count: number; workouts: HevyWorkout[] }>(
			`/workouts?page=${page}&pageSize=10`,
		);
		workouts.push(...res.workouts);
		pageCount = res.page_count;
		page += 1;
	} while (page <= pageCount);

	return workouts;
}

function exerciseVolume(exercise: HevyExercise): number {
	return exercise.sets.reduce((sum, set) => sum + (set.weight_kg ?? 0) * (set.reps ?? 0), 0);
}

function workoutVolume(workout: HevyWorkout): number {
	return workout.exercises.reduce((sum, exercise) => sum + exerciseVolume(exercise), 0);
}

export async function upsertExercisePr(name: string, templateId: string): Promise<void> {
	const history = await fetchExerciseHistory(templateId);

	let best: HevyExerciseHistoryEntry | null = null;
	let totalWeightLifted = 0;

	for (const entry of history) {
		const weight = entry.weight_kg ?? 0;
		const reps = entry.reps ?? 0;
		totalWeightLifted += weight * reps;
		if (entry.set_type != 'failure' && (!best || weight > (best.weight_kg ?? 0))) {
			best = entry;
		}
	}

	const personalRecord = best?.weight_kg ?? 0;
	const numberOfReps = best?.reps ?? 0;

	await db
		.insert(exercisePrs)
		.values({
			exerciseName: name,
			exerciseTemplateId: templateId,
			personalRecord,
			numberOfReps,
			totalWeightLifted,
			updatedAt: new Date(),
		})
		.onConflictDoUpdate({
			target: exercisePrs.exerciseTemplateId,
			set: { exerciseName: name, personalRecord, numberOfReps, totalWeightLifted, updatedAt: new Date() },
		});
}

export async function seedTotalWeightLifted(): Promise<number> {
	const workouts = await fetchAllHevyWorkouts();
	const total = workouts.reduce((sum, workout) => sum + workoutVolume(workout), 0);

	await db
		.insert(workoutStats)
		.values({ name: 'total_weight_lifted', value: total, updatedAt: new Date() })
		.onConflictDoUpdate({
			target: workoutStats.name,
			set: { value: total, updatedAt: new Date() },
		});

	return total;
}

export const SKIP_COUNT_STAT_NAME = 'skip_count';

const BUCKET_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
// How many trailing weekly buckets to use when estimating the user's normal
// weekly workout count.
const BASELINE_WEEKS = 6;
// Minimum number of trailing buckets needed before a week is judged against
// a baseline at all (avoids penalizing the first few weeks of history).
const MIN_BASELINE_WEEKS = 3;

function median(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Derives a skip count from workout start times by counting workouts into
 * rolling BUCKET_DAYS-wide buckets (anchored to the first workout) and
 * comparing each bucket's count against the median of the trailing
 * BASELINE_WEEKS buckets. Comparing weekly *counts* rather than individual
 * gap lengths avoids false positives from a recurring rest day (e.g. a
 * 5x/week schedule's weekly rest is just part of a normal week's count, not
 * an outlier gap to reason about in isolation), stays accurate when a
 * workout shifts a day within its week, and adapts automatically if the
 * user's routine moves from 3x/week to 5x/week or vice versa.
 */
export function computeSkipCount(startTimes: Date[]): number {
	if (startTimes.length === 0) return 0;

	const sorted = [...startTimes].sort((a, b) => a.getTime() - b.getTime());
	const first = sorted[0].getTime();
	const lastBucket = Math.floor((sorted[sorted.length - 1].getTime() - first) / (BUCKET_DAYS * MS_PER_DAY));

	const counts: number[] = new Array(lastBucket + 1).fill(0);
	for (const startTime of sorted) {
		counts[Math.floor((startTime.getTime() - first) / (BUCKET_DAYS * MS_PER_DAY))]++;
	}

	let skipCount = 0;
	for (let i = 0; i <= lastBucket; i++) {
		const baseline = counts.slice(Math.max(0, i - BASELINE_WEEKS), i);
		if (baseline.length < MIN_BASELINE_WEEKS) continue;

		const expected = Math.round(median(baseline));
		skipCount += Math.max(0, expected - counts[i]);
	}

	return skipCount;
}

/**
 * Recomputes skip_count from the local hevy_workouts table (no external API
 * calls) and stores the result. Cheap enough to run on every webhook hit.
 * Relies on hevy_workouts already having full history — see
 * backfillHevyWorkoutHistory for seeding that.
 */
export async function recomputeSkipCountFromDb(): Promise<number> {
	const rows = await db.select({ startTime: hevyWorkouts.startTime }).from(hevyWorkouts).orderBy(asc(hevyWorkouts.startTime));

	const value = computeSkipCount(rows.map((r) => r.startTime));

	await db
		.insert(workoutStats)
		.values({ name: SKIP_COUNT_STAT_NAME, value, updatedAt: new Date() })
		.onConflictDoUpdate({
			target: workoutStats.name,
			set: { value, updatedAt: new Date() },
		});

	return value;
}

/**
 * Fully syncs hevy_workouts from the Hevy API. Expensive (paginated external
 * requests) — for manual/admin use only, never on the webhook hot path.
 */
export async function backfillHevyWorkoutHistory(): Promise<void> {
	const workouts = await fetchAllHevyWorkouts();
	for (const workout of workouts) {
		await upsertHevyWorkout(workout);
	}
}

export async function updateExercisePrsFromWorkout(workout: HevyWorkout): Promise<void> {
	for (const exercise of workout.exercises) {
		const [existing] = await db
			.select()
			.from(exercisePrs)
			.where(eq(exercisePrs.exerciseTemplateId, exercise.exercise_template_id))
			.limit(1);

		if (!existing) continue;

		const volume = exerciseVolume(exercise);
		const maxWeight = exercise.sets.reduce((max, set) => Math.max(max, set.weight_kg ?? 0), 0);
		const isNewRecord = maxWeight > existing.personalRecord;

		if (isNewRecord) {
			const maxWeightSet = exercise.sets.find((set) => (set.weight_kg ?? 0) === maxWeight)

			await db
			.update(exercisePrs)
			.set({
				totalWeightLifted: existing.totalWeightLifted + volume,
				personalRecord: isNewRecord ? maxWeight : existing.personalRecord,
				numberOfReps: isNewRecord ? (maxWeightSet?.reps ?? 0) : existing.numberOfReps,
				updatedAt: new Date(),
			})
			.where(eq(exercisePrs.exerciseTemplateId, exercise.exercise_template_id));
		}
	}
}

export async function incrementTotalWeightLifted(workout: HevyWorkout): Promise<void> {
	const volume = workoutVolume(workout);

	await db
		.insert(workoutStats)
		.values({ name: 'total_weight_lifted', value: volume, updatedAt: new Date() })
		.onConflictDoUpdate({
			target: workoutStats.name,
			set: {
				value: sql`${workoutStats.value} + ${volume}`,
				updatedAt: new Date(),
			},
		});
}
