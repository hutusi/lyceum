import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { bookmarks, articles, courses, sharedTools, discussions, projects } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Bookmark,
  Newspaper,
  GraduationCap,
  Wrench,
  MessageSquare,
  Rocket,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Your saved articles, courses, and more.",
};

type BookmarkWithResource = {
  id: string;
  resourceType: string;
  resourceId: string;
  createdAt: Date | null;
  resource: {
    id: string;
    title?: string;
    name?: string;
    slug?: string;
    description?: string;
    excerpt?: string;
    coverImage?: string | null;
    type?: string;
    difficulty?: string;
  } | null;
};

async function getUserBookmarks(userId: string): Promise<BookmarkWithResource[]> {
  const userBookmarks = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, userId),
    orderBy: desc(bookmarks.createdAt),
  });

  const bookmarksWithDetails = await Promise.all(
    userBookmarks.map(async (bookmark) => {
      let resource = null;

      switch (bookmark.resourceType) {
        case "article":
          resource = await db.query.articles.findFirst({
            where: eq(articles.id, bookmark.resourceId),
            columns: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              coverImage: true,
              type: true,
            },
          });
          break;
        case "course":
          resource = await db.query.courses.findFirst({
            where: eq(courses.id, bookmark.resourceId),
            columns: {
              id: true,
              title: true,
              slug: true,
              description: true,
              coverImage: true,
              difficulty: true,
            },
          });
          break;
        case "tool":
          resource = await db.query.sharedTools.findFirst({
            where: eq(sharedTools.id, bookmark.resourceId),
            columns: {
              id: true,
              name: true,
              slug: true,
              description: true,
              type: true,
            },
          });
          break;
        case "discussion":
          resource = await db.query.discussions.findFirst({
            where: eq(discussions.id, bookmark.resourceId),
            columns: {
              id: true,
              title: true,
            },
          });
          break;
        case "project":
          resource = await db.query.projects.findFirst({
            where: eq(projects.id, bookmark.resourceId),
            columns: {
              id: true,
              title: true,
              description: true,
              coverImage: true,
            },
          });
          break;
      }

      return {
        ...bookmark,
        resource,
      };
    })
  );

  return bookmarksWithDetails.filter((b) => b.resource !== null) as BookmarkWithResource[];
}

function getResourceLink(bookmark: BookmarkWithResource): string {
  switch (bookmark.resourceType) {
    case "article":
      return `/news/${bookmark.resource?.slug}`;
    case "course":
      return `/learn/${bookmark.resource?.slug}`;
    case "tool":
      return `/share/${bookmark.resource?.slug}`;
    case "discussion":
      return `/practice/discussions/${bookmark.resourceId}`;
    case "project":
      return `/create/showcase/${bookmark.resourceId}`;
    default:
      return "#";
  }
}

function getResourceIcon(type: string) {
  switch (type) {
    case "article":
      return <Newspaper className="h-4 w-4" />;
    case "course":
      return <GraduationCap className="h-4 w-4" />;
    case "tool":
      return <Wrench className="h-4 w-4" />;
    case "discussion":
      return <MessageSquare className="h-4 w-4" />;
    case "project":
      return <Rocket className="h-4 w-4" />;
    default:
      return <Bookmark className="h-4 w-4" />;
  }
}

export default async function BookmarksPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const allBookmarks = await getUserBookmarks(session.user.id!);

  const articleBookmarks = allBookmarks.filter((b) => b.resourceType === "article");
  const courseBookmarks = allBookmarks.filter((b) => b.resourceType === "course");
  const toolBookmarks = allBookmarks.filter((b) => b.resourceType === "tool");
  const discussionBookmarks = allBookmarks.filter((b) => b.resourceType === "discussion");
  const projectBookmarks = allBookmarks.filter((b) => b.resourceType === "project");

  return (
    <div className="container py-8 max-w-4xl">
      <Link
        href="/profile"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Profile
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bookmark className="h-8 w-8" />
          Bookmarks
        </h1>
        <p className="text-muted-foreground mt-2">
          Your saved articles, courses, tools, and more.
        </p>
      </div>

      {allBookmarks.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No Bookmarks Yet</CardTitle>
            <CardDescription>
              Save articles, courses, and tools to access them later.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/news">Browse Articles</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              All ({allBookmarks.length})
            </TabsTrigger>
            {articleBookmarks.length > 0 && (
              <TabsTrigger value="articles" className="gap-2">
                <Newspaper className="h-4 w-4" />
                Articles ({articleBookmarks.length})
              </TabsTrigger>
            )}
            {courseBookmarks.length > 0 && (
              <TabsTrigger value="courses" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Courses ({courseBookmarks.length})
              </TabsTrigger>
            )}
            {toolBookmarks.length > 0 && (
              <TabsTrigger value="tools" className="gap-2">
                <Wrench className="h-4 w-4" />
                Tools ({toolBookmarks.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {allBookmarks.map((bookmark) => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} />
            ))}
          </TabsContent>

          <TabsContent value="articles" className="space-y-4">
            {articleBookmarks.map((bookmark) => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} />
            ))}
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            {courseBookmarks.map((bookmark) => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} />
            ))}
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            {toolBookmarks.map((bookmark) => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} />
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function BookmarkCard({ bookmark }: { bookmark: BookmarkWithResource }) {
  const link = getResourceLink(bookmark);
  const title = bookmark.resource?.title || bookmark.resource?.name || "Untitled";
  const description = bookmark.resource?.description || bookmark.resource?.excerpt;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {bookmark.resource?.coverImage && (
            <img
              src={bookmark.resource.coverImage}
              alt={title}
              className="w-20 h-20 object-cover rounded-md"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getResourceIcon(bookmark.resourceType)}
              <Badge variant="secondary" className="capitalize">
                {bookmark.resourceType}
              </Badge>
              {bookmark.resource?.type && (
                <Badge variant="outline" className="capitalize">
                  {bookmark.resource.type}
                </Badge>
              )}
              {bookmark.resource?.difficulty && (
                <Badge variant="outline" className="capitalize">
                  {bookmark.resource.difficulty}
                </Badge>
              )}
            </div>
            <Link href={link} className="font-medium hover:underline">
              {title}
            </Link>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Saved{" "}
              {bookmark.createdAt?.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
