import { db } from '$lib/db';
import { messages } from '$lib/schema';
import { and, count, eq, gt } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { TURNSTILE_SECRET_KEY } from '$env/static/private';
import type { Actions } from './$types';

const NAME_MAX = 50;
const EMAIL_MAX = 50;
const BODY_MAX = 500;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export const actions: Actions = {
	default: async ({ request, getClientAddress }) => {
		const data = await request.formData();
		const name = (data.get('name') as string ?? '').trim();
		const email = (data.get('email') as string ?? '').trim();
		const body = (data.get('body') as string ?? '').trim();
		const turnstileToken = (data.get('cf-turnstile-response') as string ?? '');

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
		if (name.length > NAME_MAX || email.length > EMAIL_MAX || body.length > BODY_MAX) {
			return fail(400, { message: 'One or more fields are too long.', name, email, body });
		}

		const ip = getClientAddress();

		if (!turnstileToken) {
			return fail(400, { message: 'Please complete the verification challenge.', name, email, body });
		}
		const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: turnstileToken, remoteip: ip }),
		});
		const verifyData = (await verifyRes.json()) as { success: boolean };
		if (!verifyData.success) {
			return fail(400, { message: 'Verification failed. Please try again.', name, email, body });
		}

		const cutoff = new Date(Date.now() - RATE_WINDOW_MS);
		const [{ value: recentCount }] = await db
			.select({ value: count() })
			.from(messages)
			.where(and(eq(messages.ip, ip), gt(messages.createdAt, cutoff)));

		if (recentCount >= RATE_LIMIT) {
			return fail(429, { message: 'Too many messages sent recently. Please try again later.', name, email, body });
		}

		await db.insert(messages).values({ name, email, body, ip });

		return { success: true };
	},
};
