<script lang="ts">
	import { enhance } from '$app/forms';
	import ProjectForm from '$lib/ProjectForm.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	const errors = $derived((form as { errors?: Record<string, string> })?.errors ?? {});
	let submitting = $state(false);
</script>

<svelte:head><title>New Project · Admin</title></svelte:head>

<main class="page">
	<div class="container" style="max-width:700px;">
		<a href="/admin/projects" style="font-size:0.85rem;color:var(--text-muted);display:inline-block;margin-bottom:1.5rem;">← Back to projects</a>
		<h1 style="font-size:1.75rem;margin-bottom:2rem;">New Project</h1>

		<form method="POST" use:enhance={() => {
			submitting = true;
			return async ({ update }) => { await update(); submitting = false; };
		}}>
			<ProjectForm {errors} />
			<div style="display:flex;gap:0.75rem;margin-top:1.5rem;">
				<button type="submit" class="btn" disabled={submitting}>{submitting ? 'Saving…' : 'Save project'}</button>
				<a href="/admin/projects" class="btn btn-outline">Cancel</a>
			</div>
		</form>
	</div>
</main>
