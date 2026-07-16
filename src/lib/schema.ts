import { boolean, integer, jsonb, pgTable, real, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { HevyExercise } from './types';

export const posts = pgTable('posts', {
	id: uuid('id').primaryKey().defaultRandom(),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	summary: text('summary').notNull().default(''),
	content: text('content').notNull().default(''),
	tags: text('tags').array().notNull().default([]),
	status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
	publishedAt: timestamp('published_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export const projects = pgTable('projects', {
	id: uuid('id').primaryKey().defaultRandom(),
	kind: text('kind', { enum: ['software', 'woodworking'] }).notNull().default('software'),
	title: text('title').notNull(),
	description: text('description').notNull().default(''),
	tags: text('tags').array().notNull().default([]),
	github: text('github'),
	demo: text('demo'),
	status: text('status', { enum: ['live', 'wip', 'archived', 'complete'] }).notNull().default('wip'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const projectImages = pgTable('project_images', {
	id: uuid('id').primaryKey().defaultRandom(),
	projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
	url: text('url').notNull(),
	caption: text('caption').notNull().default(''),
	position: integer('position').notNull().default(0),
});

export type ProjectImage = typeof projectImages.$inferSelect;

export const messages = pgTable('messages', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	email: text('email').notNull(),
	body: text('body').notNull(),
	ip: text('ip').notNull(),
	read: boolean('read').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export const hevyWorkouts = pgTable('hevy_workouts', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description').notNull().default(''),
	startTime: timestamp('start_time', { withTimezone: true }).notNull(),
	endTime: timestamp('end_time', { withTimezone: true }).notNull(),
	exercises: jsonb('exercises').notNull().$type<HevyExercise[]>(),
	syncedAt: timestamp('synced_at', { withTimezone: true }).notNull().defaultNow(),
});

export type HevyWorkoutRow = typeof hevyWorkouts.$inferSelect;
export type NewHevyWorkoutRow = typeof hevyWorkouts.$inferInsert;

export const exercisePrs = pgTable('exercise_prs', {
	id: uuid('id').primaryKey().defaultRandom(),
	exerciseName: text('exercise_name').notNull(),
	exerciseTemplateId: text('exercise_template_id').notNull().unique(),
	personalRecord: real('personal_record').notNull(),
	numberOfReps: integer('number_of_reps').notNull(),
	totalWeightLifted: real('total_weight_lifted').notNull().default(0),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type ExercisePr = typeof exercisePrs.$inferSelect;
export type NewExercisePr = typeof exercisePrs.$inferInsert;

export const workoutStats = pgTable('workout_stats', {
	id: text('id').primaryKey().default('singleton'),
	totalWeightLifted: real('total_weight_lifted').notNull().default(0),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type WorkoutStatsRow = typeof workoutStats.$inferSelect;
