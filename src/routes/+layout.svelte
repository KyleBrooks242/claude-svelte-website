<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();

	// Theme: read from localStorage, fall back to system preference
	let theme = $state<'light' | 'dark'>('light');
	let menuOpen = $state(false);

	$effect(() => {
		const stored = localStorage.getItem('theme');
		if (stored === 'dark' || stored === 'light') {
			theme = stored;
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			theme = 'dark';
		}
		document.documentElement.setAttribute('data-theme', theme);
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}

	function closeMenu() { menuOpen = false; }

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/contact', label: 'Contact' },
	];
</script>

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
