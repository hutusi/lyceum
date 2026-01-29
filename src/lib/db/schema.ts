import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============ USERS & AUTH ============
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name"),
  image: text("image"),
  password: text("password"),
  role: text("role", { enum: ["user", "admin"] }).default("user"),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = sqliteTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

// ============ CONTENT (KNOW SECTION) ============
export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  authorId: text("author_id").references(() => users.id),
  type: text("type", { enum: ["article", "news", "video", "livestream"] }).notNull(),
  videoUrl: text("video_url"),
  status: text("status", { enum: ["draft", "published", "archived"] }).default("draft"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
});

export const articleTags = sqliteTable("article_tags", {
  articleId: text("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

// ============ COURSES (LEARN SECTION) ============
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  difficulty: text("difficulty", { enum: ["beginner", "intermediate", "advanced"] }),
  category: text("category", { enum: ["course", "workshop", "prompt-engineering"] }),
  status: text("status", { enum: ["draft", "published", "archived"] }).default("draft"),
  authorId: text("author_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  videoUrl: text("video_url"),
  order: integer("order").notNull(),
  duration: integer("duration"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const enrollments = sqliteTable("enrollments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  enrolledAt: integer("enrolled_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const lessonProgress = sqliteTable("lesson_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  completed: integer("completed", { mode: "boolean" }).default(false),
  progressPercent: real("progress_percent").default(0),
  lastAccessedAt: integer("last_accessed_at", { mode: "timestamp" }),
});

// ============ PRACTICE SECTION ============
export const practiceTopics = sqliteTable("practice_topics", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }),
  category: text("category"),
  authorId: text("author_id").references(() => users.id),
  status: text("status", { enum: ["draft", "published"] }).default("draft"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const discussions = sqliteTable("discussions", {
  id: text("id").primaryKey(),
  topicId: text("topic_id").references(() => practiceTopics.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: integer("is_pinned", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  discussionId: text("discussion_id")
    .notNull()
    .references(() => discussions.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  content: text("content").notNull(),
  parentId: text("parent_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ CREATE SECTION ============
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  repoUrl: text("repo_url"),
  demoUrl: text("demo_url"),
  coverImage: text("cover_image"),
  status: text("status", { enum: ["pending", "approved", "featured", "rejected"] }).default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const nexusWeeklyIssues = sqliteTable("nexus_weekly_issues", {
  id: text("id").primaryKey(),
  issueNumber: integer("issue_number").unique().notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  status: text("status", { enum: ["draft", "published"] }).default("draft"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============ RELATIONS ============
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  articles: many(articles),
  courses: many(courses),
  enrollments: many(enrollments),
  discussions: many(discussions),
  comments: many(comments),
  projects: many(projects),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  articleTags: many(articleTags),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  author: one(users, {
    fields: [courses.authorId],
    references: [users.id],
  }),
  lessons: many(lessons),
  enrollments: many(enrollments),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  progress: many(lessonProgress),
}));

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  topic: one(practiceTopics, {
    fields: [discussions.topicId],
    references: [practiceTopics.id],
  }),
  user: one(users, {
    fields: [discussions.userId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  discussion: one(discussions, {
    fields: [comments.discussionId],
    references: [discussions.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));

// ============ SHARE SECTION ============
export const sharedTools = sqliteTable("shared_tools", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  readme: text("readme"),
  type: text("type", { enum: ["skill", "agent", "mcp"] }).notNull(),
  version: text("version").default("1.0.0"),
  repoUrl: text("repo_url"),
  installCommand: text("install_command"),
  configSchema: text("config_schema"),
  downloads: integer("downloads").default(0),
  stars: integer("stars").default(0),
  status: text("status", { enum: ["pending", "approved", "featured", "rejected"] }).default("pending"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const toolTags = sqliteTable("tool_tags", {
  id: text("id").primaryKey(),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
});

export const sharedToolTags = sqliteTable("shared_tool_tags", {
  toolId: text("tool_id")
    .notNull()
    .references(() => sharedTools.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => toolTags.id, { onDelete: "cascade" }),
});

export const toolReviews = sqliteTable("tool_reviews", {
  id: text("id").primaryKey(),
  toolId: text("tool_id")
    .notNull()
    .references(() => sharedTools.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  rating: integer("rating").notNull(),
  content: text("content"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const sharedToolsRelations = relations(sharedTools, ({ one, many }) => ({
  user: one(users, {
    fields: [sharedTools.userId],
    references: [users.id],
  }),
  tags: many(sharedToolTags),
  reviews: many(toolReviews),
  versions: many(toolVersions),
}));

export const sharedToolTagsRelations = relations(sharedToolTags, ({ one }) => ({
  tool: one(sharedTools, {
    fields: [sharedToolTags.toolId],
    references: [sharedTools.id],
  }),
  tag: one(toolTags, {
    fields: [sharedToolTags.tagId],
    references: [toolTags.id],
  }),
}));

export const toolTagsRelations = relations(toolTags, ({ many }) => ({
  tools: many(sharedToolTags),
}));

export const toolReviewsRelations = relations(toolReviews, ({ one }) => ({
  tool: one(sharedTools, {
    fields: [toolReviews.toolId],
    references: [sharedTools.id],
  }),
  user: one(users, {
    fields: [toolReviews.userId],
    references: [users.id],
  }),
}));

// Tool Versions for version management
export const toolVersions = sqliteTable("tool_versions", {
  id: text("id").primaryKey(),
  toolId: text("tool_id")
    .notNull()
    .references(() => sharedTools.id, { onDelete: "cascade" }),
  version: text("version").notNull(),
  changelog: text("changelog"),
  installCommand: text("install_command"),
  configSchema: text("config_schema"),
  isLatest: integer("is_latest", { mode: "boolean" }).default(false),
  publishedAt: integer("published_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const toolVersionsRelations = relations(toolVersions, ({ one }) => ({
  tool: one(sharedTools, {
    fields: [toolVersions.toolId],
    references: [sharedTools.id],
  }),
}));
