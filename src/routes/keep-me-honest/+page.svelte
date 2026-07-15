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

			<section class="card">
				<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.5rem;">
					<h2 style="font-size:1.25rem;">{workout.title}</h2>
					<time style="font-size:0.85rem;color:var(--text-muted);">{formatDate(workout.startTime)}</time>
					<span class="badge">{formatDuration(workout.startTime, workout.endTime)}</span>
				</div>

				{#if workout.description}
					<p style="margin-top:0.75rem;color:var(--text-muted);">{workout.description}</p>
				{/if}

				<div style="margin-top:1.5rem;display:flex;flex-direction:column;gap:0.6rem;">
					<!-- <div style="display:flex;justify-content:space-between;gap:1rem;font-size:0.9rem;">
						<span style="font-style:italic;">Exercise</span>
						<span style="color:var(--text-muted);white-space:nowrap;font-style:italic;">Total Volume</span>
					</div> -->
					<hr class="divider" />
					{#each workout.exercises as exercise (exercise.index)}
						<div style="display:flex;justify-content:space-between;gap:1rem;font-size:0.9rem;">
							<span>{exercise.title}</span>
							<span style="color:var(--text-muted);white-space:nowrap;">{formatWeight(exerciseVolume(exercise))}</span>
						</div>
					{/each}
				</div>

				<div style="display:flex;justify-content:space-between;gap:1rem;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);font-weight:600;">
					<span>Total weight lifted</span>
					<span>{formatWeight(totalVolume)}</span>
				</div>
			</section>
		{:else}
			<div class="card" style="text-align:center;padding:3rem 1.5rem;">
				<p style="color:var(--text-muted);">No workout data yet — check back soon.</p>
			</div>
		{/if}
	</div>
</main>
