<script lang="ts">
	const skills = 
	[
		'AWS',
		'TypeScript',
		'Javascript',
		'Python',
		'Node.js',
		'Next.js',
		'Angular',
		'FastAPI',
		'Serverless',
		'Github Actions',
		'PostgreSQL',
		'Terraform',
		'Docker', 
		'MongoDB',
		'DynamoDB',
		'Azure'
	];
	const extraSkills = ['Tight Deadlines', 'Incomplete Requirements', 'Poorly Documented Services', 'Difficult Coworkers'];

	function shuffle<T>(items: T[]): T[] {
		const result = [...items];
		for (let i = result.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[result[i], result[j]] = [result[j], result[i]];
		}
		return result;
	}

	const marqueeSkills = shuffle([...skills, ...extraSkills]);
</script>

<svelte:head><title>Kyle Brooks</title></svelte:head>

<main class="page">
	<div class="container">

		<!-- Hero -->
		<section style="padding: 3rem 0 4rem;">
			<p class="section-tag">Hello!</p>
			<h1 style="font-size: clamp(2rem, 5vw, 3.2rem); margin-bottom: 1rem;">
				I'm Kyle.<br>Software Engineer and Amateur Woodworker
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
		
		<!-- Recent posts teaser -->
		<section>
			<p class="section-tag">Writing</p>
			<h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">From the blog</h2>
			<p style="color:var(--text-muted); margin-bottom: 1.25rem;">
				Occasionally, I might write something
			</p>
			<a href="/blog" class="btn btn-outline">Read posts →</a>
		</section>

		<hr class="divider" />
		
		<!--Workout Teaser-->
		<section>
			<p class="section-tag">Accountability</p>
			<h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Have I been working out?</h2>
			<p style="color:var(--text-muted); margin-bottom: 1.25rem;">
				A live look at whether I'm actually sticking to my workouts.
			</p>
			<a href="/keep-me-honest" class="btn btn-outline">See my latest stats →</a>
		</section>

		<hr class="divider" />
		
		<!-- Skills -->
		<section style="margin-bottom: 4rem;">
			<p class="section-tag">Skills</p>
			<h2 style="font-size: 1.5rem; margin-bottom: 1.25rem;">What I work with</h2>
			<div class="skill-marquee">
				<div class="skill-track">
					{#each marqueeSkills as skill}
						<span class="badge">{skill}</span>
					{/each}
					{#each marqueeSkills as skill}
						<span class="badge" aria-hidden="true">{skill}</span>
					{/each}
				</div>
			</div>
		</section>

		

	</div>
</main>

<style>
	.skill-marquee {
		overflow: hidden;
		mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
	}

	.skill-track {
		display: flex;
		width: max-content;
		gap: 0.5rem;
		animation: scroll-across 50s linear infinite;
	}

	.skill-track .badge {
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 12%, transparent);
		border-color: color-mix(in srgb, var(--accent) 35%, transparent);
	}

	@keyframes scroll-across {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}
</style>
