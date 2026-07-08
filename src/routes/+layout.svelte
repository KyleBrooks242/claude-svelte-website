<script lang="ts">
	import '../app.css';
	import { page, navigating } from '$app/stores';

	let { children } = $props();

	// Theme/palette are set synchronously in app.html (before first paint) to avoid a flash;
	// this just mirrors those already-applied values for the toggle button's icon and swatches.
	let theme = $state<'light' | 'dark'>('light');
	let palette = $state('indigo');
	let menuOpen = $state(false);
	let paletteMenuOpen = $state(false);

	const palettes = [
		{ id: 'indigo', label: 'Indigo', color: '#6366f1' },
		{ id: 'ocean', label: 'Ocean', color: '#0ea5e9' },
		{ id: 'forest', label: 'Forest', color: '#16a34a' },
		{ id: 'sunset', label: 'Sunset', color: '#ea580c' },
		{ id: 'berry', label: 'Berry', color: '#db2777' },
	];

	const currentPaletteColor = $derived(
		palettes.find((p) => p.id === palette)?.color ?? palettes[0].color,
	);

	$effect(() => {
		theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
		palette = document.documentElement.getAttribute('data-palette') || 'indigo';
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}

	function setPalette(id: string) {
		palette = id;
		document.documentElement.setAttribute('data-palette', id);
		localStorage.setItem('palette', id);
		paletteMenuOpen = false;
	}

	function closeMenu() { menuOpen = false; }

	$effect(() => {
		$page.url.pathname;
		menuOpen = false;
		paletteMenuOpen = false;
	});

	$effect(() => {
		if (!paletteMenuOpen) return;
		function handleClickOutside(e: MouseEvent) {
			if (!(e.target as HTMLElement).closest('.palette-dropdown')) {
				paletteMenuOpen = false;
			}
		}
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
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
			<div class="palette-dropdown">
				<button
					type="button"
					class="palette-dropdown-btn"
					aria-haspopup="true"
					aria-expanded={paletteMenuOpen}
					aria-label="Theme settings"
					onclick={() => (paletteMenuOpen = !paletteMenuOpen)}
				>
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
					<span class="palette-dropdown-btn-swatch" style="background:{currentPaletteColor};"></span>
				</button>
				{#if paletteMenuOpen}
					<div class="palette-dropdown-panel">
						<div class="theme-toggle-row">
							<span class="theme-toggle-label">
								{#if theme === 'light'}
									<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<circle cx="12" cy="12" r="4" />
										<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
									</svg>
								{:else}
									<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
									</svg>
								{/if}
							</span>
							<button
								type="button"
								class="switch"
								role="switch"
								aria-checked={theme === 'dark'}
								aria-label="Toggle dark mode"
								onclick={toggleTheme}
							>
								<span class="switch-thumb"></span>
							</button>
						</div>
						<div class="palette-dropdown-divider"></div>
						<div class="palette-swatch-row" role="radiogroup" aria-label="Color palette">
							{#each palettes as p}
								<button
									type="button"
									class="palette-swatch"
									class:active={palette === p.id}
									style="background:{p.color};"
									role="radio"
									aria-checked={palette === p.id}
									aria-label={p.label}
									title={p.label}
									onclick={() => setPalette(p.id)}
								></button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
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
