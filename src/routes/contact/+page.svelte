<script lang="ts">
	import { enhance } from '$app/forms';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Contact · Kyle Brooks</title>
	<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</svelte:head>

<main class="page">
	<div class="container">
		<div style="max-width: 560px;">
			<p class="section-tag">Get in touch</p>
			<h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Profiles</h1>

			<div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom: 2.5rem;">
				<a href="https://github.com/KyleBrooks242" class="btn btn-outline" target="_blank" rel="noopener noreferrer" style="font-size:0.85rem;">GitHub</a>
				<a href="https://www.linkedin.com/in/kyle-brooks-a05053bb/" class="btn btn-outline" target="_blank" rel="noopener noreferrer" style="font-size:0.85rem;">LinkedIn</a>
			</div>

			<h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Contact</h1>

			<p style="color: var(--text-muted); margin-bottom: 2rem;">
				Feel free to reach out about a project, an opportunity, or just to say hi!
			</p>


			{#if form?.success}
				<div class="card" style="margin-bottom: 2rem;">
					<p>Thanks for reaching out! I'll get back to you soon.</p>
				</div>
			{:else}
				<form
					method="POST"
					style="margin-bottom: 2.5rem;"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							await update();
							submitting = false;
							(window as any).turnstile?.reset();
						};
					}}
				>
					<!-- honeypot field, hidden from real users -->
					<div style="position:absolute;left:-9999px;" aria-hidden="true">
						<label>
							Company
							<input type="text" name="company" tabindex="-1" autocomplete="off" />
						</label>
					</div>

					{#if form?.message}
						<p style="color:#ef4444;margin-bottom:1rem;font-size:0.9rem;">{form.message}</p>
					{/if}

					<div class="form-group">
						<label for="name">Name</label>
						<input id="name" name="name" type="text" required maxlength="50" value={form?.name ?? ''} />
					</div>

					<div class="form-group">
						<label for="email">Email</label>
						<input id="email" name="email" type="email" required maxlength="50" value={form?.email ?? ''} />
					</div>

					<div class="form-group">
						<label for="body">Message</label>
						<textarea id="body" name="body" rows="5" required maxlength="500">{form?.body ?? ''}</textarea>
					</div>

					<div class="cf-turnstile" data-sitekey={PUBLIC_TURNSTILE_SITE_KEY} style="margin-bottom:1rem;"></div>

					<button type="submit" class="btn" disabled={submitting}>
						{submitting ? 'Sending…' : 'Send message'}
					</button>
				</form>
			{/if}
		</div>
	</div>
</main>
