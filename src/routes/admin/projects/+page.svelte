<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const projects = $derived(data.projects);
	let pendingId = $state<string | null>(null);

	const kindLabel: Record<string, string> = { software: 'Software', woodworking: 'Woodworking' };
	const statusColor: Record<string, string> = {
		live: '#22c55e',
		complete: '#22c55e',
		wip: '#f59e0b',
		archived: '#9ca3af',
	};
</script>

<svelte:head><title>Projects · Admin</title></svelte:head>

<main class="page">
	<div class="container">
		<div style="margin-bottom:2.5rem;">
			<p class="section-tag">Admin</p>
			<div style="display:flex;gap:0.5rem;margin-top:0.75rem;border-bottom:1px solid var(--border);padding-bottom:0;">
				<a href="/admin" style="padding:0.4rem 1rem;font-size:0.9rem;font-weight:600;border-bottom:2px solid transparent;color:var(--text-muted);text-decoration:none;">Blog Posts</a>
				<a href="/admin/projects" style="padding:0.4rem 1rem;font-size:0.9rem;font-weight:600;border-bottom:2px solid var(--accent);color:var(--accent);text-decoration:none;">Projects</a>
			</div>
		</div>

		<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:2rem;">
			<h2 style="font-size:1.25rem;">Projects</h2>
			<a href="/admin/projects/new" class="btn">+ New project</a>
		</div>

		{#if projects.length === 0}
			<p style="color:var(--text-muted);">No projects yet. <a href="/admin/projects/new">Create one →</a></p>
		{:else}
			<div style="display:flex;flex-direction:column;gap:0.75rem;">
				{#each projects as project}
					<div class="card" style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
						<div style="flex:1;min-width:0;">
							<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.2rem;">
								<span class="badge">{kindLabel[project.kind]}</span>
								<span
									class="badge"
									style="color:{statusColor[project.status]};border-color:{statusColor[project.status]}33;background:{statusColor[project.status]}11;"
								>
									{project.status}
								</span>
							</div>
							<p style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{project.title}</p>
						</div>

						<div style="display:flex;gap:0.5rem;flex-shrink:0;flex-wrap:wrap;">
							<a href="/admin/projects/{project.id}/edit" class="btn btn-outline" style="font-size:0.8rem;padding:0.35rem 0.8rem;">Edit</a>

							<form method="POST" action="?/delete" style="display:contents;"
								onsubmit={(e) => { if (!confirm('Delete this project?')) e.preventDefault(); }}
								use:enhance={() => {
									pendingId = project.id + '-delete';
									return async ({ update }) => { await update(); pendingId = null; };
								}}
							>
								<input type="hidden" name="id" value={project.id} />
								<button type="submit" class="btn" style="font-size:0.8rem;padding:0.35rem 0.8rem;background:#ef4444;" disabled={pendingId === project.id + '-delete'}>
									{pendingId === project.id + '-delete' ? 'Deleting…' : 'Delete'}
								</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>
