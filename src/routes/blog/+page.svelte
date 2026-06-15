<script lang="ts">
	interface Post {
		slug: string;
		title: string;
		date: string;
		summary: string;
		tags: string[];
		readingTime: string;
	}

	const posts: Post[] = [
		{
			slug: 'why-svelte',
			title: 'Why I switched to Svelte for personal projects',
			date: '2026-05-20',
			summary: 'After years of React, Svelte\'s compile-time approach and zero-runtime model finally won me over. Here\'s what changed my mind.',
			tags: ['Svelte', 'Frontend'],
			readingTime: '4 min',
		},
		{
			slug: 'rust-cli-tools',
			title: 'Building fast CLI tools in Rust',
			date: '2026-04-10',
			summary: 'Rust\'s performance characteristics make it ideal for developer tooling. A tour through the crates and patterns I keep reaching for.',
			tags: ['Rust', 'CLI', 'DevOps'],
			readingTime: '7 min',
		},
		{
			slug: 'postgres-performance',
			title: 'PostgreSQL performance tips I keep forgetting',
			date: '2026-02-28',
			summary: 'A personal reference card for EXPLAIN ANALYZE, index strategies, and the VACUUM settings that actually matter.',
			tags: ['PostgreSQL', 'Performance'],
			readingTime: '5 min',
		},
	];

	function formatDate(iso: string) {
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
								<time style="font-size:0.8rem;color:var(--text-muted);">{formatDate(post.date)}</time>
								<span style="color:var(--border);">·</span>
								<span style="font-size:0.8rem;color:var(--text-muted);">{post.readingTime} read</span>
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
