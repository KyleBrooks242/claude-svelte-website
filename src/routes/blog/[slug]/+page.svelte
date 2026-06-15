<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const post = $derived(data.post);

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	// Very simple markdown renderer for headings, bold, code
	function renderMarkdown(md: string): string {
		return md
			.replace(/^## (.+)$/gm, '<h2>$1</h2>')
			.replace(/^### (.+)$/gm, '<h3>$1</h3>')
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/`([^`]+)`/g, '<code>$1</code>')
			.split(/\n{2,}/)
			.map((block) => {
				if (block.trim().startsWith('<h')) return block.trim();
				return `<p>${block.trim()}</p>`;
			})
			.join('\n');
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
				<time style="font-size:0.85rem;color:var(--text-muted);">{formatDate(post.date)}</time>
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
			{@html renderMarkdown(post.content)}
		</div>
	</div>
</main>

<style>
	:global(.prose code) {
		background: var(--bg-secondary);
		padding: 0.1em 0.4em;
		border-radius: 4px;
		font-size: 0.88em;
		font-family: 'Fira Code', 'Cascadia Code', monospace;
	}
	:global(.prose h2) {
		font-size: 1.35rem;
		margin: 2rem 0 0.6rem;
		color: var(--text);
	}
	:global(.prose h3) {
		font-size: 1.1rem;
		margin: 1.5rem 0 0.4rem;
		color: var(--text);
	}
	:global(.prose strong) {
		color: var(--text);
	}
	:global(.prose li) {
		margin-left: 1.5rem;
		margin-bottom: 0.25rem;
		color: var(--text-muted);
	}
</style>
