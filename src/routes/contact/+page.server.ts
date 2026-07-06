import { db } from '$lib/db';
import { messages } from '$lib/schema';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = (data.get('name') as string ?? '').trim();
		const email = (data.get('email') as string ?? '').trim();
		const body = (data.get('body') as string ?? '').trim();

		// Honeypot: bots tend to fill every field, real users never see or fill this one.
		if ((data.get('company') as string ?? '') !== '') {
			return { success: true };
		}

		if (!name || !email || !body) {
			return fail(400, { message: 'All fields are required.', name, email, body });
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, { message: 'Enter a valid email address.', name, email, body });
		}

		await db.insert(messages).values({ name, email, body });

		return { success: true };
	},
};
