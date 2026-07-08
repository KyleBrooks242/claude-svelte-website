<script lang="ts">
	type Job = {
		company: string;
		role: string;
		location: string;
		start: string;
		end: string;
		bullets: string[];
	};

	const jobs: Job[] = [
		{
			company: 'Duke Energy',
			role: 'Senior Software Engineer',
			location: 'Remote',
			start: 'Mar 2025',
			end: 'Present',
			bullets: [
				'Built an API to aggregate data across multiple disparate systems, powering both automated pipeline jobs and manual workflows.',
				'Shipped a UI dashboard letting SMEs view, filter, and edit aggregated data to resolve discrepancies between systems of record.',
				'Designed and built a self-service permission system — admins create custom groups, assign users, and define fine-grained view/edit permissions.',
			],
		},
		{
			company: 'Ally',
			role: 'Senior Software Engineer',
			location: 'Remote',
			start: 'Apr 2021',
			end: 'Jan 2025',
			bullets: [
				'Redesigned the flow triggering 1.2M+ daily customer notifications to improve performance and cut third-party dependencies.',
				'Cut notification delivery time by fetching config from DAX and offloading record-keeping to an async SQS pipeline.',
				'Improved notification tracking by standardizing and expanding status records in DynamoDB.',
				'Eliminated region-outage downtime with a multi-region active/active routing strategy on AWS Route53.',
				'Replaced legacy Java Lambdas with Node.js/TypeScript functions across microservices, improving performance and maintainability.',
				'Built a notification replay strategy using global DynamoDB tables and DynamoDB Streams to recover dropped notifications during region outages.',
				'Placed SQS queues in front of Lambdas to batch requests and eliminate throttling.',
				'Led the move from a monorepo to multi-repo, drastically cutting unnecessary resource creation in dev environments.',
				'Cut pipeline build time 83% (30 min → 5 min) and package size 97% (~40MB → ~1MB) by restructuring Lambda builds with Serverless.',
				'Automated deployment of all AWS services with Terraform in CI/CD.',
				'Continuously tuned GitLab CI/CD pipelines to shrink build times.',
				'Volunteered on the Security Champions team to track emerging vulnerabilities.',
			],
		},
		{
			company: 'Paymentus',
			role: 'Full Stack Engineer',
			location: 'Remote',
			start: 'Sep 2019',
			end: 'Apr 2021',
			bullets: [
				'Built and shipped a fully customizable MERN payment platform from scratch in under a year.',
				'Created and documented reporting tools powered by dynamic MongoDB queries.',
				'Developed reusable React components shared across multiple repos.',
				'Partnered across teams to share knowledge and make the most of available resources.',
				'Ran detailed code review sessions with senior developers to sharpen best practices.',
				'Turned loose customer requirements into detailed, actionable development stories.',
			],
		},
		{
			company: 'SCI Fusion360',
			role: 'Staff Software Developer',
			location: 'Charlotte, NC',
			start: 'May 2016',
			end: 'Aug 2019',
			bullets: [
				"Delivered full-stack development supporting IBM's Financial Transaction Manager (FTM) product.",
				'Implemented patches and bug fixes across multiple Java services within FTM.',
				'Communicated with customers to build solutions against shifting requirements and tight deadlines.',
				'Used version control to support multiple customers across different release levels simultaneously.',
				'Served week-long, once-a-month on-call rotations as first responder for show-stopping production issues.',
			],
		},
	];

	type Stat = { value: number; decimals?: number; suffix: string; label: string };

	const stats: Stat[] = [
		{ value: 10, suffix: '+', label: 'Years of experience' },
		{ value: 1.2, decimals: 1, suffix: 'M+', label: 'Daily notifications handled' },
		{ value: 83, suffix: '%', label: 'Faster pipeline builds' },
		{ value: 97, suffix: '%', label: 'Smaller deploy packages' },
	];

	const skillGroups = [
		{ label: 'Languages', items: ['TypeScript', 'JavaScript', 'Python'] },
		{ label: 'Frameworks', items: ['Node', 'Next.js', 'Serverless', 'Angular', 'FastAPI'] },
		{ label: 'DevOps', items: ['GitHub Actions', 'GitLab CI', 'Terraform', 'Docker'] },
		{ label: 'Databases', items: ['PostgreSQL', 'DynamoDB', 'MongoDB'] },
		{
			label: 'Cloud — AWS',
			items: ['Lambda', 'SQS', 'S3', 'Step Functions', 'Route53', 'DAX', 'Kinesis', 'API Gateway', 'EventBridge', 'CloudWatch'],
		},
		{ label: 'Cloud — Azure', items: ['Azure'] },
	];

	let activeJob = $state(0);

	function prefersReducedMotion() {
		return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	function reveal(node: HTMLElement, params?: { delay?: number }) {
		if (params?.delay) node.style.transitionDelay = `${params.delay}ms`;
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						node.classList.add('is-visible');
						io.unobserve(node);
					}
				}
			},
			{ threshold: 0.15 },
		);
		io.observe(node);
		return { destroy: () => io.disconnect() };
	}

	function countUp(node: HTMLElement, stat: Stat) {
		const format = (value: number) => (stat.decimals ? value.toFixed(stat.decimals) : Math.round(value).toString()) + stat.suffix;

		if (prefersReducedMotion()) {
			node.textContent = format(stat.value);
			return {};
		}

		let done = false;
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting && !done) {
						done = true;
						const duration = 1200;
						const start = performance.now();
						const tick = (now: number) => {
							const progress = Math.min(1, (now - start) / duration);
							const eased = 1 - Math.pow(1 - progress, 3);
							node.textContent = format(stat.value * eased);
							if (progress < 1) requestAnimationFrame(tick);
						};
						requestAnimationFrame(tick);
						io.unobserve(node);
					}
				}
			},
			{ threshold: 0.4 },
		);
		io.observe(node);
		return { destroy: () => io.disconnect() };
	}

	function trackActive(node: HTMLElement, index: number) {
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) activeJob = index;
				}
			},
			{ threshold: 0, rootMargin: '-45% 0px -45% 0px' },
		);
		io.observe(node);
		return { destroy: () => io.disconnect() };
	}
