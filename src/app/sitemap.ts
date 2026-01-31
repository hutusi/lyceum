import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { articles, courses, practiceTopics, sharedTools } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lyceum.ai";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${siteUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/learn`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/practice`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/create`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/create/showcase`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/create/nexus-weekly`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/create/api-playground`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${siteUrl}/share`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];

  // Dynamic pages - Articles
  const publishedArticles = await db.query.articles.findMany({
    where: eq(articles.status, "published"),
    columns: {
      slug: true,
      updatedAt: true,
    },
  });

  const articlePages = publishedArticles.map((article) => ({
    url: `${siteUrl}/news/${article.slug}`,
    lastModified: article.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic pages - Courses
  const publishedCourses = await db.query.courses.findMany({
    where: eq(courses.status, "published"),
    columns: {
      slug: true,
      createdAt: true,
    },
  });

  const coursePages = publishedCourses.map((course) => ({
    url: `${siteUrl}/learn/${course.slug}`,
    lastModified: course.createdAt || new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Dynamic pages - Practice Topics
  const publishedTopics = await db.query.practiceTopics.findMany({
    where: eq(practiceTopics.status, "published"),
    columns: {
      slug: true,
      createdAt: true,
    },
  });

  const topicPages = publishedTopics.map((topic) => ({
    url: `${siteUrl}/practice/topics/${topic.slug}`,
    lastModified: topic.createdAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Dynamic pages - Shared Tools
  const publishedTools = await db.query.sharedTools.findMany({
    where: eq(sharedTools.status, "approved"),
    columns: {
      slug: true,
      updatedAt: true,
    },
  });

  const toolPages = publishedTools.map((tool) => ({
    url: `${siteUrl}/share/${tool.slug}`,
    lastModified: tool.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...articlePages,
    ...coursePages,
    ...topicPages,
    ...toolPages,
  ];
}
