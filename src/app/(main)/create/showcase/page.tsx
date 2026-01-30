import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { eq, desc, or, like } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Github, ExternalLink, Star } from "lucide-react";
import { ProjectSearch } from "./project-search";

export const metadata: Metadata = {
  title: "Project Showcase",
  description: "Explore innovative AI projects built by our community.",
};

interface Props {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function ShowcasePage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search || "";
  const session = await auth();

  let query = db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      repoUrl: projects.repoUrl,
      demoUrl: projects.demoUrl,
      coverImage: projects.coverImage,
      status: projects.status,
      createdAt: projects.createdAt,
      userId: projects.userId,
      userName: users.name,
      userImage: users.image,
    })
    .from(projects)
    .leftJoin(users, eq(projects.userId, users.id))
    .where(or(eq(projects.status, "approved"), eq(projects.status, "featured")))
    .$dynamic();

  if (search) {
    query = query.where(like(projects.title, `%${search}%`));
  }

  const projectsList = await query.orderBy(
    desc(projects.status), // Featured first
    desc(projects.createdAt)
  );

  return (
    <div className="container py-8">
      <Link
        href="/create"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Create
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Project Showcase</h1>
          <p className="text-muted-foreground">
            Explore innovative AI projects built by our community.
          </p>
        </div>
        {session?.user && (
          <Button asChild>
            <Link href="/create/showcase/submit">Submit Your Project</Link>
          </Button>
        )}
      </div>

      <div className="mb-6">
        <ProjectSearch />
      </div>

      {projectsList.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <CardTitle>No Projects Found</CardTitle>
            <CardDescription>
              {search
                ? "Try adjusting your search query."
                : "Be the first to submit a project!"}
            </CardDescription>
          </CardHeader>
          {session?.user && !search && (
            <CardFooter className="justify-center">
              <Button asChild>
                <Link href="/create/showcase/submit">Submit Your Project</Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsList.map((project) => (
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
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  by {project.userName || "Anonymous"}
                </p>
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
                {!project.repoUrl && !project.demoUrl && (
                  <Button asChild className="w-full">
                    <Link href={`/create/showcase/${project.id}`}>View Details</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
