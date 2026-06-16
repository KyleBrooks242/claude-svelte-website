export interface Post {
	id: string;
	slug: string;
	title: string;
	summary: string;
	content: string;
	tags: string[];
	status: 'draft' | 'published';
	publishedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export type PostListItem = Omit<Post, 'content'>;

export function readingTime(content: string): string {
	const words = content.trim().split(/\s+/).length;
	return `${Math.max(1, Math.ceil(words / 200))} min`;
}