</script>

<svelte:head><title>Experience · Kyle Brooks</title></svelte:head>

<main class="page">
	<div class="container">
		<!-- Hero -->
		<section class="exp-hero">
			<p class="section-tag">Career</p>
			<h1>A decade of shipping software</h1>
			<p class="lede">
				Full-stack, cloud-native, and built to last. Here's the play-by-play.
			</p>
			<a href="#timeline" class="scroll-cue" aria-label="Scroll to timeline">
				<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 5v14M5 12l7 7 7-7" />
				</svg>
			</a>
		</section>

		<!-- Stats -->
		<section class="stats-grid">
			{#each stats as stat}
				<div class="reveal stat-card">
					<span class="stat-number" use:countUp={stat}>0{stat.suffix}</span>
					<span class="stat-label">{stat.label}</span>
				</div>
			{/each}
		</section>
	</div>

	<!-- Timeline -->
	<section class="timeline-wrap" id="timeline">
		<div class="timeline-inner">
			<p class="section-tag">Experience</p>
			<h2 class="timeline-heading">Where I've been</h2>

			{#each jobs as job, i}
				<article class="job" class:active={activeJob === i} use:trackActive={i}>
					<div class="job-sticky">
						<span class="job-index">0{i + 1}</span>
						<h3 class="job-company">{job.company}</h3>
						<p class="job-role">{job.role}</p>
						<p class="job-meta">{job.location} · {job.start} – {job.end}</p>
					</div>
					<ul class="job-bullets">
						{#each job.bullets as bullet, bi}
							<li class="reveal" use:reveal={{ delay: bi * 60 }}>{bullet}</li>
						{/each}
					</ul>
				</article>
			{/each}
		</div>
	</section>

	<div class="container">
		<!-- Skills -->
		<section class="skills-section">
			<p class="section-tag">Toolbox</p>
			<h2>Technical Skills</h2>
			<div class="skill-groups">
				{#each skillGroups as group, gi}
					<div class="reveal skill-group" use:reveal={{ delay: gi * 80 }}>
						<h3>{group.label}</h3>
						<div class="skill-tags">
							{#each group.items as item}
								<span class="badge">{item}</span>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<hr class="divider" />

		<!-- Education -->
		<section class="reveal education-section" use:reveal>
			<p class="section-tag">Education</p>
			<div class="card">
				<h3 style="font-size: 1.05rem; margin-bottom: 0.25rem;">B.S. in Computer Science</h3>
				<p style="color: var(--text-muted);">College of Charleston, Charleston, SC · 2016</p>
			</div>
		</section>

		<!-- CTA -->
		<section class="cta-section">
			<h2 style="font-size: 1.6rem; margin-bottom: 1.25rem;">Let's build something.</h2>
			<div style="display:flex; gap:0.75rem; flex-wrap:wrap; justify-content:center;">
				<a href="/resume.pdf" class="btn" download>Download Resume</a>
				<a href="/contact" class="btn btn-outline">Get in touch</a>
			</div>
		</section>
	</div>
</main>

<style>
	/* ── Reveal primitive ── */
	.reveal {
		opacity: 1;
		transform: none;
	}
	@media (prefers-reduced-motion: no-preference) {
		.reveal {
			transition: opacity 0.6s ease, transform 0.6s ease;
		}
		.reveal:not(.is-visible) {
			opacity: 0;
			transform: translateY(18px);
		}
	}

	/* ── Hero ── */
	.exp-hero {
		padding: 3rem 0 3.5rem;
		text-align: center;
	}
	.exp-hero h1 {
		font-size: clamp(2rem, 5vw, 3rem);
		margin-bottom: 0.75rem;
	}
	.exp-hero .lede {
		font-size: 1.1rem;
		color: var(--text-muted);
		max-width: 480px;
		margin: 0 auto 2rem;
	}

	.scroll-cue {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		color: var(--text-muted);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.scroll-cue:hover {
		color: var(--accent);
		text-decoration: none;
	}
	@media (prefers-reduced-motion: no-preference) {
		.scroll-cue svg {
			animation: bounce 1.6s ease-in-out infinite;
		}
	}
	@keyframes bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(5px); }
	}

	/* ── Stats ── */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 1rem;
		margin-bottom: 4rem;
	}
	.stat-card {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		text-align: center;
		padding: 1.5rem 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--card-bg);
	}
	.stat-number {
		font-size: clamp(1.75rem, 4vw, 2.4rem);
		font-weight: 800;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
	}
	.stat-label {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	/* ── Timeline ── */
	.timeline-wrap {
		background: var(--bg-secondary);
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
		padding: 4rem 1.25rem 5rem;
	}
	.timeline-inner {
		max-width: 1000px;
		margin: 0 auto;
	}
	.timeline-heading {
		font-size: 1.75rem;
		margin-bottom: 3rem;
	}

	.job {
		display: grid;
		grid-template-columns: 220px 1fr;
		gap: 3rem;
		border-left: 3px solid var(--border);
		padding: 0 0 4rem 2rem;
		transition: border-color 0.4s ease;
	}
	.job:last-child { padding-bottom: 0; }
	.job.active { border-left-color: var(--accent); }

	.job-sticky {
		position: sticky;
		top: 90px;
		align-self: start;
		height: max-content;
	}

	.job-index {
		display: block;
		font-size: 2.75rem;
		font-weight: 800;
		color: var(--border);
		line-height: 1;
		margin-bottom: 0.75rem;
		transition: color 0.4s ease;
	}
	.job.active .job-index { color: var(--accent); }

	.job-company {
		font-size: 1.3rem;
		margin-bottom: 0.15rem;
	}
	.job-role {
		font-weight: 600;
		color: var(--text-muted);
		margin-bottom: 0.35rem;
	}
	.job-meta {
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.job-bullets {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}
	.job-bullets li {
		position: relative;
		padding-left: 1.1rem;
		color: var(--text);
		line-height: 1.55;
	}
	.job-bullets li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.55em;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent);
	}

	@media (max-width: 700px) {
		.job {
			grid-template-columns: 1fr;
			gap: 1.25rem;
		}
		.job-sticky {
			position: static;
			padding-bottom: 1rem;
			border-bottom: 1px solid var(--border);
		}
		.job-index { font-size: 2rem; margin-bottom: 0.5rem; }
	}

	/* ── Skills ── */
	.skills-section {
		padding: 4.5rem 0 3.5rem;
	}
	.skills-section h2 {
		font-size: 1.5rem;
		margin-bottom: 2rem;
	}
	.skill-groups {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.75rem;
	}
	.skill-group h3 {
		font-size: 0.95rem;
		margin-bottom: 0.75rem;
	}
	.skill-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	/* ── Education ── */
	.education-section {
		padding: 2.5rem 0;
	}

	/* ── CTA ── */
	.cta-section {
		padding: 4rem 0 5rem;
		text-align: center;
	}
</style>
