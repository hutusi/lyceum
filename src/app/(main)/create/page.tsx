import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { eq, desc, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, nexusWeeklyIssues, users } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, Code, Newspaper, Star, ExternalLink, Github, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Create",
  description: "Build innovative AI applications, showcase your projects, and explore the AI Nexus Weekly.",
};

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  // Fetch featured/approved projects
  const featuredProjects = await db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      repoUrl: projects.repoUrl,
      demoUrl: projects.demoUrl,
      coverImage: projects.coverImage,
      status: projects.status,
      userName: users.name,
    })
    .from(projects)
    .leftJoin(users, eq(projects.userId, users.id))
    .where(or(eq(projects.status, "featured"), eq(projects.status, "approved")))
    .orderBy(desc(projects.status), desc(projects.createdAt))
    .limit(6);

  // Fetch latest Nexus Weekly issues
  const latestIssues = await db
    .select()
    .from(nexusWeeklyIssues)
    .where(eq(nexusWeeklyIssues.status, "published"))
    .orderBy(desc(nexusWeeklyIssues.issueNumber))
    .limit(3);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create</h1>
        <p className="text-muted-foreground">
          Build innovative AI applications, showcase your projects, and explore the AI Nexus Weekly.
        </p>
      </div>

      <Tabs defaultValue="showcase" className="space-y-6">
        <TabsList>
          <TabsTrigger value="showcase" className="gap-2">
            <Rocket className="h-4 w-4" />
            Project Showcase
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Code className="h-4 w-4" />
            API Playground
          </TabsTrigger>
          <TabsTrigger value="nexus" className="gap-2">
            <Newspaper className="h-4 w-4" />
            AI Nexus Weekly
          </TabsTrigger>
        </TabsList>

        <TabsContent value="showcase" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Featured Projects</h2>
            <Button asChild>
              <Link href="/create/showcase/submit">Submit Your Project</Link>
            </Button>
          </div>

          {featuredProjects.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="text-center">
                <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <CardTitle>No Projects Yet</CardTitle>
                <CardDescription>
                  Be the first to submit a project to the showcase!
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-center">
                <Button asChild>
                  <Link href="/create/showcase/submit">Submit Your Project</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProjects.map((project) => (
                  <Card key={project.id} className="flex flex-col hover:shadow-lg transition-shadow">
                    {project.coverImage && (
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        <Image
                          src={project.coverImage}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        {project.status === "featured" && (
                          <Badge className="bg-yellow-500/10 text-yellow-600">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="line-clamp-1">
                        <Link href={`/create/showcase/${project.id}`} className="hover:underline">
                          {project.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground">by {project.userName || "Anonymous"}</p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      {project.repoUrl && (
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            Code
                          </a>
                        </Button>
                      )}
                      {project.demoUrl && (
                        <Button size="sm" asChild className="flex-1">
                          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Demo
                          </a>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <div className="text-center">
                <Button variant="outline" asChild>
                  <Link href="/create/showcase">View All Projects</Link>
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Playground</CardTitle>
              <CardDescription>
                Test and experiment with various AI model APIs in a sandboxed environment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/create/api-playground?model=openai">
                  <Card className="border-dashed cursor-pointer hover:border-primary transition-colors">
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">OpenAI GPT</CardTitle>
                      <CardDescription>Test GPT-4 and GPT-3.5</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Link href="/create/api-playground?model=anthropic">
                  <Card className="border-dashed cursor-pointer hover:border-primary transition-colors">
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">Anthropic Claude</CardTitle>
                      <CardDescription>Test Claude 3 models</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Link href="/create/api-playground?model=opensource">
                  <Card className="border-dashed cursor-pointer hover:border-primary transition-colors">
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">Open Source</CardTitle>
                      <CardDescription>Llama, Mistral, and more</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/create/api-playground">Open API Playground</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="nexus" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                AI Nexus Weekly
              </CardTitle>
              <CardDescription>
                Your weekly digest of AI news, trends, and community highlights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  The first issue of AI Nexus Weekly is coming soon!
                </div>
              ) : (
                latestIssues.map((issue) => (
                  <Link
                    key={issue.id}
                    href={`/create/nexus-weekly/${issue.id}`}
                    className="block"
                  >
                    <div className="flex justify-between items-center p-4 rounded-lg border hover:bg-muted transition-colors">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          Issue #{issue.issueNumber}
                        </Badge>
                        <h3 className="font-medium">{issue.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {issue.publishedAt?.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Read →
                      </Button>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/create/nexus-weekly">View All Issues</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
