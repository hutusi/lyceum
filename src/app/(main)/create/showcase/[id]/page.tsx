import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { eq, or, and, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, users, likes } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Github, ExternalLink, Star, Calendar } from "lucide-react";
import { LikeButton } from "@/components/social";

type Props = {
  params: Promise<{ id: string }>;
};

async function getProject(id: string) {
  const project = await db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      content: projects.content,
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
    .where(eq(projects.id, id))
    .limit(1);

  return project[0] || null;
}

async function getProjectLikes(projectId: string, userId?: string) {
  const [likeCount] = await db
    .select({ count: count() })
    .from(likes)
    .where(
      and(
        eq(likes.resourceType, "project"),
        eq(likes.resourceId, projectId)
      )
    );

  let isLiked = false;
  if (userId) {
    const userLike = await db.query.likes.findFirst({
      where: and(
        eq(likes.userId, userId),
        eq(likes.resourceType, "project"),
        eq(likes.resourceId, projectId)
      ),
    });
    isLiked = !!userLike;
  }

  return { count: likeCount.count, isLiked };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: project.title,
    description: project.description || `Project: ${project.title}`,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  const isOwner = session?.user?.id === project.userId;
  const isPublic = project.status === "approved" || project.status === "featured";
  const likeData = await getProjectLikes(id, session?.user?.id);

  // Only show to public if approved/featured, or if user is owner/admin
  if (!isPublic && !isOwner && !isAdmin) {
    notFound();
  }

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="container py-8 max-w-4xl">
      <Link
        href="/create/showcase"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Showcase
      </Link>

      {/* Status Badge for pending projects */}
      {project.status === "pending" && (isOwner || isAdmin) && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            This project is pending review. It will be visible to others once approved by an admin.
          </p>
        </div>
      )}

      {project.status === "rejected" && (isOwner || isAdmin) && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">
            This project was not approved. Please review our guidelines and consider resubmitting.
          </p>
        </div>
      )}

      {/* Cover Image */}
      {project.coverImage && (
        <div className="relative aspect-video overflow-hidden rounded-lg mb-8">
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {project.status === "featured" && (
            <Badge className="bg-yellow-500/10 text-yellow-600">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-4">{project.title}</h1>

        {project.description && (
          <p className="text-lg text-muted-foreground mb-6">
            {project.description}
          </p>
        )}

        {/* Author & Date */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={project.userImage || undefined} />
              <AvatarFallback>{getInitials(project.userName)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{project.userName || "Anonymous"}</span>
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {project.createdAt?.toLocaleDateString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <LikeButton
            resourceType="project"
            resourceId={project.id}
            initialCount={likeData.count}
            initialIsLiked={likeData.isLiked}
            size="default"
            variant="outline"
          />
          {project.repoUrl && (
            <Button variant="outline" asChild>
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                View Code
              </a>
            </Button>
          )}
          {project.demoUrl && (
            <Button asChild>
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Live Demo
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {project.content && (
        <Card>
          <CardHeader>
            <CardTitle>About This Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {project.content}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
