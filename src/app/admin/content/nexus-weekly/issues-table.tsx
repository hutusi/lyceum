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
import { MoreHorizontal, Pencil, Trash2, ExternalLink, Globe, FileText } from "lucide-react";

interface Issue {
  id: string;
  issueNumber: number;
  title: string;
  content: string;
  status: string | null;
  publishedAt: Date | null;
  createdAt: Date | null;
}

interface IssuesTableProps {
  issues: Issue[];
}

export function IssuesTable({ issues }: IssuesTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const togglePublish = async (id: string, currentStatus: string | null) => {
    setIsUpdating(id);
    const newStatus = currentStatus === "published" ? "draft" : "published";
    try {
      await fetch(`/api/nexus-weekly/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch (error) {
      console.error("Error updating issue:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await fetch(`/api/nexus-weekly/${deleteId}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (error) {
      console.error("Error deleting issue:", error);
    } finally {
      setDeleteId(null);
    }
  };

  if (issues.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg border-dashed">
        <p className="text-muted-foreground mb-4">No issues created yet</p>
        <Button asChild>
          <Link href="/admin/content/nexus-weekly/new">Create your first issue</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Issue</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>
                  <Badge variant="outline">#{issue.issueNumber}</Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{issue.title}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      issue.status === "published"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-yellow-500/10 text-yellow-600"
                    }
                  >
                    {issue.status === "published" ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {issue.publishedAt?.toLocaleDateString() || "-"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isUpdating === issue.id}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {issue.status === "published" && (
                        <DropdownMenuItem asChild>
                          <Link href={`/create/nexus-weekly/${issue.id}`} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/content/nexus-weekly/${issue.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => togglePublish(issue.id, issue.status)}>
                        {issue.status === "published" ? (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Globe className="mr-2 h-4 w-4" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteId(issue.id)}
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
            <AlertDialogTitle>Delete Issue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this issue? This action cannot be undone.
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
