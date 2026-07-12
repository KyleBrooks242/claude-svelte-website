<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	$effect(() => {
		if ($page.status === 404) {
			goto('/', { replaceState: true });
		}
	});
</script>

{#if $page.status !== 404}
	<main class="page">
		<div class="container" style="text-align:center;padding:4rem 1.25rem;">
			<h1 style="font-size:1.5rem;margin-bottom:0.5rem;">Something went wrong</h1>
			<p style="color:var(--text-muted);">{$page.error?.message}</p>
		</div>
	</main>
{/if}
