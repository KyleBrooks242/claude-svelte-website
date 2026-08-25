import { error, json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { postComments, posts } from '$lib/schema';
import { eq, and, count, gt } from 'drizzle-orm';
import { TURNSTILE_SECRET_KEY } from '$env/static/private';
import { revalidatePath } from '$lib/cache';
import type { RequestHandler } from './$types';

const NAME_MAX = 50;
const COMMENT_MAX = 500;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export const POST: RequestHandler = async ({ request, params, getClientAddress, url, fetch }) => {
	const data = await request.formData();
	const name = (data.get('name') as string ?? '').trim();
	const comment = (data.get('comment') as string ?? '').trim();
	const turnstileToken = (data.get('cf-turnstile-response') as string ?? '');

	// Honeypot: bots tend to fill every field, real users never see or fill this one.
	if ((data.get('company') as string ?? '') !== '') {
		return json({ success: true });
	}

	if (!name || !comment) {
		return json({ success: false, message: 'Name and comment are required.' }, { status: 400 });
	}
	if (name.length > NAME_MAX || comment.length > COMMENT_MAX) {
		return json({ success: false, message: 'One or more fields are too long.' }, { status: 400 });
	}

	const [post] = await db
		.select({ id: posts.id })
		.from(posts)
		.where(and(eq(posts.slug, params.slug), eq(posts.status, 'published')))
		.limit(1);

	if (!post) throw error(404, 'Post not found');

	const ip = getClientAddress();

	if (!turnstileToken) {
		return json({ success: false, message: 'Please complete the verification challenge.' }, { status: 400 });
	}
	const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: turnstileToken, remoteip: ip }),
	});
	const verifyData = (await verifyRes.json()) as { success: boolean };
	if (!verifyData.success) {
		return json({ success: false, message: 'Verification failed. Please try again.' }, { status: 400 });
	}

	const cutoff = new Date(Date.now() - RATE_WINDOW_MS);
	const [{ value: recentCount }] = await db
		.select({ value: count() })
		.from(postComments)
		.where(and(eq(postComments.ip, ip), gt(postComments.createdAt, cutoff)));

	if (recentCount >= RATE_LIMIT) {
		return json({ success: false, message: 'Too many comments posted recently. Please try again later.' }, { status: 429 });
	}

	await db.insert(postComments).values({ postId: post.id, name, comment, ip });

	// This route has no isr config, so this request always reaches the DB —
	// but the sibling page load is ISR-cached, so bust it here or the new
	// comment won't show up until the next admin cache clear or TTL expiry.
	await revalidatePath(url.origin, `/blog/${params.slug}`, fetch);

	return json({ success: true });
};
