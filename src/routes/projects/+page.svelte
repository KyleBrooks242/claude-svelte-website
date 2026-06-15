<script lang="ts">
	interface Project {
		title: string;
		description: string;
		tags: string[];
		github?: string;
		demo?: string;
		status: 'live' | 'wip' | 'archived';
	}

	const projects: Project[] = [
		{
			title: 'Claude Website',
			description: 'This personal site, built with SvelteKit and TypeScript. Features dark mode, responsive layout, and a blog.',
			tags: ['SvelteKit', 'TypeScript', 'CSS'],
			github: '#',
			demo: '#',
			status: 'live',
		},
		{
			title: 'Dev Tooling CLI',
			description: 'A command-line toolkit for automating common development workflows — scaffolding, deploys, and env management.',
			tags: ['Rust', 'CLI', 'DevOps'],
			github: '#',
			status: 'wip',
		},
		{
			title: 'Realtime Analytics Dashboard',
			description: 'WebSocket-driven analytics dashboard that aggregates events and renders live charts.',
			tags: ['Node.js', 'PostgreSQL', 'WebSockets', 'Svelte'],
			github: '#',
			demo: '#',
			status: 'live',
		},
	];

	const statusColor: Record<Project['status'], string> = {
		live: '#22c55e',
		wip: '#f59e0b',
		archived: '#9ca3af',
	};
</script>

<svelte:head><title>Projects · Kyle Brooks</title></svelte:head>

<main class="page">
	<div class="container">
		<p class="section-tag">Portfolio</p>
		<h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Projects</h1>
		<p style="color: var(--text-muted); margin-bottom: 3rem;">
			A selection of things I've built or am currently building.
		</p>

		<div class="projects-grid">
			{#each projects as project}
				<article class="card">
					<div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.75rem;">
						<h2 style="font-size: 1.1rem;">{project.title}</h2>
						<span
							class="badge"
							style="color:{statusColor[project.status]};border-color:{statusColor[project.status]}22;background:{statusColor[project.status]}11;flex-shrink:0;"
						>
							{project.status}
						</span>
					</div>

					<p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1rem;">{project.description}</p>

					<div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:1.25rem;">
						{#each project.tags as tag}
							<span class="badge">{tag}</span>
						{/each}
					</div>

					<div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
						{#if project.github}
							<a href={project.github} class="btn btn-outline" style="font-size:0.8rem;padding:0.4rem 0.9rem;">GitHub</a>
						{/if}
						{#if project.demo}
							<a href={project.demo} class="btn" style="font-size:0.8rem;padding:0.4rem 0.9rem;">Live demo</a>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	</div>
</main>

<style>
	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.25rem;
	}
</style>
