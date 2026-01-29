import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sharedTools, toolTags, sharedToolTags, toolVersions, toolReviews, users } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Wrench,
  Bot,
  Plug,
  Star,
  Download,
  ExternalLink,
  Copy,
  Clock,
  User,
  ArrowLeft,
  GitBranch,
} from "lucide-react";
import { InstallCommandCopy } from "./install-command-copy";
import { ReviewForm } from "./review-form";
import { ReviewsList } from "./reviews-list";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getTool(slug: string) {
  const tool = await db
    .select({
      id: sharedTools.id,
      name: sharedTools.name,
      slug: sharedTools.slug,
      description: sharedTools.description,
      readme: sharedTools.readme,
      type: sharedTools.type,
      version: sharedTools.version,
      repoUrl: sharedTools.repoUrl,
      installCommand: sharedTools.installCommand,
      configSchema: sharedTools.configSchema,
      downloads: sharedTools.downloads,
      stars: sharedTools.stars,
      status: sharedTools.status,
      publishedAt: sharedTools.publishedAt,
      createdAt: sharedTools.createdAt,
      userId: sharedTools.userId,
      userName: users.name,
      userImage: users.image,
    })
    .from(sharedTools)
    .leftJoin(users, eq(sharedTools.userId, users.id))
    .where(eq(sharedTools.slug, slug))
    .limit(1);

  if (tool.length === 0 || (tool[0].status !== "approved" && tool[0].status !== "featured")) {
    return null;
  }

  const toolData = tool[0];

  // Get tags
  const tags = await db
    .select({
      id: toolTags.id,
      name: toolTags.name,
      slug: toolTags.slug,
    })
    .from(sharedToolTags)
    .innerJoin(toolTags, eq(sharedToolTags.tagId, toolTags.id))
    .where(eq(sharedToolTags.toolId, toolData.id));

  // Get versions
  const versions = await db
    .select()
    .from(toolVersions)
    .where(eq(toolVersions.toolId, toolData.id))
    .orderBy(toolVersions.publishedAt);

  // Get reviews with user info
  const reviewsList = await db
    .select({
      id: toolReviews.id,
      rating: toolReviews.rating,
      content: toolReviews.content,
      createdAt: toolReviews.createdAt,
      userId: toolReviews.userId,
      userName: users.name,
      userImage: users.image,
    })
    .from(toolReviews)
    .leftJoin(users, eq(toolReviews.userId, users.id))
    .where(eq(toolReviews.toolId, toolData.id))
    .orderBy(toolReviews.createdAt)
    .limit(50);

  // Calculate average rating
  const avgRating =
    reviewsList.length > 0
      ? reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length
      : 0;

  return {
    ...toolData,
    tags,
    versions: versions.reverse(),
    reviews: reviewsList.map((r) => ({
      id: r.id,
      rating: r.rating,
      content: r.content,
      createdAt: r.createdAt,
      user: {
        id: r.userId,
        name: r.userName,
        image: r.userImage,
      },
    })),
    avgRating: Math.round(avgRating * 10) / 10,
    totalReviews: reviewsList.length,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);

  if (!tool) {
    return {
      title: "Tool Not Found",
    };
  }

  return {
    title: tool.name,
    description: tool.description || `${tool.name} - A ${tool.type} for your Code Agent`,
  };
}

const typeIcons = {
  skill: Wrench,
  agent: Bot,
  mcp: Plug,
};

const typeColors = {
  skill: "bg-blue-500/10 text-blue-500",
  agent: "bg-green-500/10 text-green-500",
  mcp: "bg-purple-500/10 text-purple-500",
};

const typeLabels = {
  skill: "Skill",
  agent: "Sub-Agent",
  mcp: "MCP",
};

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = await getTool(slug);

  if (!tool) {
    notFound();
  }

  const TypeIcon = typeIcons[tool.type as keyof typeof typeIcons];

  return (
    <div className="container py-8">
      {/* Back link */}
      <Link
        href="/share"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Share
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className={typeColors[tool.type as keyof typeof typeColors]}>
                <TypeIcon className="mr-1 h-3 w-3" />
                {typeLabels[tool.type as keyof typeof typeLabels]}
              </Badge>
              {tool.status === "featured" && (
                <Badge variant="secondary">Featured</Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
            <p className="text-muted-foreground text-lg">{tool.description}</p>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">{tool.avgRating}</span>
                <span>({tool.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Download className="h-4 w-4" />
                <span>{tool.downloads} downloads</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <GitBranch className="h-4 w-4" />
                <span>v{tool.version}</span>
              </div>
            </div>

            {/* Tags */}
            {tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tool.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="readme" className="space-y-4">
            <TabsList>
              <TabsTrigger value="readme">Readme</TabsTrigger>
              <TabsTrigger value="versions">Versions ({tool.versions.length})</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({tool.totalReviews})</TabsTrigger>
            </TabsList>

            <TabsContent value="readme" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  {tool.readme ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-sans">{tool.readme}</pre>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No readme provided.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="versions" className="space-y-4">
              {tool.versions.length > 0 ? (
                <div className="space-y-4">
                  {tool.versions.map((version) => (
                    <Card key={version.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            v{version.version}
                            {version.isLatest && (
                              <Badge variant="secondary">Latest</Badge>
                            )}
                          </CardTitle>
                          <span className="text-sm text-muted-foreground">
                            {version.publishedAt
                              ? new Date(version.publishedAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </CardHeader>
                      {version.changelog && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{version.changelog}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No version history available.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <ReviewForm toolSlug={tool.slug} />
              <ReviewsList reviews={tool.reviews} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Install Card */}
          <Card>
            <CardHeader>
              <CardTitle>Install</CardTitle>
              <CardDescription>
                Add this {typeLabels[tool.type as keyof typeof typeLabels].toLowerCase()} to your Code Agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InstallCommandCopy command={tool.installCommand || `claude install lyceum/${tool.slug}`} />

              {tool.repoUrl && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={tool.repoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Repository
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Author Card */}
          <Card>
            <CardHeader>
              <CardTitle>Author</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={tool.userImage || ""} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{tool.userName || "Anonymous"}</p>
                  <p className="text-sm text-muted-foreground">Creator</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{typeLabels[tool.type as keyof typeof typeLabels]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">{tool.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Published</span>
                <span className="font-medium">
                  {tool.publishedAt ? new Date(tool.publishedAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Downloads</span>
                <span className="font-medium">{tool.downloads}</span>
              </div>
            </CardContent>
          </Card>

          {/* Config Schema Card */}
          {tool.configSchema && (
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Required configuration options</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(JSON.parse(tool.configSchema), null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
