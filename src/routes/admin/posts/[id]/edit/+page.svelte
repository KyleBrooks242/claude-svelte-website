<script lang="ts">
	import { enhance } from '$app/forms';
	import PostForm from '$lib/PostForm.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const post = $derived(data.post);
	const errors = $derived((form as { errors?: Record<string, string> })?.errors ?? {});
	const tagsStr = $derived(post.tags.join(', '));
	let submitting = $state(false);
	let deleting = $state(false);
</script>

<svelte:head><title>Edit: {post.title} · Admin</title></svelte:head>

<main class="page">
	<div class="container" style="max-width:700px;">
		<a href="/admin" style="font-size:0.85rem;color:var(--text-muted);display:inline-block;margin-bottom:1.5rem;">← Back to posts</a>
		<h1 style="font-size:1.75rem;margin-bottom:2rem;">Edit Post</h1>

		<form method="POST" action="?/update" use:enhance={() => {
				submitting = true;
				return async ({ update }) => { await update(); submitting = false; };
			}}>
			<PostForm
				title={post.title}
				slug={post.slug}
				summary={post.summary}
				tags={tagsStr}
				content={post.content}
				status={post.status}
				{errors}
			/>
			<div style="display:flex;gap:0.75rem;margin-top:1.5rem;flex-wrap:wrap;">
				<button type="submit" class="btn" disabled={submitting}>{submitting ? 'Saving…' : 'Save changes'}</button>
				<a href="/admin" class="btn btn-outline">Cancel</a>
			</div>
		</form>

		<hr class="divider" style="margin-top:3rem;" />

		<form method="POST" action="?/delete"
			onsubmit={(e) => { if (!confirm('Permanently delete this post?')) e.preventDefault(); }}
			use:enhance={() => {
				deleting = true;
				return async ({ update }) => { await update(); deleting = false; };
			}}
		>
			<button type="submit" class="btn" style="background:#ef4444;font-size:0.85rem;" disabled={deleting}>{deleting ? 'Deleting…' : 'Delete post'}</button>
		</form>
	</div>
</main>
