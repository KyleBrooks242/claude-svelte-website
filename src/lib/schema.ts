import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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
