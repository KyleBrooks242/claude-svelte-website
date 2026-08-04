const CLOUDINARY_UPLOAD_RE = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/;

/**
 * Requests a resized, auto-format/quality version via Cloudinary's URL-based
 * transformation API. Project image URLs aren't guaranteed to be Cloudinary
 * (the admin form just accepts any URL), so non-matching hosts pass through
 * unchanged rather than erroring.
 */
export function optimizedImageUrl(url: string, width: number): string {
	const match = url.match(CLOUDINARY_UPLOAD_RE);
	if (!match) return url;
	return `${match[1]}f_auto,q_auto,w_${width}/${match[2]}`;
}
