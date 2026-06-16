<script lang="ts">
	interface SoftwareProject {
		kind: 'software';
		title: string;
		description: string;
		tags: string[];
		github?: string;
		demo?: string;
		status: 'live' | 'wip' | 'archived';
	}

	interface WoodworkingProject {
		kind: 'woodworking';
		title: string;
		description: string;
		materials: string[];
		status: 'complete' | 'wip';
	}

	type Project = SoftwareProject | WoodworkingProject;

	const softwareProjects: SoftwareProject[] = [
		{
			kind: 'software',
			title: 'Claude Website',
			description: 'This personal site, built with SvelteKit and TypeScript. Features dark mode, responsive layout, and a blog.',
			tags: ['SvelteKit', 'TypeScript', 'CSS'],
			github: '#',
			demo: '#',
			status: 'live',
		},
		{
			kind: 'software',
			title: 'Dev Tooling CLI',
			description: 'A command-line toolkit for automating common development workflows — scaffolding, deploys, and env management.',
			tags: ['Rust', 'CLI', 'DevOps'],
			github: '#',
			status: 'wip',
		},
		{
			kind: 'software',
			title: 'Realtime Analytics Dashboard',
			description: 'WebSocket-driven analytics dashboard that aggregates events and renders live charts.',
			tags: ['Node.js', 'PostgreSQL', 'WebSockets', 'Svelte'],
			github: '#',
			demo: '#',
			status: 'live',
		},
	];

	const woodworkingProjects: WoodworkingProject[] = [
		{
			kind: 'woodworking',
			title: 'Walnut Dining Table',
			description: 'A live-edge walnut slab dining table with hairpin legs. First big furniture build — learned more about flattening and finishing than I expected.',
			materials: ['Black Walnut', 'Steel hairpin legs', 'Waterlox finish'],
			status: 'complete',
		},
		{
			kind: 'woodworking',
			title: 'Built-in Bookshelves',
			description: 'Floor-to-ceiling built-ins for the living room. Framed with pine, faced with poplar, and painted to match the trim.',
			materials: ['Pine', 'Poplar', 'MDF back panels'],
			status: 'complete',
		},
		{
			kind: 'woodworking',
			title: 'Workbench',
			description: 'A traditional Roubo-style workbench with a leg vise and wagon vise. Still working out the vise hardware.',
			materials: ['Hard Maple', 'Benchcrafted hardware'],
			status: 'wip',
		},
	];

	const swStatusColor: Record<SoftwareProject['status'], string> = {
		live: '#22c55e',
		wip: '#f59e0b',
		archived: '#9ca3af',
	};

	const wwStatusColor: Record<WoodworkingProject['status'], string> = {
		complete: '#22c55e',
		wip: '#f59e0b',
	};
</script>

<svelte:head><title>Projects · Kyle Brooks</title></svelte:head>

<main class="page">
	<div class="container">
		<p class="section-tag">Portfolio</p>
		<h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Projects</h1>
		<p style="color: var(--text-muted); margin-bottom: 3.5rem;">
			Things I've built — in code and in the shop.
		</p>

		<!-- Software -->
		<section style="margin-bottom: 3.5rem;">
			<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
				<span style="font-size:1.3rem;">💻</span>
				<h2 style="font-size:1.25rem;">Software</h2>
			</div>
			<div class="projects-grid">
				{#each softwareProjects as project}
					<article class="card">
						<div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.75rem;">
							<h3 style="font-size: 1rem;">{project.title}</h3>
							<span
								class="badge"
								style="color:{swStatusColor[project.status]};border-color:{swStatusColor[project.status]}22;background:{swStatusColor[project.status]}11;flex-shrink:0;"
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
		</section>

		<hr class="divider" />

		<!-- Woodworking -->
		<section>
			<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;margin-top:2rem;">
				<span style="font-size:1.3rem;">🪵</span>
				<h2 style="font-size:1.25rem;">Woodworking</h2>
			</div>
			<div class="projects-grid">
				{#each woodworkingProjects as project}
					<article class="card">
						<div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.75rem;">
							<h3 style="font-size: 1rem;">{project.title}</h3>
							<span
								class="badge"
								style="color:{wwStatusColor[project.status]};border-color:{wwStatusColor[project.status]}22;background:{wwStatusColor[project.status]}11;flex-shrink:0;"
							>
								{project.status}
							</span>
						</div>

						<p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1rem;">{project.description}</p>

						<div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
							{#each project.materials as material}
								<span class="badge">{material}</span>
							{/each}
						</div>
					</article>
				{/each}
			</div>
		</section>

	</div>
</main>

<style>
	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.25rem;
	}
</style>
