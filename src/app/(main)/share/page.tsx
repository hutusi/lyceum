import { Metadata } from "next";
import Link from "next/link";
import { eq, desc, like, and, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { sharedTools, toolTags, sharedToolTags, users } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Bot, Plug, Star, Download, Plus } from "lucide-react";
import { ToolSearch } from "./tool-search";
import { ToolFilters } from "./tool-filters";

export const metadata: Metadata = {
  title: "Share",
  description: "Share and discover skills, sub-agents, and MCPs for your Code Agent.",
};

interface SearchParams {
  type?: string;
  search?: string;
  tag?: string;
}

async function getTools(searchParams: SearchParams) {
  const { type, search, tag } = searchParams;

  // Build conditions for approved or featured tools
  const conditions = [
    or(eq(sharedTools.status, "approved"), eq(sharedTools.status, "featured"))
  ];

  if (type && type !== "all") {
    conditions.push(eq(sharedTools.type, type as "skill" | "agent" | "mcp"));
  }

  if (search) {
    conditions.push(
      or(
        like(sharedTools.name, `%${search}%`),
        like(sharedTools.description, `%${search}%`)
      )
    );
  }

  const whereClause = and(...conditions);

  // Get tools with user info
  const tools = await db
    .select({
      id: sharedTools.id,
      name: sharedTools.name,
      slug: sharedTools.slug,
      description: sharedTools.description,
      type: sharedTools.type,
      version: sharedTools.version,
      downloads: sharedTools.downloads,
      stars: sharedTools.stars,
      status: sharedTools.status,
      userName: users.name,
    })
    .from(sharedTools)
    .leftJoin(users, eq(sharedTools.userId, users.id))
    .where(whereClause)
    .orderBy(desc(sharedTools.stars), desc(sharedTools.downloads))
    .limit(30);

  // Get tags for each tool
  const toolsWithTags = await Promise.all(
    tools.map(async (tool) => {
      const tags = await db
        .select({
          name: toolTags.name,
          slug: toolTags.slug,
        })
        .from(sharedToolTags)
        .innerJoin(toolTags, eq(sharedToolTags.tagId, toolTags.id))
        .where(eq(sharedToolTags.toolId, tool.id));

      return {
        ...tool,
        tags,
        author: tool.userName || "Anonymous",
      };
    })
  );

  // Filter by tag if specified
  if (tag) {
    return toolsWithTags.filter((tool) =>
      tool.tags.some((t) => t.slug === tag || t.name.toLowerCase() === tag.toLowerCase())
    );
  }

  return toolsWithTags;
}

async function getPopularTags() {
  const tags = await db
    .select({
      name: toolTags.name,
      slug: toolTags.slug,
      count: sql<number>`count(${sharedToolTags.toolId})`,
    })
    .from(toolTags)
    .leftJoin(sharedToolTags, eq(toolTags.id, sharedToolTags.tagId))
    .groupBy(toolTags.id)
    .orderBy(desc(sql`count(${sharedToolTags.toolId})`))
    .limit(10);

  return tags;
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

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const tools = await getTools(params);
  const popularTags = await getPopularTags();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Share</h1>
            <p className="text-muted-foreground">
              Discover and share skills, sub-agents, and MCPs for your Code Agent.
            </p>
          </div>
          <Button asChild>
            <Link href="/share/publish">
              <Plus className="mr-2 h-4 w-4" />
              Publish Tool
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <ToolSearch initialSearch={params.search} />
        <ToolFilters
          currentType={params.type}
          currentTag={params.tag}
          popularTags={popularTags}
        />
      </div>

      {/* Results */}
      {tools.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>No tools found</CardTitle>
            <CardDescription>
              {params.search || params.type || params.tag
                ? "Try adjusting your search or filters."
                : "Be the first to publish a tool!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/share/publish">Publish Your Tool</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const TypeIcon = typeIcons[tool.type as keyof typeof typeIcons];
            return (
              <Card key={tool.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={typeColors[tool.type as keyof typeof typeColors]}>
                      <TypeIcon className="mr-1 h-3 w-3" />
                      {tool.type}
                    </Badge>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        {tool.stars || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {tool.downloads || 0}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-1">{tool.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tool.tags.slice(0, 3).map((tag) => (
                      <Link key={tag.slug} href={`/share?tag=${tag.slug}`}>
                        <Badge variant="outline" className="text-xs hover:bg-muted">
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">by {tool.author}</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/share/${tool.slug}`}>View Details</Link>
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Install
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Section */}
      <section className="mt-16 py-12 border-t">
        <h2 className="text-2xl font-bold text-center mb-8">What Can You Share?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-8 w-8 text-blue-500" />
              </div>
              <CardTitle>Skills</CardTitle>
              <CardDescription>
                Reusable capabilities that extend your Code Agent&apos;s abilities. Perfect for specific tasks like code formatting, refactoring, or analysis.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle>Sub-Agents</CardTitle>
              <CardDescription>
                Specialized AI agents that can be delegated specific tasks. They work autonomously and report back results to your main agent.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Plug className="h-8 w-8 text-purple-500" />
              </div>
              <CardTitle>MCPs</CardTitle>
              <CardDescription>
                Model Context Protocols that connect your agent to external services, databases, APIs, and tools with standardized interfaces.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}
