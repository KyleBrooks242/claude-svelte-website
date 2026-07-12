<script lang="ts">
	import type { PageData } from './$types';
	import ImageWithSkeleton from '$lib/ImageWithSkeleton.svelte';

	let { data }: { data: PageData } = $props();
	const project = $derived(data.project);
	const images = $derived(data.images);

	const statusColor: Record<string, string> = {
		live: '#22c55e',
		complete: '#22c55e',
		wip: '#f59e0b',
		archived: '#9ca3af',
	};

	let viewMode: 'grid' | 'carousel' = $state('grid');
	let activeSlide = $state(0);

	function prevSlide() {
		activeSlide = (activeSlide - 1 + images.length) % images.length;
	}

	function nextSlide() {
		activeSlide = (activeSlide + 1) % images.length;
	}
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
			<div class="photo-toolbar">
				<div class="view-toggle" role="group" aria-label="Image display mode">
					<button
						type="button"
						class="view-toggle-btn"
						class:active={viewMode === 'grid'}
						onclick={() => (viewMode = 'grid')}
					>
						Grid
					</button>
					<button
						type="button"
						class="view-toggle-btn"
						class:active={viewMode === 'carousel'}
						onclick={() => (viewMode = 'carousel')}
					>
						Carousel
					</button>
				</div>
			</div>

			{#if viewMode === 'grid'}
				<div class="photo-grid">
					{#each images as image (image.id)}
						<figure class="photo-item">
							<a href={image.url} target="_blank" rel="noopener noreferrer" class="photo-tile">
								<ImageWithSkeleton src={image.url} alt={image.caption || project.title} />
							</a>
							{#if image.caption}
								<figcaption class="photo-caption">{image.caption}</figcaption>
							{/if}
						</figure>
					{/each}
				</div>
			{:else}
				<div class="carousel">
					<div class="carousel-viewport">
						<a
							href={images[activeSlide].url}
							target="_blank"
							rel="noopener noreferrer"
							class="carousel-tile"
						>
							<ImageWithSkeleton src={images[activeSlide].url} alt={images[activeSlide].caption || project.title} />
						</a>

						{#if images.length > 1}
							<button type="button" class="carousel-nav carousel-nav-prev" aria-label="Previous image" onclick={prevSlide}>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="15 18 9 12 15 6"></polyline>
								</svg>
							</button>
							<button type="button" class="carousel-nav carousel-nav-next" aria-label="Next image" onclick={nextSlide}>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="9 18 15 12 9 6"></polyline>
								</svg>
							</button>
						{/if}
					</div>

					{#if images[activeSlide].caption}
						<p class="photo-caption">{images[activeSlide].caption}</p>
					{/if}

					{#if images.length > 1}
						<div class="carousel-dots">
							{#each images as image, i (image.id)}
								<button
									type="button"
									class="carousel-dot"
									class:active={i === activeSlide}
									aria-label={`Go to image ${i + 1}`}
									onclick={() => (activeSlide = i)}
								></button>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</main>

<style>
	.photo-toolbar {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}

	.view-toggle {
		display: inline-flex;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.view-toggle-btn {
		font-family: inherit;
		font-size: 0.85rem;
		padding: 0.4rem 0.9rem;
		background: transparent;
		color: var(--text-muted);
		border: none;
		cursor: pointer;
		transition: background 0.15s ease, color 0.15s ease;
	}

	.view-toggle-btn + .view-toggle-btn {
		border-left: 1px solid var(--border);
	}

	.view-toggle-btn:hover {
		color: var(--text);
	}

	.view-toggle-btn.active {
		background: var(--accent);
		color: #fff;
	}

	.carousel {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.carousel-viewport {
		position: relative;
		width: 100%;
		max-width: 720px;
	}

	.carousel-tile {
		display: block;
		height: min(60vh, 480px);
		border-radius: var(--radius);
		overflow: hidden;
		border: 1px solid var(--border);
	}

	.carousel-tile :global(.img-skeleton-img) {
		object-fit: contain;
		background: var(--bg-secondary);
	}

	.carousel-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		border: none;
		background: rgba(0, 0, 0, 0.35);
		backdrop-filter: blur(4px);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		opacity: 0.75;
		transition: opacity 0.15s ease, transform 0.15s ease;
	}

	.carousel-nav svg {
		width: 1.1rem;
		height: 1.1rem;
	}

	.carousel-nav:hover {
		opacity: 1;
		transform: translateY(-50%) scale(1.06);
	}

	.carousel-nav-prev {
		left: 0.6rem;
	}

	.carousel-nav-next {
		right: 0.6rem;
	}

	.carousel-dots {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.carousel-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		border: none;
		background: var(--border);
		cursor: pointer;
		padding: 0;
	}

	.carousel-dot.active {
		background: var(--accent);
	}

	.photo-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.photo-item {
		margin: 0;
	}

	.photo-tile {
		display: block;
		height: 220px;
		border-radius: var(--radius);
		overflow: hidden;
		border: 1px solid var(--border);
	}

	.photo-caption {
		margin-top: 0.5rem;
		font-size: 0.85rem;
		color: var(--text-muted);
		text-align: center;
	}

	.photo-tile :global(.img-skeleton-img) {
		transition: opacity 0.3s ease, transform 0.2s ease;
	}

	.photo-tile:hover :global(.img-skeleton-img) {
		transform: scale(1.03);
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
