import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { eq, desc, ne, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, tags, articleTags, users } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  User,
  Newspaper,
  Video,
  Radio,
  Share2,
  BookmarkPlus,
} from "lucide-react";
import { VideoEmbed } from "./video-embed";
import { ArticleContent } from "./article-content";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getArticle(slug: string) {
  const article = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      content: articles.content,
      coverImage: articles.coverImage,
      type: articles.type,
      videoUrl: articles.videoUrl,
      status: articles.status,
      publishedAt: articles.publishedAt,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      authorId: articles.authorId,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .limit(1);

  if (article.length === 0) {
    return null;
  }

  const articleData = article[0];

  // Get tags
  const articleTagsList = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
    })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, articleData.id));

  // Get related articles
  const relatedArticles = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      coverImage: articles.coverImage,
      type: articles.type,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(
      and(
        eq(articles.type, articleData.type),
        eq(articles.status, "published"),
        ne(articles.id, articleData.id)
      )
    )
    .orderBy(desc(articles.publishedAt))
    .limit(3);

  return {
    ...articleData,
    tags: articleTagsList,
    relatedArticles,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: article.title,
    description: article.excerpt || `Read ${article.title} on AI Coding Lyceum`,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      type: "article",
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
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

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const TypeIcon = typeIcons[article.type as keyof typeof typeIcons] || Newspaper;

  return (
    <div className="container py-8">
      {/* Back link */}
      <Link
        href="/news"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to News
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge className={typeColors[article.type as keyof typeof typeColors]}>
                <TypeIcon className="mr-1 h-3 w-3" />
                {article.type}
              </Badge>
              {article.tags.map((tag) => (
                <Link key={tag.id} href={`/news?tag=${tag.slug}`}>
                  <Badge variant="outline" className="hover:bg-muted">
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>

            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-6">{article.excerpt}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(article.publishedAt)}
              </span>
              {article.authorName && (
                <span className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={article.authorImage || ""} />
                    <AvatarFallback>
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  {article.authorName}
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* Video Embed (for video type) */}
          {article.type === "video" && article.videoUrl && (
            <VideoEmbed url={article.videoUrl} title={article.title} />
          )}

          {/* Livestream Notice (for livestream type) */}
          {article.type === "livestream" && (
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  <CardTitle className="text-red-500">Live Stream</CardTitle>
                </div>
                <CardDescription>
                  {article.videoUrl
                    ? "Click below to join the live stream"
                    : "Stream details will be available soon"}
                </CardDescription>
              </CardHeader>
              {article.videoUrl && (
                <CardContent>
                  <VideoEmbed url={article.videoUrl} title={article.title} />
                </CardContent>
              )}
            </Card>
          )}

          {/* Cover Image (for article/news type without video) */}
          {(article.type === "article" || article.type === "news") && article.coverImage && (
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <ArticleContent content={article.content} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <BookmarkPlus className="mr-2 h-4 w-4" />
                Save for Later
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </CardContent>
          </Card>

          {/* Author Card */}
          {article.authorName && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={article.authorImage || ""} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{article.authorName}</p>
                    <p className="text-sm text-muted-foreground">Contributor</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Articles */}
          {article.relatedArticles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Articles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {article.relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/news/${related.slug}`}
                    className="block group"
                  >
                    <div className="flex gap-3">
                      {related.coverImage && (
                        <div className="w-20 h-14 relative rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={related.coverImage}
                            alt={related.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {related.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(related.publishedAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
