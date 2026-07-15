<script lang="ts">
	import type { PageData } from './$types';
	import type { HevySet } from '$lib/types';

	let { data }: { data: PageData } = $props();
	const workout = $derived(data.workout);

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

	function formatSet(set: HevySet): string {
		if (set.weight_kg != null && set.reps != null) return `${set.weight_kg}kg × ${set.reps}`;
		if (set.reps != null) return `${set.reps} reps`;
		if (set.distance_meters != null) return `${set.distance_meters}m`;
		if (set.duration_seconds != null) return `${set.duration_seconds}s`;
		return '—';
	}
</script>

<svelte:head><title>Keep me honest · Kyle Brooks</title></svelte:head>

<main class="page">
	<div class="container">
		<a href="/" style="font-size:0.85rem;color:var(--text-muted);display:inline-flex;align-items:center;gap:0.3rem;margin-bottom:2rem;">
			← Back home
		</a>

		<header style="margin-bottom:2.5rem;">
			<p class="section-tag">Accountability</p>
			<h1 style="font-size:clamp(1.5rem, 4vw, 2.2rem);margin-bottom:1rem;">Keep me honest</h1>
			<p style="color:var(--text-muted);">A live, public record synced straight from my workout log.</p>
		</header>

		<hr class="divider" />

		{#if workout}
			<section style="text-align:center;margin:2rem 0 3rem;">
				<p class="section-tag">Time since last workout</p>
				<p style="font-size:clamp(1.75rem, 5vw, 2.75rem);font-weight:700;color:{statusColor};">{elapsed}</p>
				<span
					class="badge"
					style="color:{statusColor};border-color:{statusColor}33;background:{statusColor}11;"
				>{statusLabel}</span>
			</section>

			<section class="card">
				<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.5rem;">
					<h2 style="font-size:1.25rem;">{workout.title}</h2>
					<span class="badge">{formatDuration(workout.startTime, workout.endTime)}</span>
				</div>
				<time style="font-size:0.85rem;color:var(--text-muted);">{formatDate(workout.startTime)}</time>

				<div style="margin-top:1.5rem;display:flex;flex-direction:column;gap:1.25rem;">
					{#each workout.exercises as exercise (exercise.index)}
						<div>
							<h3 style="font-size:1rem;margin-bottom:0.5rem;">{exercise.title}</h3>
							<ul style="list-style:none;display:flex;flex-direction:column;gap:0.25rem;padding:0;">
								{#each exercise.sets as set (set.index)}
									<li style="font-size:0.9rem;color:var(--text-muted);">
										Set {set.index + 1}{set.type !== 'normal' ? ` (${set.type})` : ''}: {formatSet(set)}
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			</section>
		{:else}
			<div class="card" style="text-align:center;padding:3rem 1.5rem;">
				<p style="color:var(--text-muted);">No workout data yet — check back soon.</p>
			</div>
		{/if}
	</div>
</main>
