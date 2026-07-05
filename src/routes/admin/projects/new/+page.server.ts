import { db } from '$lib/db';
import { projects } from '$lib/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const kind = ((data.get('kind') as string) ?? 'software') as 'software' | 'woodworking';
		const title = (data.get('title') as string)?.trim();
		const description = (data.get('description') as string)?.trim() ?? '';
		const tagsRaw = (data.get('tags') as string)?.trim() ?? '';
		const github = (data.get('github') as string)?.trim() || null;
		const demo = (data.get('demo') as string)?.trim() || null;
		const status = ((data.get('status') as string) ?? 'wip') as 'live' | 'wip' | 'archived' | 'complete';

		const errors: Record<string, string> = {};
		if (!title) errors.title = 'Title is required';
		if (Object.keys(errors).length) {
			return fail(422, { errors, kind, title, description, tagsRaw, github, demo, status });
		}

		const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [];

		await db.insert(projects).values({ kind, title, description, tags, github, demo, status });
		redirect(303, '/admin/projects');
	},
};
