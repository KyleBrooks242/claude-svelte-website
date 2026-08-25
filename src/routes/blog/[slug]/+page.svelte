<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
	import type { PageData } from './$types';
	import { Turnstile } from 'svelte-turnstile';
	import IconArrowLeft from '~icons/teenyicons/arrow-left-outline';

	let { data }: { data: PageData } = $props();
	const post = $derived(data.post);
	const comments = $derived(data.comments);
	const html = $derived(data.html);

	let submitting = $state(false);
	let reset = $state<() => void>();
	let success = $state(false);
	let errorMessage = $state<string | null>(null);

	function formatDate(iso: string | null) {
		if (!iso) return '';
		return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;

		submitting = true;
		success = false;
		errorMessage = null;

		try {
			const res = await fetch(`/blog/${post.slug}/comment`, { method: 'POST', body: new FormData(form) });
			const result = await res.json();

			if (result.success) {
				success = true;
				form.reset();
				await invalidateAll();
			} else {
				errorMessage = result.message ?? 'Something went wrong. Please try again.';
			}
		} catch {
			errorMessage = 'Something went wrong. Please try again.';
		} finally {
			submitting = false;
			reset?.();
		}
	}
</script>

<svelte:head>
	<title>{post.title} · Kyle Brooks</title>
</svelte:head>

<main class="page">
	<div class="container">
		<a href="/blog" style="font-size:0.85rem;color:var(--text-muted);display:inline-flex;align-items:center;gap:0.3rem;margin-bottom:2rem;">
			<IconArrowLeft width="0.9em" height="0.9em" /> Back to blog
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

		<hr class="divider" />

		<section>
			<p class="section-tag">Comments</p>

			{#if comments.length}
				<ul class="comment-list">
					{#each comments as comment}
						<li class="card comment">
							<div class="comment-meta">
								<span class="comment-name">{comment.name}</span>
								<time>{formatDate(comment.createdAt)}</time>
							</div>
							<p class="comment-body">{comment.comment}</p>
						</li>
					{/each}
				</ul>
			{:else}
				<p style="color:var(--text-muted);font-size:0.9rem;">No comments yet.</p>
			{/if}

			<div class="comment-form-wrap">
				<h3 style="font-size:1.05rem;margin-bottom:1rem;">Leave a comment</h3>

				{#if success}
					<p style="color:var(--status-good);font-size:0.9rem;margin-bottom:1rem;">Comment posted — thanks!</p>
				{/if}

				<form method="POST" onsubmit={handleSubmit}>
					<!-- honeypot field, hidden from real users -->
					<div style="position:absolute;left:-9999px;" aria-hidden="true">
						<label>
							Company
							<input type="text" name="company" tabindex="-1" autocomplete="off" />
						</label>
					</div>

					{#if errorMessage}
						<p style="color:var(--status-bad);margin-bottom:1rem;font-size:0.9rem;">{errorMessage}</p>
					{/if}

					<div class="form-group">
						<label for="comment-name">Name</label>
						<input id="comment-name" name="name" type="text" required maxlength="50" />
					</div>

					<div class="form-group">
						<label for="comment-body">Comment</label>
						<textarea id="comment-body" name="comment" rows="4" required maxlength="500"></textarea>
					</div>

					<Turnstile siteKey={PUBLIC_TURNSTILE_SITE_KEY} bind:reset theme="auto"/>

					<button type="submit" class="btn" disabled={submitting}>
						{submitting ? 'Posting…' : 'Add comment'}
					</button>
				</form>
			</div>
		</section>
	</div>
</main>

<style>
	.comment-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.comment {
		padding: 1.1rem 1.5rem;
	}
	.comment-meta {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}
	.comment-name {
		font-weight: 600;
	}
	.comment-meta time {
		color: var(--text-muted);
	}
	.comment-body {
		color: var(--text-muted);
		line-height: 1.6;
		white-space: pre-wrap;
	}
	.comment-form-wrap {
		max-width: 480px;
		margin-top: 2rem;
	}
</style>
