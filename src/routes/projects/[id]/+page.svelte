<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const project = $derived(data.project);
	const images = $derived(data.images);

	const statusColor: Record<string, string> = {
		live: '#22c55e',
		complete: '#22c55e',
		wip: '#f59e0b',
		archived: '#9ca3af',
	};
</script>

<svelte:head><title>{project.title} · Kyle Brooks</title></svelte:head>

<main class="page">
	<div class="container">
		<a href="/projects" style="font-size:0.85rem;color:var(--text-muted);display:inline-flex;align-items:center;gap:0.3rem;margin-bottom:2rem;">
			← Back to projects
		</a>

		<header style="margin-bottom:2.5rem;">
			<div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;margin-bottom:0.75rem;">
				<span
					class="badge"
					style="color:{statusColor[project.status]};border-color:{statusColor[project.status]}33;background:{statusColor[project.status]}11;"
				>{project.status}</span>
				<span class="badge">{project.kind === 'software' ? 'Software' : 'Woodworking'}</span>
			</div>

			<h1 style="font-size:clamp(1.5rem, 4vw, 2rem);margin-bottom:1rem;">{project.title}</h1>

			{#if project.tags.length > 0}
				<div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:1.25rem;">
					{#each project.tags as tag}
						<span class="badge">{tag}</span>
					{/each}
				</div>
			{/if}

			{#if project.github || project.demo}
				<div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
					{#if project.github}
						<a href={project.github} class="btn btn-outline" style="font-size:0.85rem;" target="_blank" rel="noopener noreferrer">GitHub</a>
					{/if}
					{#if project.demo}
						<a href={project.demo} class="btn" style="font-size:0.85rem;" target="_blank" rel="noopener noreferrer">Live demo</a>
					{/if}
				</div>
			{/if}
		</header>

		<hr class="divider" />

		<p style="color:var(--text-muted);font-size:1rem;line-height:1.7;margin:2rem 0;max-width:65ch;">{project.description}</p>

		{#if images.length > 0}
			<div class="photo-grid">
				{#each images as image}
					<a href={image.url} target="_blank" rel="noopener noreferrer" style="display:block;border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);">
						<img
							src={image.url}
							alt={image.caption || project.title}
							style="width:100%;height:220px;object-fit:cover;display:block;transition:transform 0.2s;"
							onmouseenter={(e) => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1.03)')}
							onmouseleave={(e) => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1)')}
						/>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</main>

<style>
	.photo-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	@media (max-width: 640px) {
		.photo-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (min-width: 641px) and (max-width: 900px) {
		.photo-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
