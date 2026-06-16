<script lang="ts">
	import { readingTime } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const posts = $derived(data.posts);

	function formatDate(iso: string | null) {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}
</script>

<svelte:head><title>Blog · Kyle Brooks</title></svelte:head>

<main class="page">
	<div class="container">
		<p class="section-tag">Writing</p>
		<h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Blog</h1>
		<p style="color: var(--text-muted); margin-bottom: 3rem;">
			Thoughts on software, tools, and craft. Updated occasionally.
		</p>

		<ul style="list-style:none;display:flex;flex-direction:column;gap:1.5rem;">
			{#each posts as post}
				<li>
					<a href="/blog/{post.slug}" style="text-decoration:none;color:inherit;display:block;">
						<article class="card" style="cursor:pointer;">
							<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;flex-wrap:wrap;">
								<time style="font-size:0.8rem;color:var(--text-muted);">{formatDate(post.publishedAt)}</time>
								<span style="color:var(--border);">·</span>
								<span style="font-size:0.8rem;color:var(--text-muted);">{readingTime(post.summary)} read</span>
							</div>
							<h2 style="font-size:1.1rem;margin-bottom:0.5rem;">{post.title}</h2>
							<p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:0.75rem;">{post.summary}</p>
							<div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
								{#each post.tags as tag}
									<span class="badge">{tag}</span>
								{/each}
							</div>
						</article>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</main>
