import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Wrench, Bot, Plug, Star, Download, Search, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Share",
  description: "Share and discover skills, sub-agents, and MCPs for your Code Agent.",
};

const featuredTools = [
  {
    id: 1,
    name: "Code Review Agent",
    slug: "code-review-agent",
    description: "An intelligent sub-agent that reviews your code and suggests improvements based on best practices.",
    type: "agent",
    author: "aidev",
    stars: 128,
    downloads: 1542,
    tags: ["code-review", "quality", "automation"],
  },
  {
    id: 2,
    name: "Git Workflow Skill",
    slug: "git-workflow-skill",
    description: "A skill that helps manage complex git workflows including branching, rebasing, and conflict resolution.",
    type: "skill",
    author: "devops-master",
    stars: 89,
    downloads: 987,
    tags: ["git", "workflow", "productivity"],
  },
  {
    id: 3,
    name: "Database MCP",
    slug: "database-mcp",
    description: "Model Context Protocol for connecting to various databases (PostgreSQL, MySQL, SQLite) with smart query generation.",
    type: "mcp",
    author: "db-wizard",
    stars: 256,
    downloads: 3201,
    tags: ["database", "sql", "mcp"],
  },
  {
    id: 4,
    name: "Test Generator Skill",
    slug: "test-generator-skill",
    description: "Automatically generates unit tests for your code with high coverage and edge case detection.",
    type: "skill",
    author: "test-guru",
    stars: 167,
    downloads: 2105,
    tags: ["testing", "automation", "quality"],
  },
  {
    id: 5,
    name: "Documentation Agent",
    slug: "documentation-agent",
    description: "A sub-agent specialized in generating and maintaining code documentation and README files.",
    type: "agent",
    author: "doc-master",
    stars: 94,
    downloads: 1123,
    tags: ["documentation", "readme", "automation"],
  },
  {
    id: 6,
    name: "API Integration MCP",
    slug: "api-integration-mcp",
    description: "MCP for seamless integration with popular APIs including REST, GraphQL, and gRPC endpoints.",
    type: "mcp",
    author: "api-expert",
    stars: 203,
    downloads: 2890,
    tags: ["api", "integration", "mcp"],
  },
];

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

export default function SharePage() {
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

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search skills, agents, and MCPs..."
          className="pl-10 max-w-xl"
        />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            All
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-2">
            <Wrench className="h-4 w-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-2">
            <Bot className="h-4 w-4" />
            Sub-Agents
          </TabsTrigger>
          <TabsTrigger value="mcps" className="gap-2">
            <Plug className="h-4 w-4" />
            MCPs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool) => {
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
                          {tool.stars}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {tool.downloads}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-1">{tool.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tool.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
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
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools
              .filter((t) => t.type === "skill")
              .map((tool) => {
                const TypeIcon = typeIcons[tool.type as keyof typeof typeIcons];
                return (
                  <Card key={tool.id} className="flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Badge className={typeColors[tool.type as keyof typeof typeColors]}>
                        <TypeIcon className="mr-1 h-3 w-3" />
                        {tool.type}
                      </Badge>
                      <CardTitle className="line-clamp-1">{tool.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Install
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools
              .filter((t) => t.type === "agent")
              .map((tool) => {
                const TypeIcon = typeIcons[tool.type as keyof typeof typeIcons];
                return (
                  <Card key={tool.id} className="flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Badge className={typeColors[tool.type as keyof typeof typeColors]}>
                        <TypeIcon className="mr-1 h-3 w-3" />
                        {tool.type}
                      </Badge>
                      <CardTitle className="line-clamp-1">{tool.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Install
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="mcps" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools
              .filter((t) => t.type === "mcp")
              .map((tool) => {
                const TypeIcon = typeIcons[tool.type as keyof typeof typeIcons];
                return (
                  <Card key={tool.id} className="flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Badge className={typeColors[tool.type as keyof typeof typeColors]}>
                        <TypeIcon className="mr-1 h-3 w-3" />
                        {tool.type}
                      </Badge>
                      <CardTitle className="line-clamp-1">{tool.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Install
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>

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
