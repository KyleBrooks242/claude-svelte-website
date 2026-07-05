<script lang="ts">
	import { renderMarkdown } from '$lib/markdown';

	interface Props {
		title?: string;
		slug?: string;
		summary?: string;
		tags?: string;
		content?: string;
		status?: 'draft' | 'published';
		errors?: Record<string, string>;
	}

	let {
		title = $bindable(''),
		slug = $bindable(''),
		summary = $bindable(''),
		tags = $bindable(''),
		content = $bindable(''),
		status = $bindable<'draft' | 'published'>('draft'),
		errors = {},
	}: Props = $props();

	function slugify(s: string) {
		return s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	let autoSlug = $state(slug === '');
	let viewMode = $state<'raw' | 'split' | 'preview'>('raw');
	const previewHtml = $derived(viewMode !== 'raw' ? renderMarkdown(content) : '');

	function onTitleInput() {
		if (autoSlug) slug = slugify(title);
	}

	function onSlugInput() {
		autoSlug = slug === '';
	}
</script>

<div style="display:flex;flex-direction:column;gap:1.25rem;">

	<div class="form-group">
		<label for="title">Title</label>
		<input
			id="title"
			name="title"
			type="text"
			bind:value={title}
			oninput={onTitleInput}
			required
			placeholder="Post title"
		/>
		{#if errors.title}<p style="color:#ef4444;font-size:0.8rem;">{errors.title}</p>{/if}
	</div>

	<div class="form-group">
		<label for="slug">Slug</label>
		<input
			id="slug"
			name="slug"
			type="text"
			bind:value={slug}
			oninput={onSlugInput}
			required
			placeholder="url-friendly-slug"
		/>
		{#if slug}<p style="font-size:0.8rem;color:var(--text-muted);">/blog/{slug}</p>{/if}
		{#if errors.slug}<p style="color:#ef4444;font-size:0.8rem;">{errors.slug}</p>{/if}
	</div>

	<div class="form-group">
		<label for="summary">Summary</label>
		<textarea
			id="summary"
			name="summary"
			bind:value={summary}
			placeholder="One or two sentence description shown on the blog listing."
			style="min-height:80px;"
		></textarea>
	</div>

	<div class="form-group">
		<label for="tags">Tags <span style="color:var(--text-muted);font-weight:400;">(comma-separated)</span></label>
		<input
			id="tags"
			name="tags"
			type="text"
			bind:value={tags}
			placeholder="SvelteKit, TypeScript, CSS"
		/>
	</div>

	<div class="form-group">
		<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
			<label for="content" style="margin:0;">Content <span style="color:var(--text-muted);font-weight:400;">(Markdown)</span></label>
			<div style="display:flex;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;">
				{#each (['raw', 'preview', 'split'] as const) as mode}
					<button
						type="button"
						onclick={() => (viewMode = mode)}
						style="padding:0.25rem 0.75rem;font-size:0.8rem;font-weight:600;border:none;cursor:pointer;background:{viewMode === mode ? 'var(--accent)' : 'transparent'};color:{viewMode === mode ? '#fff' : 'var(--text-muted)'};transition:background 0.15s,color 0.15s;text-transform:capitalize;"
					>{mode}</button>
				{/each}
			</div>
		</div>
		<div style="display:grid;grid-template-columns:{viewMode === 'split' ? '1fr 1fr' : '1fr'};gap:1rem;align-items:start;">
			<textarea
				id="content"
				name="content"
				bind:value={content}
				placeholder="Write your post in Markdown..."
				style="min-height:400px;font-family:'Fira Code','Cascadia Code',monospace;font-size:0.88rem;{viewMode === 'preview' ? 'display:none;' : ''}"
			></textarea>
			{#if viewMode !== 'raw'}
				<div
					class="prose"
					style="min-height:400px;padding:1.25rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg-secondary);overflow:auto;"
				>
					{#if content.trim()}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html previewHtml}
					{:else}
						<p style="color:var(--text-muted);font-style:italic;">Nothing to preview yet.</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<div class="form-group">
		<label for="status">Status</label>
		<select id="status" name="status" bind:value={status}>
			<option value="draft">Draft</option>
			<option value="published">Published</option>
		</select>
	</div>

</div>
