import { HEVY_API_KEY } from '$env/static/private';
import { db } from './db';
import { hevyWorkouts } from './schema';
import type { HevyWorkout } from './types';

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
