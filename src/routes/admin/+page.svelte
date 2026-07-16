<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const posts = $derived(data.posts);
	let pendingId = $state<string | null>(null);

	function formatDate(iso: string | null) {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<svelte:head><title>Admin · Kyle Brooks</title></svelte:head>

<main class="page">
	<div class="container">
		<div style="margin-bottom:2.5rem;">
			<p class="section-tag">Admin</p>
			<div style="display:flex;gap:0.5rem;margin-top:0.75rem;border-bottom:1px solid var(--border);padding-bottom:0;">
				<a href="/admin" style="padding:0.4rem 1rem;font-size:0.9rem;font-weight:600;border-bottom:2px solid var(--accent);color:var(--accent);text-decoration:none;">Blog Posts</a>
				<a href="/admin/projects" style="padding:0.4rem 1rem;font-size:0.9rem;font-weight:600;border-bottom:2px solid transparent;color:var(--text-muted);text-decoration:none;">Projects</a>
				<a href="/admin/messages" style="padding:0.4rem 1rem;font-size:0.9rem;font-weight:600;border-bottom:2px solid transparent;color:var(--text-muted);text-decoration:none;">Messages</a>
				<a href="/admin/exercise-prs" style="padding:0.4rem 1rem;font-size:0.9rem;font-weight:600;border-bottom:2px solid transparent;color:var(--text-muted);text-decoration:none;">Exercise PRs</a>
			</div>
		</div>

		<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:2rem;">
			<h2 style="font-size:1.25rem;">Blog Posts</h2>
			<a href="/admin/posts/new" class="btn">+ New post</a>
		</div>

		{#if posts.length === 0}
			<p style="color:var(--text-muted);">No posts yet. <a href="/admin/posts/new">Create one →</a></p>
		{:else}
			<div style="display:flex;flex-direction:column;gap:0.75rem;">
				{#each posts as post}
					<div class="card" style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
						<div style="flex:1;min-width:0;">
							<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.2rem;">
								<span
									class="badge"
									style="color:{post.status === 'published' ? '#22c55e' : '#f59e0b'};
										   border-color:{post.status === 'published' ? '#22c55e33' : '#f59e0b33'};
										   background:{post.status === 'published' ? '#22c55e11' : '#f59e0b11'};"
								>
									{post.status}
								</span>
								<span style="font-size:0.8rem;color:var(--text-muted);">
									{post.status === 'published' ? `Published ${formatDate(post.publishedAt)}` : `Updated ${formatDate(post.updatedAt)}`}
								</span>
							</div>
							<p style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{post.title}</p>
							<p style="font-size:0.8rem;color:var(--text-muted);">/blog/{post.slug}</p>
						</div>

						<div style="display:flex;gap:0.5rem;flex-shrink:0;flex-wrap:wrap;">
							<a href="/admin/posts/{post.id}/edit" class="btn btn-outline" style="font-size:0.8rem;padding:0.35rem 0.8rem;">Edit</a>

							<form method="POST" action="?/{post.status === 'published' ? 'unpublish' : 'publish'}" style="display:contents;"
								use:enhance={() => {
									pendingId = post.id + '-status';
									return async ({ update }) => { await update(); pendingId = null; };
								}}
							>
								<input type="hidden" name="id" value={post.id} />
								<button type="submit" class="btn btn-outline" style="font-size:0.8rem;padding:0.35rem 0.8rem;" disabled={pendingId === post.id + '-status'}>
									{pendingId === post.id + '-status' ? 'Saving…' : post.status === 'published' ? 'Make Draft' : 'Publish'}
								</button>
							</form>

							<form method="POST" action="?/delete" style="display:contents;"
								onsubmit={(e) => { if (!confirm('Delete this post?')) e.preventDefault(); }}
								use:enhance={() => {
									pendingId = post.id + '-delete';
									return async ({ update }) => { await update(); pendingId = null; };
								}}
							>
								<input type="hidden" name="id" value={post.id} />
								<button type="submit" class="btn" style="font-size:0.8rem;padding:0.35rem 0.8rem;background:#ef4444;" disabled={pendingId === post.id + '-delete'}>
									{pendingId === post.id + '-delete' ? 'Deleting…' : 'Delete'}
								</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>
