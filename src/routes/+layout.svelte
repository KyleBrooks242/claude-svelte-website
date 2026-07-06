<script lang="ts">
	import '../app.css';
	import { page, navigating } from '$app/stores';

	let { children } = $props();

	// Theme is set synchronously in app.html (before first paint) to avoid a flash;
	// this just mirrors that already-applied value for the toggle button's icon.
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
		{ href: '/projects', label: 'Projects' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/contact', label: 'Contact' },
	];
</script>

{#if $navigating}
	<div class="loading-bar"></div>
{/if}

<nav>
	<div class="nav-inner">
		<a href="/" class="nav-brand" onclick={closeMenu}>Kyle Brooks</a>

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
			<button class="theme-btn" onclick={toggleTheme} aria-label="Toggle theme">
				{#if theme === 'dark'}
					<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="4" />
						<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
					</svg>
				{/if}
			</button>
			<button
				class="nav-toggle"
				aria-label="Toggle menu"
				onclick={() => (menuOpen = !menuOpen)}
			>
				{menuOpen ? '✕' : '☰'}
			</button>
		</div>
	</div>
</nav>

{@render children()}

<footer>
	<div class="container" style="padding: 2rem 1.25rem; text-align: center; color: var(--text-muted); font-size: 0.85rem; border-top: 1px solid var(--border);">
		© {new Date().getFullYear()} Kyle Brooks · Built with SvelteKit
	</div>
</footer>
