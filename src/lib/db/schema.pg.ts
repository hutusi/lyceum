import { pgTable, text, integer, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============ USERS & AUTH ============
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name"),
  image: text("image"),
  password: text("password"),
  role: text("role", { enum: ["user", "admin"] }).default("user"),
  emailVerified: timestamp("email_verified"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
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

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires").notNull(),
});

// ============ CONTENT (KNOW SECTION) ============
export const articles = pgTable("articles", {
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
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tags = pgTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
});

export const articleTags = pgTable("article_tags", {
  articleId: text("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

// ============ COURSES (LEARN SECTION) ============
export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  difficulty: text("difficulty", { enum: ["beginner", "intermediate", "advanced"] }),
  category: text("category", { enum: ["course", "workshop", "prompt-engineering"] }),
  status: text("status", { enum: ["draft", "published", "archived"] }).default("draft"),
  authorId: text("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  videoUrl: text("video_url"),
  order: integer("order").notNull(),
  duration: integer("duration"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const enrollments = pgTable("enrollments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const lessonProgress = pgTable("lesson_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  completed: boolean("completed").default(false),
  progressPercent: real("progress_percent").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
});

// ============ PRACTICE SECTION ============
export const practiceTopics = pgTable("practice_topics", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }),
  category: text("category"),
  authorId: text("author_id").references(() => users.id),
  status: text("status", { enum: ["draft", "published"] }).default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const discussions = pgTable("discussions", {
  id: text("id").primaryKey(),
  topicId: text("topic_id").references(() => practiceTopics.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  discussionId: text("discussion_id")
    .notNull()
    .references(() => discussions.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  content: text("content").notNull(),
  parentId: text("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ CREATE SECTION ============
export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  repoUrl: text("repo_url"),
  demoUrl: text("demo_url"),
  coverImage: text("cover_image"),
  status: text("status", { enum: ["pending", "approved", "featured", "rejected"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nexusWeeklyIssues = pgTable("nexus_weekly_issues", {
  id: text("id").primaryKey(),
  issueNumber: integer("issue_number").unique().notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  publishedAt: timestamp("published_at"),
  status: text("status", { enum: ["draft", "published"] }).default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ SHARE SECTION ============
export const sharedTools = pgTable("shared_tools", {
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
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const toolTags = pgTable("tool_tags", {
  id: text("id").primaryKey(),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
});

export const sharedToolTags = pgTable("shared_tool_tags", {
  toolId: text("tool_id")
    .notNull()
    .references(() => sharedTools.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => toolTags.id, { onDelete: "cascade" }),
});

export const toolReviews = pgTable("tool_reviews", {
  id: text("id").primaryKey(),
  toolId: text("tool_id")
    .notNull()
    .references(() => sharedTools.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  rating: integer("rating").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const toolVersions = pgTable("tool_versions", {
  id: text("id").primaryKey(),
  toolId: text("tool_id")
    .notNull()
    .references(() => sharedTools.id, { onDelete: "cascade" }),
  version: text("version").notNull(),
  changelog: text("changelog"),
  installCommand: text("install_command"),
  configSchema: text("config_schema"),
  isLatest: boolean("is_latest").default(false),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ USER FEATURES ============
export const userSettings = pgTable("user_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  website: text("website"),
  location: text("location"),
  github: text("github"),
  twitter: text("twitter"),
  emailNotifications: boolean("email_notifications").default(true),
  weeklyDigest: boolean("weekly_digest").default(true),
  courseUpdates: boolean("course_updates").default(true),
  discussionReplies: boolean("discussion_replies").default(true),
  projectFeedback: boolean("project_feedback").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userActivities = pgTable("user_activities", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: [
      "course_enrolled",
      "course_completed",
      "lesson_completed",
      "discussion_created",
      "comment_added",
      "project_submitted",
      "project_approved",
      "tool_published",
      "review_added",
    ],
  }).notNull(),
  resourceType: text("resource_type", {
    enum: ["course", "lesson", "discussion", "comment", "project", "tool", "review", "article"],
  }),
  resourceId: text("resource_id"),
  resourceTitle: text("resource_title"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookmarks = pgTable("bookmarks", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  resourceType: text("resource_type", {
    enum: ["article", "course", "tool", "discussion", "project"],
  }).notNull(),
  resourceId: text("resource_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ GAMIFICATION ============
export const userPoints = pgTable("user_points", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  totalPoints: integer("total_points").default(0),
  level: integer("level").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pointTransactions = pgTable("point_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  points: integer("points").notNull(),
  type: text("type", {
    enum: [
      "course_enrolled",
      "lesson_completed",
      "course_completed",
      "discussion_created",
      "comment_added",
      "project_submitted",
      "project_approved",
      "project_featured",
      "tool_published",
      "tool_approved",
      "review_added",
      "daily_login",
      "first_enrollment",
      "first_project",
      "streak_bonus",
    ],
  }).notNull(),
  description: text("description"),
  resourceType: text("resource_type"),
  resourceId: text("resource_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  category: text("category", {
    enum: ["learning", "community", "achievement", "special"],
  }).notNull(),
  requirement: text("requirement").notNull(),
  threshold: integer("threshold"),
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  badgeId: text("badge_id")
    .notNull()
    .references(() => badges.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// ============ SOCIAL FEATURES ============
export const userFollows = pgTable("user_follows", {
  id: text("id").primaryKey(),
  followerId: text("follower_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  followingId: text("following_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  resourceType: text("resource_type", {
    enum: ["article", "project", "discussion", "tool", "comment"],
  }).notNull(),
  resourceId: text("resource_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ RELATIONS ============
export const usersRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  articles: many(articles),
  courses: many(courses),
  enrollments: many(enrollments),
  discussions: many(discussions),
  comments: many(comments),
  projects: many(projects),
  settings: one(userSettings),
  activities: many(userActivities),
  bookmarks: many(bookmarks),
  points: one(userPoints),
  pointTransactions: many(pointTransactions),
  userBadges: many(userBadges),
  followers: many(userFollows, { relationName: "following" }),
  following: many(userFollows, { relationName: "followers" }),
  likes: many(likes),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  articleTags: many(articleTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  articleTags: many(articleTags),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
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

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [lessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
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

export const toolVersionsRelations = relations(toolVersions, ({ one }) => ({
  tool: one(sharedTools, {
    fields: [toolVersions.toolId],
    references: [sharedTools.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  user: one(users, {
    fields: [userActivities.userId],
    references: [users.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
}));

export const userPointsRelations = relations(userPoints, ({ one }) => ({
  user: one(users, {
    fields: [userPoints.userId],
    references: [users.id],
  }),
}));

export const pointTransactionsRelations = relations(pointTransactions, ({ one }) => ({
  user: one(users, {
    fields: [pointTransactions.userId],
    references: [users.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: "followers",
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));
