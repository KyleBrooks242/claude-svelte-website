<script lang="ts">
	let { src, alt }: { src: string; alt: string } = $props();

	let loaded = $state(false);
	let imgEl: HTMLImageElement | undefined = $state();

	$effect(() => {
		if (imgEl?.complete) loaded = true;
	});
</script>

<div class="img-skeleton-wrap">
	{#if !loaded}
		<div class="img-skeleton"></div>
	{/if}
	<img
		bind:this={imgEl}
		{src}
		{alt}
		class="img-skeleton-img"
		class:loaded
		onload={() => (loaded = true)}
		onerror={() => (loaded = true)}
	/>
</div>

<style>
	.img-skeleton-wrap {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.img-skeleton {
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--border) 50%, var(--bg-secondary) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.4s ease-in-out infinite;
	}

	.img-skeleton-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.img-skeleton-img.loaded {
		opacity: 1;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.img-skeleton {
			animation: none;
		}
	}
</style>
