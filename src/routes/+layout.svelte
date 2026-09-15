<script lang="ts">
	import '../app.css';
	import { page, navigating } from '$app/stores';
	import IconMenu from '~icons/teenyicons/menu-outline';
	import IconClose from '~icons/teenyicons/x-outline';

	let { children } = $props();

	// The site is dark-only — a single committed palette in app.css, no
	// [data-theme] split and no toggle.
	let menuOpen = $state(false);

	function closeMenu() { menuOpen = false; }

	$effect(() => {
		$page.url.pathname;
		menuOpen = false;
	});

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/experience', label: 'Experience' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/exercise', label: 'Exercise' },
		{ href: '/contact', label: 'Contact' },
	];
</script>

{#if $navigating}
	<div class="loading-bar"></div>
{/if}

<nav>
	<div class="nav-inner">
		<a href="/" class="nav-brand" onclick={closeMenu}>
			<span class="nav-brand-mark" aria-hidden="true"></span>
			Kyle Brooks
		</a>

		<div class="nav-menu" class:open={menuOpen}>
			<ul class="nav-links">
				{#each navLinks as link}
					<li>
						<a
							href={link.href}
							class:active={$page.url.pathname === link.href}
							onclick={closeMenu}
						>{link.label}</a>
					</li>
				{/each}
			</ul>
		</div>

		<button
			class="nav-toggle"
			aria-label="Toggle menu"
			aria-expanded={menuOpen}
			onclick={() => (menuOpen = !menuOpen)}
		>
			{#if menuOpen}
				<IconClose width={17} height={17} />
			{:else}
				<IconMenu width={17} height={17} />
			{/if}
		</button>
	</div>
</nav>

{@render children()}

<footer>
	<div class="container" style="padding: 2rem 1.25rem; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.78rem; border-top: 1px solid var(--border);">
		© {new Date().getFullYear()} Kyle Brooks · Built with SvelteKit
	</div>
</footer>
