import { db } from '$lib/db';
import { messages } from '$lib/schema';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db.select().from(messages).orderBy(desc(messages.createdAt));

	return {
		messages: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
	};
};

export const actions: Actions = {
	markRead: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'Missing id' });

		await db.update(messages).set({ read: true }).where(eq(messages.id, id));
		return { success: true };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'Missing id' });

		await db.delete(messages).where(eq(messages.id, id));
		return { success: true };
	},
};
