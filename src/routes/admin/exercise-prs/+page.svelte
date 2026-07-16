<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const exercisePrs = $derived(data.exercisePrs);
	const totalWeightLifted = $derived(data.totalWeightLifted);
	let pendingId = $state<string | null>(null);
	let recalculating = $state(false);

	const KG_TO_LB = 2.20462;
	function formatWeight(kg: number): string {
		return `${Math.round(kg * KG_TO_LB).toLocaleString()} lbs`;
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<svelte:head><title>Exercise PRs · Admin</title></svelte:head>

<main class="page">
	<div class="container">
		<div style="margin-bottom:2.5rem;">
			<p class="section-tag">Admin</p>
			<div style="display:flex;gap:0.5rem;margin-top:0.75rem;border-bottom:1px solid var(--border);padding-bottom:0;">
				<a href="/admin" style="padding:0.4rem 1rem;font-size:0.9rem;font-weight:600;border-bottom:2px solid transparent;color:var(--text-muted);text-decoration:none;">Blog Posts</a>
				<a href="/admin/projects" style="padding:0.4rem 1rem;font-size:0.9rem;font-weight:600;border-bottom:2px solid transparent;color:var(--text-muted);text-decoration:none;">Projects</a>
				<a href="/admin/messages" style="padding:0.4rem 1rem;font-size:0.9rem;font-weight:600;border-bottom:2px solid transparent;color:var(--text-muted);text-decoration:none;">Messages</a>
				<a href="/admin/exercise-prs" style="padding:0.4rem 1rem;font-size:0.9rem;font-weight:600;border-bottom:2px solid var(--accent);color:var(--accent);text-decoration:none;">Exercise PRs</a>
			</div>
		</div>

		<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:2rem;">
			<div>
				<h2 style="font-size:1.25rem;">Total weight lifted</h2>
				<p style="font-size:1.5rem;font-weight:700;color:var(--accent);">{formatWeight(totalWeightLifted)}</p>
			</div>
			<form
				method="POST"
				action="?/recalcTotal"
				use:enhance={() => {
					recalculating = true;
					return async ({ update }) => {
						await update();
						recalculating = false;
					};
				}}
			>
				<button type="submit" class="btn btn-outline" disabled={recalculating}>
					{recalculating ? 'Recalculating…' : 'Recalculate from full history'}
				</button>
			</form>
		</div>

		<div class="card" style="margin-bottom:2.5rem;">
			<h2 style="font-size:1.1rem;margin-bottom:1rem;">Track a new exercise</h2>
			<form method="POST" action="?/addExercise" use:enhance style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:flex-end;">
				<div class="form-group" style="flex:1;min-width:180px;margin-bottom:0;">
					<label for="name" style="font-size:0.85rem;color:var(--text-muted);">Exercise name</label>
					<input id="name" name="name" type="text" required placeholder="Bench Press (Barbell)" />
				</div>
				<div class="form-group" style="flex:1;min-width:180px;margin-bottom:0;">
					<label for="templateId" style="font-size:0.85rem;color:var(--text-muted);">exercise_template_id</label>
					<input id="templateId" name="templateId" type="text" required placeholder="05293BCA" />
				</div>
				<button type="submit" class="btn">Add / recalculate</button>
			</form>
		</div>

		<h2 style="font-size:1.25rem;margin-bottom:1.25rem;">Tracked exercises</h2>

		{#if exercisePrs.length === 0}
			<p style="color:var(--text-muted);">No exercises tracked yet — add one above.</p>
		{:else}
			<div style="display:flex;flex-direction:column;gap:0.75rem;">
				{#each exercisePrs as pr}
					<div class="card" style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
						<div style="flex:1;min-width:0;">
							<p style="font-weight:600;">{pr.exerciseName}</p>
							<p style="font-size:0.8rem;color:var(--text-muted);">
								{formatWeight(pr.personalRecord)} × {pr.numberOfReps} · {formatWeight(pr.totalWeightLifted)} lifetime · updated {formatDate(pr.updatedAt)}
							</p>
							<p style="font-size:0.75rem;color:var(--text-muted);">template: {pr.exerciseTemplateId}</p>
						</div>

						<form
							method="POST"
							action="?/delete"
							onsubmit={(e) => { if (!confirm(`Stop tracking ${pr.exerciseName}?`)) e.preventDefault(); }}
							use:enhance={() => {
								pendingId = pr.id;
								return async ({ update }) => { await update(); pendingId = null; };
							}}
						>
							<input type="hidden" name="id" value={pr.id} />
							<button type="submit" class="btn" style="font-size:0.8rem;padding:0.35rem 0.8rem;background:#ef4444;" disabled={pendingId === pr.id}>
								{pendingId === pr.id ? 'Removing…' : 'Remove'}
							</button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>
