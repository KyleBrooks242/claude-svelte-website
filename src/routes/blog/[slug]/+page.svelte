<script lang="ts">
    import { postComments } from '$lib/schema';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const post = $derived(data.post);
	const html = $derived(data.html);

	function formatDate(iso: string | null) {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}
</script>

<svelte:head><title>{post.title} · Kyle Brooks</title></svelte:head>

<main class="page">
	<div class="container">
		<a href="/blog" style="font-size:0.85rem;color:var(--text-muted);display:inline-flex;align-items:center;gap:0.3rem;margin-bottom:2rem;">
			← Back to blog
		</a>

		<header style="margin-bottom:2.5rem;">
			<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem;flex-wrap:wrap;">
				<time style="font-size:0.85rem;color:var(--text-muted);">{formatDate(post.publishedAt)}</time>
				<span style="color:var(--border);">·</span>
				<span style="font-size:0.85rem;color:var(--text-muted);">{post.readingTime} read</span>
			</div>
			<h1 style="font-size:clamp(1.5rem, 4vw, 2.2rem);margin-bottom:1rem;">{post.title}</h1>
			<div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
				{#each post.tags as tag}
					<span class="badge">{tag}</span>
				{/each}
			</div>
		</header>

		<hr class="divider" />

		<div class="prose" style="max-width:65ch;">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html html}
		</div>
	
	</div>
</main>
