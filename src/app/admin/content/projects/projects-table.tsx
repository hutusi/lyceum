"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, ExternalLink, Check, Star, X, Trash2 } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  status: string | null;
  createdAt: Date | null;
  userId: string | null;
  userName: string | null;
}

interface ProjectsTableProps {
  projects: Project[];
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-600",
  approved: "bg-green-500/10 text-green-600",
  featured: "bg-blue-500/10 text-blue-600",
  rejected: "bg-red-500/10 text-red-600",
};

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setIsUpdating(id);
    try {
      await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await fetch(`/api/projects/${deleteId}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setDeleteId(null);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg border-dashed">
        <p className="text-muted-foreground">No projects submitted yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{project.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {project.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {project.userName || "Anonymous"}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {project.createdAt?.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isUpdating === project.id}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/create/showcase/${project.id}`} target="_blank">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Project
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {project.status !== "approved" && (
                        <DropdownMenuItem onClick={() => updateStatus(project.id, "approved")}>
                          <Check className="mr-2 h-4 w-4 text-green-600" />
                          Approve
                        </DropdownMenuItem>
                      )}
                      {project.status !== "featured" && (
                        <DropdownMenuItem onClick={() => updateStatus(project.id, "featured")}>
                          <Star className="mr-2 h-4 w-4 text-blue-600" />
                          Feature
                        </DropdownMenuItem>
                      )}
                      {project.status !== "rejected" && (
                        <DropdownMenuItem onClick={() => updateStatus(project.id, "rejected")}>
                          <X className="mr-2 h-4 w-4 text-red-600" />
                          Reject
                        </DropdownMenuItem>
                      )}
                      {project.status !== "pending" && (
                        <DropdownMenuItem onClick={() => updateStatus(project.id, "pending")}>
                          Reset to Pending
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteId(project.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
