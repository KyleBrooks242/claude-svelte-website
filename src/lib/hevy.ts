import { HEVY_API_KEY } from '$env/static/private';
import { db } from './db';
import { eq, sql } from 'drizzle-orm';
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
		.values({ id: 'singleton', totalWeightLifted: total, updatedAt: new Date() })
		.onConflictDoUpdate({
			target: workoutStats.id,
			set: { totalWeightLifted: total, updatedAt: new Date() },
		});

	return total;
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
		const maxWeightSet = isNewRecord
			? exercise.sets.find((set) => (set.weight_kg ?? 0) === maxWeight)
			: undefined;

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

export async function incrementTotalWeightLifted(workout: HevyWorkout): Promise<void> {
	const volume = workoutVolume(workout);

	await db
		.insert(workoutStats)
		.values({ id: 'singleton', totalWeightLifted: volume, updatedAt: new Date() })
		.onConflictDoUpdate({
			target: workoutStats.id,
			set: {
				totalWeightLifted: sql`${workoutStats.totalWeightLifted} + ${volume}`,
				updatedAt: new Date(),
			},
		});
}
