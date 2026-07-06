<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';

	let { image }: { image: { id: string; caption: string } } = $props();

	let caption = $state(untrack(() => image.caption));
	let saving = $state(false);
	const dirty = $derived(caption !== image.caption);
</script>

<form
	method="POST"
	action="?/updateCaption"
	style="display:flex;gap:0.3rem;width:100%;"
	use:enhance={() => {
		saving = true;
		return async ({ update }) => {
			await update({ reset: false });
			saving = false;
		};
	}}
>
	<input type="hidden" name="imageId" value={image.id} />
	<input
		name="caption"
		type="text"
		bind:value={caption}
		placeholder="Caption"
		style="flex:1;min-width:0;font-size:0.75rem;padding:0.25rem 0.4rem;"
	/>
	{#if dirty}
		<button
			type="submit"
			class="btn btn-outline"
			style="font-size:0.7rem;padding:0.2rem 0.5rem;flex-shrink:0;"
			disabled={saving}
		>
			{saving ? '…' : 'Save'}
		</button>
	{/if}
</form>
