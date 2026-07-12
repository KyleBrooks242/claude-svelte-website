<script lang="ts">
	let canvasEl: HTMLCanvasElement | undefined = $state();

	const glyphs = '0アイウエ1オカキクケコ23サシスセソタ4チツテトナ56ニヌネノハヒフヘ7ホマミムメ8モヤユヨ9ラリルレロワン';
	const fontSize = 16;
	const columnSpacing = fontSize * 1.6;
	const fallSpeed = 1;

	$effect(() => {
		if (!canvasEl) return;

		const canvas = canvasEl;
		const context2d = canvas.getContext('2d');
		if (!context2d) return;
		const ctx: CanvasRenderingContext2D = context2d;

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		let drops: number[] = [];

		function resize() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			const columns = Math.floor(canvas.width / columnSpacing);
			drops = Array.from({ length: columns }, () => Math.random() * -50);
		}
		resize();
		window.addEventListener('resize', resize);

		let frameId: number;
		let lastTime = 0;
		const frameInterval = reduceMotion ? 1000 / 6 : 1000 / 14;

		function tick(time: number) {
			frameId = requestAnimationFrame(tick);
			if (time - lastTime < frameInterval) return;
			lastTime = time;

			const styles = getComputedStyle(document.documentElement);
			const bg = styles.getPropertyValue('--bg').trim() || '#ffffff';
			const accent = styles.getPropertyValue('--accent').trim() || '#6366f1';

			ctx.globalAlpha = 0.1;
			ctx.fillStyle = bg;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.globalAlpha = 1;
			ctx.fillStyle = accent;
			ctx.font = `${fontSize}px monospace`;

			for (let i = 0; i < drops.length; i++) {
				const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
				ctx.fillText(glyph, i * columnSpacing, drops[i] * fontSize);

				if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
					drops[i] = 0;
				}
				drops[i] += fallSpeed;
			}
		}
		frameId = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frameId);
			window.removeEventListener('resize', resize);
		};
	});
</script>

<canvas bind:this={canvasEl} class="matrix-rain" aria-hidden="true"></canvas>

<style>
	.matrix-rain {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
	}
</style>
