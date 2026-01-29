import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, Code, Newspaper, Star, ExternalLink, Github } from "lucide-react";

export const metadata: Metadata = {
  title: "Create",
  description: "Build innovative AI applications, showcase your projects, and explore the AI Nexus Weekly.",
};

const featuredProjects = [
  {
    id: 1,
    title: "AI Code Reviewer",
    description: "An AI-powered code review assistant that provides intelligent feedback on pull requests.",
    author: "techguru",
    stars: 45,
    tags: ["AI", "Code Review", "GitHub"],
    demoUrl: "#",
    repoUrl: "#",
  },
  {
    id: 2,
    title: "Prompt Library",
    description: "A curated collection of effective prompts for various AI models and use cases.",
    author: "promptmaster",
    stars: 32,
    tags: ["Prompts", "Library", "Templates"],
    demoUrl: "#",
    repoUrl: "#",
  },
  {
    id: 3,
    title: "Voice AI Assistant",
    description: "A voice-enabled AI assistant built with speech recognition and synthesis.",
    author: "voicedev",
    stars: 28,
    tags: ["Voice", "Assistant", "Speech"],
    demoUrl: "#",
    repoUrl: "#",
  },
];

const nexusWeeklyIssues = [
  {
    id: 1,
    issueNumber: 12,
    title: "The Rise of AI Agents",
    publishedAt: "January 20, 2025",
  },
  {
    id: 2,
    issueNumber: 11,
    title: "LLM Fine-tuning Best Practices",
    publishedAt: "January 13, 2025",
  },
  {
    id: 3,
    issueNumber: 10,
    title: "Building Production AI Systems",
    publishedAt: "January 6, 2025",
  },
];

export default function CreatePage() {
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <Card key={project.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary">Featured</Badge>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      {project.stars}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">by {project.author}</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      Code
                    </a>
                  </Button>
                  <Button size="sm" asChild className="flex-1">
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Demo
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/create/showcase">View All Projects</Link>
            </Button>
          </div>
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
                <Card className="border-dashed cursor-pointer hover:border-primary transition-colors">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg">OpenAI GPT</CardTitle>
                    <CardDescription>Test GPT-4 and GPT-3.5</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-dashed cursor-pointer hover:border-primary transition-colors">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg">Anthropic Claude</CardTitle>
                    <CardDescription>Test Claude 3 models</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-dashed cursor-pointer hover:border-primary transition-colors">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg">Open Source</CardTitle>
                    <CardDescription>Llama, Mistral, and more</CardDescription>
                  </CardHeader>
                </Card>
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
              {nexusWeeklyIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex justify-between items-center p-4 rounded-lg border hover:bg-muted transition-colors cursor-pointer"
                >
                  <div>
                    <Badge variant="outline" className="mb-2">
                      Issue #{issue.issueNumber}
                    </Badge>
                    <h3 className="font-medium">{issue.title}</h3>
                    <p className="text-sm text-muted-foreground">{issue.publishedAt}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/create/nexus-weekly/${issue.id}`}>Read →</Link>
                  </Button>
                </div>
              ))}
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
