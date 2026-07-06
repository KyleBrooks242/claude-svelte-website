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
				{theme === 'dark' ? '☀️' : '🌙'}
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
