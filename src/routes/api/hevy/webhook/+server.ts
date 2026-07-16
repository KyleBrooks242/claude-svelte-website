import { json } from '@sveltejs/kit';
import { HEVY_WEBHOOK_SECRET } from '$env/static/private';
import {
	fetchHevyWorkout,
	incrementTotalWeightLifted,
	updateExercisePrsFromWorkout,
	upsertHevyWorkout,
} from '$lib/hevy';
import type { HevyWorkout } from '$lib/types';
import type { RequestHandler } from './$types';

function extractWorkoutId(body: unknown): string | null {
	if (typeof body !== 'object' || body === null) return null;
	const b = body as Record<string, unknown>;

	const payload = b.payload;
	if (typeof payload === 'object' && payload !== null) {
		const id = (payload as Record<string, unknown>).workoutId;
		if (typeof id === 'string') return id;
	}
	if (typeof b.workoutId === 'string') return b.workoutId;
	if (typeof b.workout_id === 'string') return b.workout_id;
	if (typeof b.id === 'string') return b.id;

	return null;
}

export const POST: RequestHandler = async ({ request }) => {
	const auth = request.headers.get('authorization') ?? '';
	if (auth !== `Bearer ${HEVY_WEBHOOK_SECRET}`) {
		return json({ ok: false, error: 'invalid token' }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'invalid json body' }, { status: 400 });
	}

	// Hevy's public API has no webhook-management endpoints, so this payload
	// shape is unverified. Log it raw so the real shape can be confirmed/fixed
	// from production traffic after the first live webhook fires.
	console.log('[hevy webhook] raw body:', JSON.stringify(body));

	const workoutId = extractWorkoutId(body);
	if (!workoutId) {
		console.error('[hevy webhook] could not find a workoutId in body:', JSON.stringify(body));
		return json({ ok: false, error: 'no workoutId in payload' }, { status: 400 });
	}

	let workout: HevyWorkout;
	try {
		workout = await fetchHevyWorkout(workoutId);
		await upsertHevyWorkout(workout);
	} catch (err) {
		console.error('[hevy webhook] failed to sync workout', workoutId, err);
		return json({ ok: false, error: 'sync failed' }, { status: 500 });
	}

	try {
		await updateExercisePrsFromWorkout(workout);
		await incrementTotalWeightLifted(workout);
	} catch (err) {
		console.error('[hevy webhook] stats update failed for workout', workoutId, err);
	}

	return json({ ok: true });
};
