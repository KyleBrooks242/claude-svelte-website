<script lang="ts">
	type Status = 'idle' | 'sending' | 'success' | 'error';

	let name = $state('');
	let email = $state('');
	let message = $state('');
	let status = $state<Status>('idle');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		status = 'sending';
		// Simulate a send (wire up a real endpoint or Formspree/Resend here)
		await new Promise((r) => setTimeout(r, 1000));
		status = 'success';
		name = '';
		email = '';
		message = '';
	}
</script>

<svelte:head><title>Contact · Kyle Brooks</title></svelte:head>

<main class="page">
	<div class="container">
		<div style="max-width: 560px;">
			<p class="section-tag">Get in touch</p>
			<h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Contact</h1>
			<p style="color: var(--text-muted); margin-bottom: 2.5rem;">
				Have a project in mind, a question, or just want to say hi?
				Fill in the form below or reach out directly at
				<a href="mailto:kyle.brooks242@gmail.com">kyle.brooks242@gmail.com</a>.
			</p>

			{#if status === 'success'}
				<div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem;text-align:center;">
					<p style="font-size:1.5rem;margin-bottom:0.5rem;">✓</p>
					<p style="font-weight:600;margin-bottom:0.25rem;">Message sent!</p>
					<p style="color:var(--text-muted);font-size:0.9rem;">I'll get back to you as soon as I can.</p>
					<button class="btn" style="margin-top:1rem;" onclick={() => (status = 'idle')}>Send another</button>
				</div>
			{:else}
				<form onsubmit={handleSubmit}>
					<div class="form-row">
						<div class="form-group">
							<label for="name">Name</label>
							<input id="name" type="text" bind:value={name} required placeholder="Jane Smith" />
						</div>
						<div class="form-group">
							<label for="email">Email</label>
							<input id="email" type="email" bind:value={email} required placeholder="jane@example.com" />
						</div>
					</div>

					<div class="form-group">
						<label for="message">Message</label>
						<textarea id="message" bind:value={message} required placeholder="What's on your mind?"></textarea>
					</div>

					{#if status === 'error'}
						<p style="color:#ef4444;font-size:0.85rem;margin-bottom:0.75rem;">
							Something went wrong — please try again or email directly.
						</p>
					{/if}

					<button type="submit" class="btn" disabled={status === 'sending'}>
						{status === 'sending' ? 'Sending…' : 'Send message'}
					</button>
				</form>
			{/if}

			<hr class="divider" style="margin-top:3rem;" />

			<!-- Social links -->
			<div style="display:flex;gap:1rem;flex-wrap:wrap;">
				<a href="https://github.com" class="btn btn-outline" style="font-size:0.85rem;">GitHub</a>
				<a href="https://linkedin.com" class="btn btn-outline" style="font-size:0.85rem;">LinkedIn</a>
				<a href="https://twitter.com" class="btn btn-outline" style="font-size:0.85rem;">Twitter / X</a>
			</div>
		</div>
	</div>
</main>

<style>
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	@media (max-width: 480px) {
		.form-row { grid-template-columns: 1fr; }
	}
</style>
