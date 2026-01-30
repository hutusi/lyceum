"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, Star, ExternalLink, Github, Loader2 } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  coverImage: string | null;
  createdAt: Date | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

interface ProjectsModerationProps {
  projects: Project[];
}

export function ProjectsModeration({ projects: initialProjects }: ProjectsModerationProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectProjectId, setRejectProjectId] = useState<string | null>(null);

  const handleAction = async (projectId: string, status: "approved" | "featured" | "rejected") => {
    setActionLoading(projectId);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project");
    } finally {
      setActionLoading(null);
      setRejectProjectId(null);
    }
  };

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No pending projects to review.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {project.title}
                  <Badge variant="outline">Pending Review</Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  {project.description}
                </CardDescription>
              </div>
              {project.coverImage && (
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="w-20 h-20 object-cover rounded-md ml-4"
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Submitter Info */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <Avatar className="h-8 w-8">
                <AvatarImage src={project.user?.image || ""} />
                <AvatarFallback>
                  {project.user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{project.user?.name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{project.user?.email}</p>
              </div>
              <span className="text-xs text-muted-foreground ml-auto">
                Submitted {project.createdAt?.toLocaleDateString()}
              </span>
            </div>

            {/* Content Preview */}
            {project.content && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm whitespace-pre-wrap line-clamp-6">
                  {project.content}
                </p>
              </div>
            )}

            {/* Links */}
            <div className="flex gap-4">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Github className="h-4 w-4" />
                  Repository
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                  Demo
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => handleAction(project.id, "approved")}
                disabled={actionLoading === project.id}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading === project.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction(project.id, "featured")}
                disabled={actionLoading === project.id}
              >
                <Star className="mr-2 h-4 w-4" />
                Approve & Feature
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setRejectProjectId(project.id)}
                disabled={actionLoading === project.id}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={!!rejectProjectId} onOpenChange={() => setRejectProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this project? The submitter will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => rejectProjectId && handleAction(rejectProjectId, "rejected")}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
