<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const messages = $derived(data.messages);
	let pendingId = $state<string | null>(null);

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
	}
</script>

<svelte:head><title>Messages · Admin</title></svelte:head>

<main class="page">
	<div class="container">
		<div style="margin-bottom:2.5rem;">
			<p class="section-tag">Admin</p>
			<div style="display:flex;gap:0.5rem;margin-top:0.75rem;border-bottom:1px solid var(--border);padding-bottom:0;">
				<a href="/admin" style="padding:0.4rem 1rem;font-size:0.9rem;font-weight:600;border-bottom:2px solid transparent;color:var(--text-muted);text-decoration:none;">Blog Posts</a>
				<a href="/admin/projects" style="padding:0.4rem 1rem;font-size:0.9rem;font-weight:600;border-bottom:2px solid transparent;color:var(--text-muted);text-decoration:none;">Projects</a>
				<a href="/admin/messages" style="padding:0.4rem 1rem;font-size:0.9rem;font-weight:600;border-bottom:2px solid var(--accent);color:var(--accent);text-decoration:none;">Messages</a>
			</div>
		</div>

		<h2 style="font-size:1.25rem;margin-bottom:2rem;">Contact Messages</h2>

		{#if messages.length === 0}
			<p style="color:var(--text-muted);">No messages yet.</p>
		{:else}
			<div style="display:flex;flex-direction:column;gap:0.75rem;">
				{#each messages as msg}
					<div class="card" style="opacity:{msg.read ? 0.65 : 1};">
						<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.5rem;">
							<div>
								<span style="font-weight:600;">{msg.name}</span>
								<a href="mailto:{msg.email}" style="margin-left:0.5rem;font-size:0.85rem;color:var(--text-muted);">{msg.email}</a>
							</div>
							<span style="font-size:0.8rem;color:var(--text-muted);">{formatDate(msg.createdAt)}</span>
						</div>

						<p style="white-space:pre-wrap;margin-bottom:1rem;">{msg.body}</p>

						<div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
							{#if !msg.read}
								<form method="POST" action="?/markRead" style="display:contents;"
									use:enhance={() => {
										pendingId = msg.id + '-read';
										return async ({ update }) => { await update(); pendingId = null; };
									}}
								>
									<input type="hidden" name="id" value={msg.id} />
									<button type="submit" class="btn btn-outline" style="font-size:0.8rem;padding:0.35rem 0.8rem;" disabled={pendingId === msg.id + '-read'}>
										{pendingId === msg.id + '-read' ? 'Saving…' : 'Mark read'}
									</button>
								</form>
							{/if}

							<form method="POST" action="?/delete" style="display:contents;"
								onsubmit={(e) => { if (!confirm('Delete this message?')) e.preventDefault(); }}
								use:enhance={() => {
									pendingId = msg.id + '-delete';
									return async ({ update }) => { await update(); pendingId = null; };
								}}
							>
								<input type="hidden" name="id" value={msg.id} />
								<button type="submit" class="btn" style="font-size:0.8rem;padding:0.35rem 0.8rem;background:#ef4444;" disabled={pendingId === msg.id + '-delete'}>
									{pendingId === msg.id + '-delete' ? 'Deleting…' : 'Delete'}
								</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>
