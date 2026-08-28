<script lang="ts">
	import type { PageData } from './$types';
	import type { HevyExercise, HevySet } from '$lib/types';
	import IconDown from '~icons/teenyicons/down-solid';
	import IconUp from '~icons/teenyicons/up-solid';
	import StarSolidIcon from '~icons/teenyicons/star-solid';

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
		if (!workout) return 'var(--status-neutral)';
		if (elapsedMs < 48 * HOUR) return 'var(--status-good)';
		if (elapsedMs < 72 * HOUR) return 'var(--status-warn)';
		return 'var(--status-bad)';
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

	function isCardioExercise(exercise: HevyExercise): boolean {
		return exercise.sets.some((set) => set.duration_seconds != null);
	}

	function exerciseDurationSeconds(exercise: HevyExercise): number {
		return exercise.sets.reduce((sum, set) => sum + (set.duration_seconds ?? 0), 0);
	}

	function formatSetDuration(totalSeconds: number): string {
		const seconds = Math.round(totalSeconds);
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		if (hours > 0) {
			return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
		}
		return `${minutes}:${String(secs).padStart(2, '0')}`;
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

	const totalCardioSeconds = $derived(
		workout ? workout.exercises.reduce((sum, exercise) => sum + exerciseDurationSeconds(exercise), 0) : 0,
	);

	const maxExerciseVolume = $derived(
		workout ? Math.max(0, ...workout.exercises.map((exercise) => exerciseVolume(exercise))) : 0,
	);

	const maxCardioDurationSeconds = $derived(
		workout
			? Math.max(0, ...workout.exercises.filter(isCardioExercise).map(exerciseDurationSeconds))
			: 0,
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

	let prCarouselEl = $state<HTMLDivElement | null>(null);
	let activePrIndex = $state(0);
	let isPrCarouselViewport = $state(false);

	let isPrDragging = $state(false);
	let dragDeltaX = $state(0);
	let dragStartX = 0;
	let dragCardWidth = 1;
	let dragPointerId: number | null = null;

	const PR_DRAG_STEP_FRACTION = 0.58;

	// Fractional "virtual" index: integer while idle, shifts continuously while dragging
	// so the whole carousel tracks the pointer before settling on release.
	const livePrIndex = $derived(activePrIndex - dragDeltaX / (dragCardWidth * PR_DRAG_STEP_FRACTION));

	function prCircularDelta(i: number, center: number, n: number): number {
		// shortest signed distance around the ring, so wrapping past the last
		// card always continues forward instead of snapping back across the set
		let d = i - center;
		d = ((d % n) + n) % n;
		if (d > n / 2) d -= n;
		return d;
	}

	function prCardStyle(i: number): string {
		const n = exercisePrs.length;
		const d = prCircularDelta(i, livePrIndex, n);
		const absD = Math.abs(d);
		const x = d * 58;
		const z = -absD * 120;
		const ry = d * -22;
		const scale = Math.max(1 - absD * 0.18, 0.55);
		const opacity = absD > 2.3 ? 0 : Math.max(1 - absD * 0.32, 0);
		const transition = isPrDragging
			? 'none'
			: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease';
		return `--pr-x:${x}%; --pr-z:${z}px; --pr-ry:${ry}deg; --pr-scale:${scale}; opacity:${opacity}; z-index:${100 - Math.round(absD * 10)}; pointer-events:${absD < 0.5 ? 'auto' : 'none'}; transition:${transition};`;
	}

	const PR_AUTOPLAY_INTERVAL = 4000;
	const PR_AUTOPLAY_RESUME_DELAY = 5000;

	let prAutoplayTimer: ReturnType<typeof setInterval> | null = null;
	let prResumeTimer: ReturnType<typeof setTimeout> | null = null;

	function prShouldAutoplay(): boolean {
		return (
			isPrCarouselViewport &&
			typeof window !== 'undefined' &&
			!window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	function stopPrAutoplay() {
		if (prAutoplayTimer) {
			clearInterval(prAutoplayTimer);
			prAutoplayTimer = null;
		}
	}

	function startPrAutoplay() {
		stopPrAutoplay();
		if (exercisePrs.length < 2 || !prShouldAutoplay()) return;
		prAutoplayTimer = setInterval(() => {
			if (!prShouldAutoplay()) {
				stopPrAutoplay();
				return;
			}
			activePrIndex = (activePrIndex + 1) % exercisePrs.length;
		}, PR_AUTOPLAY_INTERVAL);
	}

	function pausePrAutoplay() {
		stopPrAutoplay();
		if (prResumeTimer) {
			clearTimeout(prResumeTimer);
			prResumeTimer = null;
		}
	}

	function schedulePrAutoplayResume() {
		if (prResumeTimer) clearTimeout(prResumeTimer);
		prResumeTimer = setTimeout(startPrAutoplay, PR_AUTOPLAY_RESUME_DELAY);
	}

	function handlePrPointerDown(e: PointerEvent) {
		if (exercisePrs.length < 2) return;
		pausePrAutoplay();
		isPrDragging = true;
		dragStartX = e.clientX;
		dragDeltaX = 0;
		dragPointerId = e.pointerId;
		const sampleCard = prCarouselEl?.querySelector('.pr-card') as HTMLElement | null;
		dragCardWidth = sampleCard?.clientWidth || prCarouselEl?.clientWidth || 1;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePrPointerMove(e: PointerEvent) {
		if (!isPrDragging || e.pointerId !== dragPointerId) return;
		dragDeltaX = e.clientX - dragStartX;
	}

	function endPrDrag() {
		if (!isPrDragging) return;
		isPrDragging = false;
		const n = exercisePrs.length;
		const step = Math.round(-dragDeltaX / (dragCardWidth * PR_DRAG_STEP_FRACTION));
		if (step !== 0) {
			activePrIndex = (((activePrIndex + step) % n) + n) % n;
		}
		dragDeltaX = 0;
		dragPointerId = null;
		schedulePrAutoplayResume();
	}

	$effect(() => {
		if (typeof window === 'undefined') return;
		const mq = window.matchMedia('(max-width: 600px)');
		const update = () => {
			isPrCarouselViewport = mq.matches;
		};
		update();
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	});

	$effect(() => {
		if (exercisePrs.length < 2 || !isPrCarouselViewport) {
			stopPrAutoplay();
			return;
		}
		startPrAutoplay();
		return () => {
			stopPrAutoplay();
			if (prResumeTimer) {
				clearTimeout(prResumeTimer);
				prResumeTimer = null;
			}
		};
	});
</script>

<svelte:head><title>Exercise · Kyle Brooks</title></svelte:head>

<main class="page">
	<div class="container">

		<section style="display:flex;justify-content:center;gap:3rem;flex-wrap:wrap;text-align:center;margin:2rem 0 3rem;">
			<div>
				<p class="section-tag">Time since last workout</p>
				<p style="font-family:var(--font-mono);font-size:clamp(1.75rem, 5vw, 2.75rem);font-weight:600;color:{statusColor};">{elapsed}</p>
				<span
					class="badge"
					style="color:{statusColor};border-color:color-mix(in srgb, {statusColor} 35%, transparent);background:color-mix(in srgb, {statusColor} 12%, transparent);"
				>{statusLabel}</span>
			</div>
			<div>
				<p class="section-tag">Total weight lifted</p>
				<button
					type="button"
					class="tooltip-trigger"
					style="font-family:var(--font-mono);font-size:clamp(1.75rem, 5vw, 2.75rem);font-weight:600;"
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
						{@const cardio = isCardioExercise(exercise)}
						{@const volume = exerciseVolume(exercise)}
						{@const cardioDuration = cardio ? exerciseDurationSeconds(exercise) : 0}
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
										style="width:{cardio
											? maxCardioDurationSeconds
												? (cardioDuration / maxCardioDurationSeconds) * 100
												: 0
											: maxExerciseVolume
												? (volume / maxExerciseVolume) * 100
												: 0}%;"
									></div>
								</div>
								<span class="exercise-volume"
									>{cardio ? formatSetDuration(cardioDuration) : formatWeight(volume)}</span
								>
								<span class="exercise-chevron" aria-hidden="true">
									{#if isExpanded}
										<IconUp width="0.7rem" height="0.7rem" />
									{:else}
										<IconDown width="0.7rem" height="0.7rem" />
									{/if}
								</span>
							</button>

							{#if isExpanded}
								<div class="set-table-wrap">
									<table class="set-table">
										<thead>
											<tr>
												<th>Set type</th>
												{#if cardio}
													<th>Duration</th>
												{:else}
													<th>Reps</th>
													<th>Weight</th>
												{/if}
											</tr>
										</thead>
										<tbody>
											{#each exercise.sets as set (set.index)}
												<tr>
													<td>{formatSetType(set.type)}</td>
													{#if cardio}
														<td>{set.duration_seconds != null ? formatSetDuration(set.duration_seconds) : '—'}</td>
													{:else}
														<td>{set.reps ?? '—'}</td>
														<td>{set.weight_kg != null ? formatWeight(set.weight_kg) : '—'}</td>
													{/if}
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							{/if}
						</div>
					{/each}
				</div>

				{#if totalVolume > 0}
					<div class="total-weight-block">
						<span class="total-weight-label">Total weight lifted</span>
						<span class="total-weight-value">{formatWeight(totalVolume)}</span>
					</div>
				{:else if totalCardioSeconds > 0}
					<div class="total-weight-block">
						<span class="total-weight-label">Total cardio time</span>
						<span class="total-weight-value">{formatSetDuration(totalCardioSeconds)}</span>
					</div>
				{/if}
			</section>
		{:else}
			<div class="card" style="text-align:center;padding:3rem 1.5rem;">
				<p style="color:var(--text-muted);">No workout data yet — check back soon.</p>
			</div>
		{/if}

		{#if exercisePrs.length > 0}
			<hr class="divider" style="margin:3rem 0;" />

			<p class="section-tag">Personal records</p>

			<div
				class="pr-carousel-stage"
				role="group"
				aria-label="Personal records"
				bind:this={prCarouselEl}
				onpointerdown={handlePrPointerDown}
				onpointermove={handlePrPointerMove}
				onpointerup={endPrDrag}
				onpointercancel={endPrDrag}
				onmouseenter={pausePrAutoplay}
				onmouseleave={schedulePrAutoplayResume}
			>
				<div class="pr-carousel-track">
					{#each exercisePrs as pr, i (pr.id)}
						<div
							class="pr-card"
							class:pr-card-featured={pr.id === latestPrId}
							style={isPrCarouselViewport ? prCardStyle(i) : undefined}
						>
							{#if pr.id === latestPrId}
								<span class="pr-card-badge">
									<StarSolidIcon height="1em" />
									Latest PR
									<StarSolidIcon height="1em" />
								</span>
							{/if}
							<p class="pr-card-name">{pr.exerciseName}</p>
							<p class="pr-card-value">{formatWeight(pr.personalRecord)}</p>
							<p class="pr-card-reps">× {pr.numberOfReps} reps</p>
						</div>
					{/each}
				</div>
			</div>

			{#if exercisePrs.length > 1}
				<div class="pr-dots" role="presentation">
					{#each exercisePrs as pr, i (pr.id)}
						<span class="pr-dot" class:pr-dot-active={i === activePrIndex}></span>
					{/each}
				</div>
			{/if}
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
		grid-template-columns: minmax(0, 1fr) minmax(80px, 30%) 5rem 2rem;
		align-items: center;
		gap: 0.85rem;
		width: calc(100% + 1.2rem);
		margin: 0 -0.6rem;
		background: var(--card-bg);
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
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
		border-radius: var(--radius);
		transition: background 0.2s ease;
	}

	.exercise-row:hover .exercise-chevron {
		background: color-mix(in srgb, var(--accent) 20%, transparent);
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
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--text-muted);
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
		text-align: right;
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
		font-family: var(--font-mono);
		font-size: 1.3rem;
		font-weight: 600;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 480px) {
		.exercise-row {
			grid-template-columns: minmax(0, 1fr) auto auto;
			background: var(--card-bg);
			border: 1px solid var(--border);
		}

		.exercise-row:hover {
			transform: none;
			box-shadow: none;
		}

		.exercise-bar-track {
			display: none;
		}

		.exercise-chevron {
			width: 1.5rem;
			height: 1.3rem;
		}

		.pr-card-badge {
			font-size: 0.53rem;
			padding: 0.15rem 0.4rem;
			gap: 0.2rem;
		}
	}

	.pr-carousel-stage {
		position: relative;
	}

	.pr-carousel-track {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 1rem;
	}

	.pr-dots {
		display: none;
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
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		white-space: nowrap;
		font-size: 0.61rem;
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

	/* Below this point (rules must stay after the base .pr-card block above so
	   the override wins the cascade) the PR grid becomes a 3D looping carousel. */
	@media (max-width: 600px) {
		.pr-carousel-stage {
			height: 220px;
			margin: 0 -1.25rem;
			padding: 0 1.25rem;
			overflow: hidden;
			perspective: 1000px;
			perspective-origin: 50% 50%;
			touch-action: pan-y;
		}

		.pr-carousel-track {
			display: block;
			position: relative;
			width: 100%;
			height: 100%;
			transform-style: preserve-3d;
		}

		.pr-card {
			position: absolute;
			top: 50%;
			left: 50%;
			width: 72%;
			max-width: 280px;
			margin: 0;
			transform: translate(-50%, -50%) translate3d(var(--pr-x, 0), 0, var(--pr-z, 0))
				rotateY(var(--pr-ry, 0deg)) scale(var(--pr-scale, 1));
			backface-visibility: hidden;
		}

		.pr-dots {
			display: flex;
			justify-content: center;
			gap: 0.4rem;
			margin-top: 0.9rem;
		}

		.pr-dot {
			width: 6px;
			height: 6px;
			border-radius: 50%;
			background: var(--border);
			transition: background 0.2s ease, transform 0.2s ease;
		}

		.pr-dot-active {
			background: var(--accent);
			transform: scale(1.35);
		}
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
