<script lang="ts">
	import type { PageData } from './$types';
	import ImageWithSkeleton from '$lib/ImageWithSkeleton.svelte';

	let { data }: { data: PageData } = $props();

	type ProjectWithCover = PageData['projects'][number];

	const softwareProjects = $derived(data.projects.filter((p) => p.kind === 'software'));
	const woodworkingProjects = $derived(data.projects.filter((p) => p.kind === 'woodworking'));

	const statusColor: Record<string, string> = {
		live: '#22c55e',
		complete: '#22c55e',
		wip: '#f59e0b',
		archived: '#9ca3af',
	};

	const kindIcon: Record<string, string> = {
		software: '💻',
		woodworking: '🪵',
	};
</script>

{#snippet projectCard(project: ProjectWithCover)}
	<a href="/projects/{project.id}" class="project-card-link">
		<article class="card project-card">
			<div class="project-card-image-wrap">
				{#if project.coverImage}
					<ImageWithSkeleton src={project.coverImage} alt={project.title} />
				{:else}
					<div class="project-card-image project-card-placeholder">
						<span>{kindIcon[project.kind]}</span>
					</div>
				{/if}
			</div>
			<div class="project-card-body">
				<div class="project-card-header">
					<h3 style="font-size: 1rem;">{project.title}</h3>
					<span
						class="badge"
						style="color:{statusColor[project.status]};border-color:{statusColor[project.status]}22;background:{statusColor[project.status]}11;flex-shrink:0;"
					>
						{project.status}
					</span>
				</div>

				<p class="project-card-desc">{project.description}</p>

				<div class="project-card-footer">
					<div class="project-card-tags">
						{#each project.tags as tag}
							<span class="badge">{tag}</span>
						{/each}
					</div>
					<span class="project-card-cta">View project <span class="arrow">→</span></span>
				</div>
			</div>
		</article>
	</a>
{/snippet}

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
						{@render projectCard(project)}
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
						{@render projectCard(project)}
					{/each}
				</div>
			</section>
		{/if}

		{#if data.projects.length === 0}
			<p style="color:var(--text-muted);">No projects yet.</p>
		{/if}	</div>
</main>

<style>
	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.25rem;
	}

	.project-card-link {
		display: block;
		height: 100%;
		text-decoration: none;
		color: inherit;
	}

	.project-card-link:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	.project-card {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 0;
		overflow: hidden;
	}

	.project-card-image-wrap {
		flex-shrink: 0;
		height: 180px;
	}

	.project-card-image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.project-card-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-secondary);
		font-size: 2.25rem;
		opacity: 0.6;
	}

	.project-card-body {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 1.25rem 1.5rem 1.5rem;
	}

	.project-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.project-card-desc {
		color: var(--text-muted);
		font-size: 0.9rem;
		line-height: 1.5;
		margin-bottom: 1rem;
		min-height: 4.05rem;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.project-card-footer {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 0.75rem;
		margin-top: auto;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.project-card-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.project-card-cta {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--accent);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.project-card-cta .arrow {
		display: inline-block;
		transition: transform 0.2s;
	}

	.project-card-link:hover .project-card-cta .arrow,
	.project-card-link:focus-visible .project-card-cta .arrow {
		transform: translateX(3px);
	}
</style>
