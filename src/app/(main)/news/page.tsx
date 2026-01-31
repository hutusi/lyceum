import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { eq, desc, like, and, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, tags, articleTags, users } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, Video, Radio, Calendar, User } from "lucide-react";
import { NewsSearch } from "./news-search";
import { NewsFilters } from "./news-filters";
import { NewsPagination } from "./news-pagination";

export const metadata: Metadata = {
  title: "News",
  description: "Stay informed with the latest AI tool news, articles, videos, and live streams.",
};

export const dynamic = "force-dynamic";

interface SearchParams {
  type?: string;
  search?: string;
  tag?: string;
  page?: string;
}

async function getArticles(searchParams: SearchParams) {
  const { type, search, tag, page = "1" } = searchParams;
  const limit = 12;
  const offset = (parseInt(page) - 1) * limit;

  // Build conditions
  const conditions = [eq(articles.status, "published")];

  if (type && type !== "all") {
    conditions.push(eq(articles.type, type as "article" | "news" | "video" | "livestream"));
  }

  if (search) {
    const searchCondition = or(
      like(articles.title, `%${search}%`),
      like(articles.excerpt, `%${search}%`)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const whereClause = and(...conditions);

  // Get articles
  const articlesList = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      coverImage: articles.coverImage,
      type: articles.type,
      videoUrl: articles.videoUrl,
      publishedAt: articles.publishedAt,
      authorName: users.name,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(whereClause)
    .orderBy(desc(articles.publishedAt), desc(articles.createdAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(whereClause);

  const total = countResult[0]?.count || 0;

  // Get tags for articles
  const articlesWithTags = await Promise.all(
    articlesList.map(async (article) => {
      const articleTagsList = await db
        .select({
          name: tags.name,
          slug: tags.slug,
        })
        .from(articleTags)
        .innerJoin(tags, eq(articleTags.tagId, tags.id))
        .where(eq(articleTags.articleId, article.id));

      return {
        ...article,
        tags: articleTagsList,
      };
    })
  );

  // Filter by tag if specified
  let filteredArticles = articlesWithTags;
  if (tag) {
    filteredArticles = articlesWithTags.filter((article) =>
      article.tags.some((t) => t.slug === tag || t.name.toLowerCase() === tag.toLowerCase())
    );
  }

  return {
    articles: filteredArticles,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
  };
}

async function getPopularTags() {
  const tagsList = await db
    .select({
      name: tags.name,
      slug: tags.slug,
      count: sql<number>`count(${articleTags.articleId})`,
    })
    .from(tags)
    .leftJoin(articleTags, eq(tags.id, articleTags.tagId))
    .groupBy(tags.id)
    .orderBy(desc(sql`count(${articleTags.articleId})`))
    .limit(10);

  return tagsList;
}

const typeIcons = {
  article: Newspaper,
  news: Newspaper,
  video: Video,
  livestream: Radio,
};

const typeColors = {
  article: "bg-blue-500/10 text-blue-500",
  news: "bg-green-500/10 text-green-500",
  video: "bg-purple-500/10 text-purple-500",
  livestream: "bg-red-500/10 text-red-500",
};

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function extractVideoId(url: string | null): string | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return ytMatch[1];
  return null;
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { articles: articlesList, total, totalPages, currentPage } = await getArticles(params);
  const popularTags = await getPopularTags();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">News</h1>
        <p className="text-muted-foreground">
          Stay informed with the latest AI tool news, articles, videos, and live streams.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <NewsSearch initialSearch={params.search} />
        <NewsFilters
          currentType={params.type}
          currentTag={params.tag}
          popularTags={popularTags}
        />
      </div>

      {/* Results */}
      {articlesList.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No articles found</CardTitle>
            <CardDescription>
              {params.search || params.type || params.tag
                ? "Try adjusting your search or filters."
                : "Check back later for new content!"}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articlesList.map((article) => {
              const TypeIcon = typeIcons[article.type as keyof typeof typeIcons] || Newspaper;
              const videoId = extractVideoId(article.videoUrl);

              return (
                <Link key={article.id} href={`/news/${article.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                    {/* Cover Image or Video Thumbnail */}
                    {article.type === "video" && videoId ? (
                      <div className="aspect-video bg-muted relative">
                        <Image
                          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                            <Video className="h-8 w-8 text-purple-500 ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : article.coverImage ? (
                      <div className="aspect-video bg-muted relative">
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : article.type === "livestream" ? (
                      <div className="aspect-video bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                        <Radio className="h-12 w-12 text-red-500" />
                      </div>
                    ) : null}

                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={typeColors[article.type as keyof typeof typeColors]}>
                          <TypeIcon className="mr-1 h-3 w-3" />
                          {article.type}
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {article.excerpt}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      {/* Tags */}
                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {article.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag.slug} variant="outline" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(article.publishedAt)}
                        </span>
                        {article.authorName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {article.authorName}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <NewsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
            />
          )}
        </>
      )}
    </div>
  );
}
