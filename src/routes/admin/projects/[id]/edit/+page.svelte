<script lang="ts">
	import { enhance } from '$app/forms';
	import ProjectForm from '$lib/ProjectForm.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const project = $derived(data.project);
	const images = $derived(data.images);
	const errors = $derived((form as { errors?: Record<string, string> })?.errors ?? {});
	const tagsStr = $derived(project.tags.join(', '));
	let submitting = $state(false);
	let deleting = $state(false);
	let addingImage = $state(false);
	let removingImageId = $state<string | null>(null);
	let newImageUrl = $state('');
	let newImageCaption = $state('');
</script>

<svelte:head><title>Edit: {project.title} · Admin</title></svelte:head>

<main class="page">
	<div class="container" style="max-width:700px;">
		<a href="/admin/projects" style="font-size:0.85rem;color:var(--text-muted);display:inline-block;margin-bottom:1.5rem;">← Back to projects</a>
		<h1 style="font-size:1.75rem;margin-bottom:2rem;">Edit Project</h1>

		<form method="POST" action="?/update" use:enhance={() => {
			submitting = true;
			return async ({ update }) => { await update(); submitting = false; };
		}}>
			<ProjectForm
				kind={project.kind}
				title={project.title}
				description={project.description}
				tags={tagsStr}
				github={project.github ?? ''}
				demo={project.demo ?? ''}
				status={project.status}
				{errors}
			/>
			<div style="display:flex;gap:0.75rem;margin-top:1.5rem;flex-wrap:wrap;">
				<button type="submit" class="btn" disabled={submitting}>{submitting ? 'Saving…' : 'Save changes'}</button>
				<a href="/admin/projects" class="btn btn-outline">Cancel</a>
			</div>
		</form>

		<hr class="divider" style="margin-top:3rem;" />

		<!-- Photos -->
		<div style="margin-bottom:2rem;">
			<h2 style="font-size:1.1rem;font-weight:600;margin-bottom:1.25rem;">Photos</h2>

			{#if images.length > 0}
				<div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-bottom:1.5rem;">
					{#each images as image}
						<div style="display:flex;flex-direction:column;align-items:center;gap:0.4rem;width:100px;">
							<img
								src={image.url}
								alt={image.caption}
								style="width:100px;height:100px;object-fit:cover;border-radius:var(--radius);border:1px solid var(--border);"
							/>
							{#if image.caption}
								<p style="font-size:0.75rem;color:var(--text-muted);text-align:center;word-break:break-word;">{image.caption}</p>
							{/if}
							<form method="POST" action="?/removeImage" style="display:contents;"
								use:enhance={() => {
									removingImageId = image.id;
									return async ({ update }) => { await update(); removingImageId = null; };
								}}
							>
								<input type="hidden" name="imageId" value={image.id} />
								<button type="submit" class="btn btn-outline" style="font-size:0.75rem;padding:0.2rem 0.6rem;border-color:#ef4444;color:#ef4444;" disabled={removingImageId === image.id}>
									{removingImageId === image.id ? '…' : 'Remove'}
								</button>
							</form>
						</div>
					{/each}
				</div>
			{:else}
				<p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1.25rem;">No photos yet.</p>
			{/if}

			<form method="POST" action="?/addImage" style="display:flex;gap:0.5rem;flex-wrap:wrap;"
				use:enhance={() => {
					addingImage = true;
					return async ({ update }) => { await update(); addingImage = false; newImageUrl = ''; newImageCaption = ''; };
				}}
			>
				<input
					name="url"
					type="url"
					bind:value={newImageUrl}
					placeholder="https://res.cloudinary.com/..."
					style="flex:1;min-width:200px;"
				/>
				<input
					name="caption"
					type="text"
					bind:value={newImageCaption}
					placeholder="Caption (optional)"
					style="flex:1;min-width:160px;"
				/>
				<button type="submit" class="btn" disabled={addingImage || !newImageUrl.trim()}>
					{addingImage ? 'Adding…' : 'Add photo'}
				</button>
			</form>
		</div>

		<hr class="divider" />

		<form method="POST" action="?/delete"
			onsubmit={(e) => { if (!confirm('Permanently delete this project?')) e.preventDefault(); }}
			use:enhance={() => {
				deleting = true;
				return async ({ update }) => { await update(); deleting = false; };
			}}
		>
			<button type="submit" class="btn" style="background:#ef4444;font-size:0.85rem;" disabled={deleting}>{deleting ? 'Deleting…' : 'Delete project'}</button>
		</form>
	</div>
</main>
