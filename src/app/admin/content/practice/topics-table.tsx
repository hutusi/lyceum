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
import { MoreHorizontal, Pencil, Trash2, ExternalLink, MessageCircle } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: string | null;
  category: string | null;
  createdAt: Date | null;
  discussionCount: number;
}

interface TopicsTableProps {
  topics: Topic[];
}

const difficultyColors = {
  easy: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  hard: "bg-red-500/10 text-red-500",
};

export function TopicsTable({ topics }: TopicsTableProps) {
  const router = useRouter();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteSlug) return;

    try {
      await fetch(`/api/practice/topics/${deleteSlug}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (error) {
      console.error("Error deleting topic:", error);
    } finally {
      setDeleteSlug(null);
    }
  };

  if (topics.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg border-dashed">
        <p className="text-muted-foreground mb-4">No practice topics yet</p>
        <Button asChild>
          <Link href="/admin/content/practice/new">Create your first topic</Link>
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
              <TableHead>Title</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Discussions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{topic.title}</div>
                    <div className="text-sm text-muted-foreground">/practice/topics/{topic.slug}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {topic.difficulty && (
                    <Badge className={difficultyColors[topic.difficulty as keyof typeof difficultyColors]}>
                      {topic.difficulty}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {topic.category && (
                    <Badge variant="outline">{topic.category}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    {topic.discussionCount}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {topic.createdAt?.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/practice/topics/${topic.slug}`} target="_blank">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/content/practice/${topic.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteSlug(topic.slug)}
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

      <AlertDialog open={!!deleteSlug} onOpenChange={() => setDeleteSlug(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this topic? This will also delete all associated discussions and comments. This action cannot be undone.
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
