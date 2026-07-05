<script lang="ts">
	interface Props {
		kind?: 'software' | 'woodworking';
		title?: string;
		description?: string;
		tags?: string;
		github?: string;
		demo?: string;
		status?: 'live' | 'wip' | 'archived' | 'complete';
		errors?: Record<string, string>;
	}

	let {
		kind = $bindable<'software' | 'woodworking'>('software'),
		title = $bindable(''),
		description = $bindable(''),
		tags = $bindable(''),
		github = $bindable(''),
		demo = $bindable(''),
		status = $bindable<'live' | 'wip' | 'archived' | 'complete'>('wip'),
		errors = {},
	}: Props = $props();

	function onKindChange() {
		if (kind === 'woodworking' && (status === 'live' || status === 'archived')) {
			status = 'wip';
		} else if (kind === 'software' && status === 'complete') {
			status = 'wip';
		}
	}
</script>

<div style="display:flex;flex-direction:column;gap:1.25rem;">

	<div class="form-group">
		<label for="kind">Kind</label>
		<select id="kind" name="kind" bind:value={kind} onchange={onKindChange}>
			<option value="software">Software</option>
			<option value="woodworking">Woodworking</option>
		</select>
	</div>

	<div class="form-group">
		<label for="title">Title</label>
		<input id="title" name="title" type="text" bind:value={title} required placeholder="Project title" />
		{#if errors.title}<p style="color:#ef4444;font-size:0.8rem;">{errors.title}</p>{/if}
	</div>

	<div class="form-group">
		<label for="description">Description</label>
		<textarea
			id="description"
			name="description"
			bind:value={description}
			placeholder="Brief description of the project."
			style="min-height:100px;"
		></textarea>
	</div>

	<div class="form-group">
		<label for="tags">
			{kind === 'woodworking' ? 'Materials' : 'Tags'}
			<span style="color:var(--text-muted);font-weight:400;">(comma-separated)</span>
		</label>
		<input
			id="tags"
			name="tags"
			type="text"
			bind:value={tags}
			placeholder={kind === 'woodworking' ? 'Hard Maple, Steel hardware' : 'SvelteKit, TypeScript'}
		/>
	</div>

	{#if kind === 'software'}
		<div class="form-group">
			<label for="github">GitHub URL <span style="color:var(--text-muted);font-weight:400;">(optional)</span></label>
			<input id="github" name="github" type="url" bind:value={github} placeholder="https://github.com/..." />
		</div>

		<div class="form-group">
			<label for="demo">Demo URL <span style="color:var(--text-muted);font-weight:400;">(optional)</span></label>
			<input id="demo" name="demo" type="url" bind:value={demo} placeholder="https://..." />
		</div>
	{/if}

	<div class="form-group">
		<label for="status">Status</label>
		<select id="status" name="status" bind:value={status}>
			{#if kind === 'software'}
				<option value="live">Live</option>
				<option value="wip">WIP</option>
				<option value="archived">Archived</option>
			{:else}
				<option value="complete">Complete</option>
				<option value="wip">WIP</option>
			{/if}
		</select>
	</div>

</div>
