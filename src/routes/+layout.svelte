<script lang="ts">
	import '../app.css';
	import { page, navigating } from '$app/stores';
	import IconSun from '~icons/teenyicons/sun-outline';
	import IconMoon from '~icons/teenyicons/moon-outline';
	import IconMenu from '~icons/teenyicons/menu-outline';
	import IconClose from '~icons/teenyicons/x-outline';

	let { children } = $props();

	// Theme is set synchronously in app.html (before first paint) to avoid a flash;
	// this just mirrors the already-applied value for the toggle button's icon.
	let theme = $state<'light' | 'dark'>('light');
	let menuOpen = $state(false);

	$effect(() => {
		theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}

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

		<div style="display:flex;align-items:center;gap:0.75rem;">
			<button
				type="button"
				class="theme-toggle-btn"
				aria-label="Toggle dark mode"
				onclick={toggleTheme}
			>
				{#if theme === 'dark'}
					<IconSun width={15} height={15} />
				{:else}
					<IconMoon width={15} height={15} />
				{/if}
			</button>
			<button
				class="nav-toggle"
				aria-label="Toggle menu"
				onclick={() => (menuOpen = !menuOpen)}
			>
				{#if menuOpen}
					<IconClose width={17} height={17} />
				{:else}
					<IconMenu width={17} height={17} />
				{/if}
			</button>
		</div>
	</div>
</nav>

{@render children()}

<footer>
	<div class="container" style="padding: 2rem 1.25rem; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.78rem; border-top: 1px solid var(--border);">
		© {new Date().getFullYear()} Kyle Brooks · Built with SvelteKit
	</div>
</footer>
