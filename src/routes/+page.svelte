<script lang="ts">
	const skills = ['TypeScript', 'Svelte', 'Node.js', 'PostgreSQL', 'Docker'];
</script>

<svelte:head><title>Kyle Brooks</title></svelte:head>

<main class="page">
	<div class="container">

		<!-- Hero -->
		<section style="padding: 3rem 0 4rem;">
			<p class="section-tag">Hello!</p>
			<h1 style="font-size: clamp(2rem, 5vw, 3.2rem); margin-bottom: 1rem;">
				I'm Kyle Brooks- <br>software engineer and amateur woodworker
			</h1>
			<p style="font-size: 1.1rem; color: var(--text-muted); max-width: 520px; margin-bottom: 2rem;">
				I build fast, reliable software by day and make slow, not so reliable improvements to my home on weekends
			</p>
			<div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
				<a href="/projects" class="btn">View Projects</a>
				<a href="/contact" class="btn btn-outline">Get in touch</a>
			</div>
		</section>

		<hr class="divider" />

		<!-- Skills -->
		<section style="margin-bottom: 4rem;">
			<p class="section-tag">Skills</p>
			<h2 style="font-size: 1.5rem; margin-bottom: 1.25rem;">What I work with</h2>
			<div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
				{#each skills as skill}
					<span class="badge">{skill}</span>
				{/each}
			</div>
		</section>

		<!-- Recent posts teaser -->
		<section>
			<p class="section-tag">Writing</p>
			<h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">From the blog</h2>
			<p style="color:var(--text-muted); margin-bottom: 1.25rem;">
				Occasional thoughts on software, tooling, and craft.
			</p>
			<a href="/blog" class="btn btn-outline">Read posts →</a>
		</section>

	</div>
</main>
