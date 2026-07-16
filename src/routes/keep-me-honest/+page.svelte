<script lang="ts">
	import type { PageData } from './$types';
	import type { HevyExercise } from '$lib/types';

	let { data }: { data: PageData } = $props();
	const workout = $derived(data.workout);
	const skippedCount = $derived(data.skippedCount);
	const longestStreak = $derived(data.longestStreak);

	let now = $state(Date.now());

	$effect(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 1000);
		return () => clearInterval(interval);
	});

	const elapsedMs = $derived(workout ? now - new Date(workout.endTime).getTime() : 0);
	const elapsed = $derived(workout ? formatElapsed(elapsedMs) : '');

	const HOUR = 60 * 60 * 1000;
	const statusColor = $derived.by(() => {
		if (!workout) return '#9ca3af';
		if (elapsedMs < 24 * HOUR) return '#22c55e';
		if (elapsedMs < 72 * HOUR) return '#f59e0b';
		return '#ef4444';
	});
	const statusLabel = $derived.by(() => {
		if (!workout) return '';
		if (elapsedMs < 24 * HOUR) return 'On track';
		if (elapsedMs < 72 * HOUR) return 'Cutting it close';
		return 'Slacking';
	});

	function formatElapsed(ms: number): string {
		if (ms < 0) return '0m';
		const totalMinutes = Math.floor(ms / 60000);
		const days = Math.floor(totalMinutes / (60 * 24));
		const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
		const minutes = totalMinutes % 60;
		const parts: string[] = [];
		if (days) parts.push(`${days}d`);
		if (days || hours) parts.push(`${hours}h`);
		parts.push(`${minutes}m`);
		return parts.join(' ');
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	function formatDuration(startIso: string, endIso: string) {
		const mins = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000);
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		return h ? `${h}h ${m}m` : `${m}m`;
	}

	function exerciseVolume(exercise: HevyExercise): number {
		return exercise.sets.reduce((sum, set) => sum + (set.weight_kg ?? 0) * (set.reps ?? 0), 0);
	}

	const KG_TO_LB = 2.20462;

	function formatWeight(kg: number): string {
		return `${Math.round(kg * KG_TO_LB).toLocaleString()} lbs`;
	}

	const totalVolume = $derived(
		workout ? workout.exercises.reduce((sum, exercise) => sum + exerciseVolume(exercise), 0) : 0,
	);

	const maxExerciseVolume = $derived(
		workout ? Math.max(0, ...workout.exercises.map((exercise) => exerciseVolume(exercise))) : 0,
	);
</script>

<svelte:head><title>Keep me honest · Kyle Brooks</title></svelte:head>

<main class="page">
	<div class="container">
		<a href="/" style="font-size:0.85rem;color:var(--text-muted);display:inline-flex;align-items:center;gap:0.3rem;margin-bottom:2rem;">
			← Back home
		</a>

		{#if workout}
			<section style="display:flex;justify-content:center;gap:3rem;flex-wrap:wrap;text-align:center;margin:2rem 0 3rem;">
				<div>
					<p class="section-tag">Time since last workout</p>
					<p style="font-size:clamp(1.75rem, 5vw, 2.75rem);font-weight:700;color:{statusColor};">{elapsed}</p>
					<span
						class="badge"
						style="color:{statusColor};border-color:{statusColor}33;background:{statusColor}11;"
					>{statusLabel}</span>
				</div>
				<div>
					<p class="section-tag">Workouts skipped</p>
					<p style="font-size:clamp(1.75rem, 5vw, 2.75rem);font-weight:700;">{skippedCount}</p>
				</div>
				<div>
					<p class="section-tag">Longest streak</p>
					<p style="font-size:clamp(1.75rem, 5vw, 2.75rem);font-weight:700;">{longestStreak}</p>
				</div>
			</section>

			<section class="workout-card">
				<div class="workout-card-header">
					<div>
						<p class="workout-card-eyebrow">{formatDate(workout.startTime)}</p>
						<h2 class="workout-card-title">{workout.title}</h2>
					</div>
					<span class="badge workout-duration-badge">{formatDuration(workout.startTime, workout.endTime)}</span>
				</div>

				{#if workout.description}
					<p class="workout-description">{workout.description}</p>
				{/if}

				<div class="exercise-list">
					{#each workout.exercises as exercise (exercise.index)}
						{@const volume = exerciseVolume(exercise)}
						<div class="exercise-row">
							<span class="exercise-name">{exercise.title}</span>
							<div class="exercise-bar-track">
								<div
									class="exercise-bar-fill"
									style="width:{maxExerciseVolume ? (volume / maxExerciseVolume) * 100 : 0}%;"
								></div>
							</div>
							<span class="exercise-volume">{formatWeight(volume)}</span>
						</div>
					{/each}
				</div>

				<div class="total-weight-block">
					<span class="total-weight-label">Total weight lifted</span>
					<span class="total-weight-value">{formatWeight(totalVolume)}</span>
				</div>
			</section>
		{:else}
			<div class="card" style="text-align:center;padding:3rem 1.5rem;">
				<p style="color:var(--text-muted);">No workout data yet — check back soon.</p>
			</div>
		{/if}
	</div>
</main>

<style>
	.workout-card {
		position: relative;
		overflow: hidden;
		background: var(--card-bg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1.75rem;
	}

	.workout-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, var(--accent), var(--accent-hover));
	}

	.workout-card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.workout-card-eyebrow {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		margin-bottom: 0.25rem;
	}

	.workout-card-title {
		font-size: 1.5rem;
		font-weight: 700;
	}

	.workout-duration-badge {
		flex-shrink: 0;
		font-weight: 600;
		color: var(--accent);
		border-color: color-mix(in srgb, var(--accent) 35%, transparent);
		background: color-mix(in srgb, var(--accent) 12%, transparent);
	}

	.workout-description {
		border-left: 3px solid var(--accent);
		padding-left: 1rem;
		margin-bottom: 1.5rem;
		color: var(--text-muted);
		font-style: italic;
	}

	.exercise-list {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		margin-bottom: 1.5rem;
	}

	.exercise-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(80px, 30%) auto;
		align-items: center;
		gap: 0.85rem;
	}

	.exercise-name {
		font-size: 0.92rem;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.exercise-bar-track {
		height: 6px;
		border-radius: 999px;
		background: var(--bg-secondary);
		overflow: hidden;
	}

	.exercise-bar-fill {
		height: 100%;
		border-radius: 999px;
		background: linear-gradient(90deg, var(--accent), var(--accent-hover));
		transition: width 0.4s ease;
	}

	.exercise-volume {
		font-size: 0.85rem;
		color: var(--text-muted);
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	.total-weight-block {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--accent) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
	}

	.total-weight-label {
		font-size: 0.9rem;
		font-weight: 600;
	}

	.total-weight-value {
		font-size: 1.4rem;
		font-weight: 800;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 480px) {
		.exercise-row {
			grid-template-columns: minmax(0, 1fr) auto;
		}

		.exercise-bar-track {
			display: none;
		}
	}
</style>
