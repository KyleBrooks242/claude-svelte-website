<script lang="ts">
	import type { PageData } from './$types';
	import type { HevyExercise, HevySet } from '$lib/types';

	let { data }: { data: PageData } = $props();
	const workout = $derived(data.workout);
	const skippedCount = $derived(data.skippedCount);
	const totalWeightLifted = $derived(data.totalWeightLifted);
	const exercisePrs = $derived(data.exercisePrs);

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
		if (elapsedMs < 48 * HOUR) return '#22c55e';
		if (elapsedMs < 72 * HOUR) return '#f59e0b';
		return '#ef4444';
	});
	const statusLabel = $derived.by(() => {
		if (!workout) return '';
		if (elapsedMs < 48 * HOUR) return 'On track';
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

	function formatWeightAbbreviated(kg: number): string {
		const lbs = Math.round(kg * KG_TO_LB);
		if (lbs >= 1_000_000) return `${(lbs / 1_000_000).toFixed(2)}M lbs`;
		if (lbs >= 1_000) return `${(lbs / 1_000).toFixed(2)}K lbs`;
		return `${lbs.toLocaleString()} lbs`;
	}

	const totalVolume = $derived(
		workout ? workout.exercises.reduce((sum, exercise) => sum + exerciseVolume(exercise), 0) : 0,
	);

	const maxExerciseVolume = $derived(
		workout ? Math.max(0, ...workout.exercises.map((exercise) => exerciseVolume(exercise))) : 0,
	);

	let expandedExercises = $state<number[]>([]);

	function toggleExercise(index: number) {
		expandedExercises = expandedExercises.includes(index)
			? expandedExercises.filter((i) => i !== index)
			: [...expandedExercises, index];
	}

	function formatSetType(type: HevySet['type']): string {
		return type.charAt(0).toUpperCase() + type.slice(1);
	}

	const latestPrId = $derived.by(() => {
		if (exercisePrs.length === 0) return null;
		return exercisePrs.reduce((latest, pr) =>
			new Date(pr.updatedAt).getTime() > new Date(latest.updatedAt).getTime() ? pr : latest,
		).id;
	});
</script>

<svelte:head><title>Exercise · Kyle Brooks</title></svelte:head>

<main class="page">
	<div class="container">
		<a href="/" style="font-size:0.85rem;color:var(--text-muted);display:inline-flex;align-items:center;gap:0.3rem;margin-bottom:2rem;">
			← Back home
		</a>

		<section style="display:flex;justify-content:center;gap:3rem;flex-wrap:wrap;text-align:center;margin:2rem 0 3rem;">
			<div>
				<p class="section-tag" style="display:inline-flex;align-items:center;gap:0.35rem;">
					Workouts skipped
					<button
						type="button"
						class="tooltip-trigger"
						aria-label="Approximate number of skipped workouts since January 1st, 2025"
					>
						<span class="tooltip-icon" aria-hidden="true">?</span>
						<span class="tooltip-bubble" role="tooltip">
							Approximate number of skipped workouts since January 1st, 2025
						</span>
					</button>
				</p>
				<p style="font-size:clamp(1.75rem, 5vw, 2.75rem);font-weight:700;">{skippedCount}</p>
			</div>
			<div>
				<p class="section-tag">Time since last workout</p>
				<p style="font-size:clamp(1.75rem, 5vw, 2.75rem);font-weight:700;color:{statusColor};">{elapsed}</p>
				<span
					class="badge"
					style="color:{statusColor};border-color:{statusColor}33;background:{statusColor}11;"
				>{statusLabel}</span>
			</div>
			<div>
				<p class="section-tag">Total weight lifted</p>
				<button
					type="button"
					class="tooltip-trigger"
					style="font-size:clamp(1.75rem, 5vw, 2.75rem);font-weight:700;"
					aria-label="Exact total: {formatWeight(totalWeightLifted)}"
				>
					{formatWeightAbbreviated(totalWeightLifted)}
					<span class="tooltip-bubble" role="tooltip">{formatWeight(totalWeightLifted)}</span>
				</button>
			</div>
		</section>

		{#if workout}
			<p class="section-tag">Latest workout</p>
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
						{@const isExpanded = expandedExercises.includes(exercise.index)}
						<div class="exercise-item">
							<button
								type="button"
								class="exercise-row"
								aria-expanded={isExpanded}
								onclick={() => toggleExercise(exercise.index)}
							>
								<span class="exercise-name">{exercise.title}</span>
								<div class="exercise-bar-track">
									<div
										class="exercise-bar-fill"
										style="width:{maxExerciseVolume ? (volume / maxExerciseVolume) * 100 : 0}%;"
									></div>
								</div>
								<span class="exercise-volume">{formatWeight(volume)}</span>
								<span class="exercise-chevron" class:expanded={isExpanded} aria-hidden="true">⌄</span>
							</button>

							{#if isExpanded}
								<div class="set-table-wrap">
									<table class="set-table">
										<thead>
											<tr>
												<th>Set type</th>
												<th>Reps</th>
												<th>Weight</th>
											</tr>
										</thead>
										<tbody>
											{#each exercise.sets as set (set.index)}
												<tr>
													<td>{formatSetType(set.type)}</td>
													<td>{set.reps ?? '—'}</td>
													<td>{set.weight_kg != null ? formatWeight(set.weight_kg) : '—'}</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							{/if}
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

		{#if exercisePrs.length > 0}
			<hr class="divider" style="margin:3rem 0;" />

			<p class="section-tag">Personal records</p>
			<h2 style="font-size:1.25rem;margin-bottom:1.5rem;">Best lifts</h2>

			<div class="pr-grid">
				{#each exercisePrs as pr (pr.id)}
					<div class="pr-card" class:pr-card-featured={pr.id === latestPrId}>
						{#if pr.id === latestPrId}
							<span class="pr-card-badge">★ Latest PR</span>
						{/if}
						<p class="pr-card-name">{pr.exerciseName}</p>
						<p class="pr-card-value">{formatWeight(pr.personalRecord)}</p>
						<p class="pr-card-reps">× {pr.numberOfReps} reps</p>
					</div>
				{/each}
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

	.exercise-item {
		display: flex;
		flex-direction: column;
	}

	.exercise-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(80px, 30%) auto auto;
		align-items: center;
		gap: 0.85rem;
		width: calc(100% + 1.2rem);
		margin: 0 -0.6rem;
		background: none;
		border: none;
		border-radius: var(--radius);
		padding: 0.45rem 0.6rem;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
		transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
	}

	.exercise-row:hover {
		transform: translateY(-2px);
		background: var(--bg-secondary);
		box-shadow: 0 6px 16px color-mix(in srgb, var(--accent) 15%, transparent);
	}

	.exercise-chevron {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 1.4rem;
		flex-shrink: 0;
		font-size: 1rem;
		font-weight: 700;
		line-height: 1;
		padding-bottom: 0.6rem;
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
		border-radius: 999px;
		transition: transform 0.2s ease, background 0.2s ease;
	}

	.exercise-row:hover .exercise-chevron {
		background: color-mix(in srgb, var(--accent) 20%, transparent);
	}

	.exercise-chevron.expanded {
		transform: rotate(180deg);
	}

	.set-table-wrap {
		margin-top: 0.6rem;
		overflow-x: auto;
	}

	.set-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
	}

	.set-table th {
		text-align: left;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-muted);
		padding: 0.4rem 0.6rem;
		border-bottom: 1px solid var(--border);
	}

	.set-table td {
		padding: 0.45rem 0.6rem;
		border-bottom: 1px solid var(--border);
		font-variant-numeric: tabular-nums;
	}

	.set-table tbody tr:last-child td {
		border-bottom: none;
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

		.exercise-chevron {
			display: none;
		}
	}

	.pr-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 1rem;
	}

	.pr-card {
		position: relative;
		overflow: hidden;
		background: var(--card-bg);
		border: 1px solid color-mix(in srgb, var(--accent) 25%, var(--border));
		border-radius: var(--radius);
		padding: 1.25rem;
		text-align: center;
		transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
	}

	.pr-card::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(160deg, color-mix(in srgb, var(--accent) 14%, transparent), transparent 60%);
		pointer-events: none;
	}

	.pr-card:hover {
		transform: translateY(-3px);
		border-color: var(--accent);
		box-shadow: 0 8px 28px color-mix(in srgb, var(--accent) 30%, transparent);
	}

	.pr-card-featured {
		border-color: var(--accent);
		background: linear-gradient(
			160deg,
			color-mix(in srgb, var(--accent) 20%, var(--card-bg)),
			var(--card-bg) 65%
		);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 40%, transparent),
			0 10px 30px color-mix(in srgb, var(--accent) 28%, transparent);
		padding-top: 2.5rem;
	}

	.pr-card-featured:hover {
		box-shadow: 0 0 0 1px var(--accent), 0 12px 34px color-mix(in srgb, var(--accent) 38%, transparent);
	}

	.pr-card-featured .pr-card-value {
		font-size: 2.1rem;
	}

	.pr-card-badge {
		position: absolute;
		top: 0.65rem;
		left: 50%;
		transform: translateX(-50%);
		font-size: 0.62rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 18%, var(--card-bg));
		border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
		padding: 0.2rem 0.5rem;
		border-radius: 999px;
	}

	.pr-card-name {
		position: relative;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-muted);
		margin-bottom: 0.5rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.pr-card-value {
		position: relative;
		font-size: 1.9rem;
		font-weight: 800;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
		line-height: 1.1;
	}

	.pr-card-reps {
		position: relative;
		font-size: 0.8rem;
		color: var(--text-muted);
		margin-top: 0.25rem;
	}

	.tooltip-trigger {
		position: relative;
		display: inline-flex;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		cursor: help;
	}

	.tooltip-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 1px solid var(--text-muted);
		color: var(--text-muted);
		font-size: 0.65rem;
		font-weight: 700;
		line-height: 1;
	}

	.tooltip-bubble {
		position: absolute;
		bottom: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%) translateY(4px);
		width: max-content;
		max-width: 220px;
		padding: 0.5rem 0.7rem;
		border-radius: var(--radius);
		background: var(--card-bg);
		border: 1px solid var(--border);
		color: var(--text);
		font-size: 0.75rem;
		font-weight: 400;
		text-transform: none;
		letter-spacing: normal;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition: opacity 0.15s ease, transform 0.15s ease;
		z-index: 10;
	}

	.tooltip-trigger:hover .tooltip-bubble,
	.tooltip-trigger:focus-visible .tooltip-bubble {
		opacity: 1;
		visibility: visible;
		transform: translateX(-50%) translateY(0);
	}
</style>
