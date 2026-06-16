import bcrypt from 'bcryptjs';
import { ADMIN_PASSWORD_HASH } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.isAdmin = false;

	if (event.url.pathname.startsWith('/admin')) {
		const auth = event.request.headers.get('authorization') ?? '';
		const match = auth.match(/^Basic (.+)$/);

		if (match) {
			const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
			const password = decoded.slice(decoded.indexOf(':') + 1);
			event.locals.isAdmin = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
		}

		if (!event.locals.isAdmin) {
			return new Response('Unauthorized', {
				status: 401,
				headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
			});
		}
	}

	return resolve(event);
};
