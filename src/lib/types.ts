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

export interface Project {
	id: string;
	kind: 'software' | 'woodworking';
	title: string;
	description: string;
	tags: string[];
	github: string | null;
	demo: string | null;
	status: 'live' | 'wip' | 'archived' | 'complete';
	createdAt: string;
	updatedAt: string;
}

export interface ProjectImage {
	id: string;
	projectId: string;
	url: string;
	caption: string;
	position: number;
}

export function readingTime(content: string): string {
	const words = content.trim().split(/\s+/).length;
	return `${Math.max(1, Math.ceil(words / 200))} min`;
}

export interface HevySet {
	index: number;
	type: 'normal' | 'warmup' | 'dropset' | 'failure';
	weight_kg: number | null;
	reps: number | null;
	distance_meters: number | null;
	duration_seconds: number | null;
	rpe: number | null;
	custom_metric: number | null;
}

export interface HevyExercise {
	index: number;
	title: string;
	notes: string;
	sets: HevySet[];
}

export interface HevyWorkout {
	id: string;
	title: string;
	routine_id: string | null;
	description: string;
	start_time: string;
	end_time: string;
	updated_at: string;
	created_at: string;
	exercises: HevyExercise[];
}
