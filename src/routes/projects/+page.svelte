<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const softwareProjects = $derived(data.projects.filter((p) => p.kind === 'software'));
	const woodworkingProjects = $derived(data.projects.filter((p) => p.kind === 'woodworking'));

	const statusColor: Record<string, string> = {
		live: '#22c55e',
		complete: '#22c55e',
		wip: '#f59e0b',
		archived: '#9ca3af',
	};
</script>

<svelte:head><title>Projects · Kyle Brooks</title></svelte:head>

<main class="page">
	<div class="container">
		<p class="section-tag">Portfolio</p>
		<h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Projects</h1>
		<p style="color: var(--text-muted); margin-bottom: 3.5rem;">
			Things I've built — in the office and in the shop.
		</p>

		<!-- Software -->
		{#if softwareProjects.length > 0}
			<section style="margin-bottom: 3.5rem;">
				<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
					<span style="font-size:1.3rem;">💻</span>
					<h2 style="font-size:1.25rem;">Software</h2>
				</div>
				<div class="projects-grid">
					{#each softwareProjects as project}
						<a href="/projects/{project.id}" style="display:block;text-decoration:none;color:inherit;">
						<article class="card">
							<div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.75rem;">
								<h3 style="font-size: 1rem;">{project.title}</h3>
								<span
									class="badge"
									style="color:{statusColor[project.status]};border-color:{statusColor[project.status]}22;background:{statusColor[project.status]}11;flex-shrink:0;"
								>
									{project.status}
								</span>
							</div>

							<p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1rem;">{project.description}</p>

							<div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
								{#each project.tags as tag}
									<span class="badge">{tag}</span>
								{/each}
							</div>
						</article>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		{#if softwareProjects.length > 0 && woodworkingProjects.length > 0}
			<hr class="divider" />
		{/if}

		<!-- Woodworking -->
		{#if woodworkingProjects.length > 0}
			<section>
				<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;margin-top:2rem;">
					<span style="font-size:1.3rem;">🪵</span>
					<h2 style="font-size:1.25rem;">Woodworking</h2>
				</div>
				<div class="projects-grid">
					{#each woodworkingProjects as project}
						<a href="/projects/{project.id}" style="display:block;text-decoration:none;color:inherit;">
						<article class="card">
							<div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.75rem;">
								<h3 style="font-size: 1rem;">{project.title}</h3>
								<span
									class="badge"
									style="color:{statusColor[project.status]};border-color:{statusColor[project.status]}22;background:{statusColor[project.status]}11;flex-shrink:0;"
								>
									{project.status}
								</span>
							</div>

							<p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1rem;">{project.description}</p>

							<div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
								{#each project.tags as tag}
									<span class="badge">{tag}</span>
								{/each}
							</div>
						</article>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		{#if data.projects.length === 0}
			<p style="color:var(--text-muted);">No projects yet.</p>
		{/if}
	</div>
</main>

<style>
	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.25rem;
	}
</style>
