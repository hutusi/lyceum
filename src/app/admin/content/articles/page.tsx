import { Metadata } from "next";
import Link from "next/link";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, users } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ArticlesTable } from "./articles-table";

export const metadata: Metadata = {
  title: "Manage Articles - Admin",
  description: "Manage articles, news, videos, and live streams.",
};

async function getArticles() {
  const articlesList = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      type: articles.type,
      status: articles.status,
      publishedAt: articles.publishedAt,
      createdAt: articles.createdAt,
      authorName: users.name,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .orderBy(desc(articles.createdAt));

  // Get counts by status
  const statusCounts = await db
    .select({
      status: articles.status,
      count: sql<number>`count(*)`,
    })
    .from(articles)
    .groupBy(articles.status);

  const counts = statusCounts.reduce(
    (acc, { status, count }) => {
      acc[status || "unknown"] = count;
      return acc;
    },
    { draft: 0, published: 0, archived: 0 } as Record<string, number>
  );

  // Get counts by type
  const typeCounts = await db
    .select({
      type: articles.type,
      count: sql<number>`count(*)`,
    })
    .from(articles)
    .groupBy(articles.type);

  const types = typeCounts.reduce(
    (acc, { type, count }) => {
      acc[type || "unknown"] = count;
      return acc;
    },
    { article: 0, news: 0, video: 0, livestream: 0 } as Record<string, number>
  );

  return {
    articles: articlesList.map((a) => ({
      ...a,
      author: a.authorName,
    })),
    counts,
    types,
  };
}

export default async function AdminArticlesPage() {
  const { articles, counts, types } = await getArticles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Articles</h1>
          <p className="text-muted-foreground">
            Create and manage articles, news, videos, and live streams.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-yellow-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Drafts</p>
          <p className="text-2xl font-bold text-yellow-600">{counts.draft}</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="text-2xl font-bold text-green-600">{counts.published}</p>
        </div>
        <div className="bg-gray-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Archived</p>
          <p className="text-2xl font-bold text-gray-600">{counts.archived}</p>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Articles</p>
          <p className="text-2xl font-bold text-blue-600">{types.article}</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">News</p>
          <p className="text-2xl font-bold text-green-600">{types.news}</p>
        </div>
        <div className="bg-purple-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Videos</p>
          <p className="text-2xl font-bold text-purple-600">{types.video}</p>
        </div>
        <div className="bg-red-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Livestreams</p>
          <p className="text-2xl font-bold text-red-600">{types.livestream}</p>
        </div>
      </div>

      <ArticlesTable articles={articles} />
    </div>
  );
}
