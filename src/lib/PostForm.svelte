<script lang="ts">
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
		<label for="content">Content <span style="color:var(--text-muted);font-weight:400;">(Markdown)</span></label>
		<textarea
			id="content"
			name="content"
			bind:value={content}
			placeholder="Write your post in Markdown..."
			style="min-height:400px;font-family:'Fira Code','Cascadia Code',monospace;font-size:0.88rem;"
		></textarea>
	</div>

	<div class="form-group">
		<label for="status">Status</label>
		<select id="status" name="status" bind:value={status}>
			<option value="draft">Draft</option>
			<option value="published">Published</option>
		</select>
	</div>

</div>
