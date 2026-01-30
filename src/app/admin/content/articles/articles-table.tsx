"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Search,
  Newspaper,
  Video,
  Radio,
  Globe,
  Archive,
  Loader2,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string | null;
  publishedAt: Date | null;
  createdAt: Date | null;
  author: string | null;
}

interface ArticlesTableProps {
  articles: Article[];
}

const statusColors: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-600",
  published: "bg-green-500/10 text-green-600",
  archived: "bg-gray-500/10 text-gray-600",
};

const typeIcons: Record<string, typeof Newspaper> = {
  article: Newspaper,
  news: Newspaper,
  video: Video,
  livestream: Radio,
};

const typeColors: Record<string, string> = {
  article: "text-blue-500",
  news: "text-green-500",
  video: "text-purple-500",
  livestream: "text-red-500",
};

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function ArticlesTable({ articles }: ArticlesTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"publish" | "archive" | "delete" | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || article.status === statusFilter;
    const matchesType = typeFilter === "all" || article.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const allSelected = filteredArticles.length > 0 && filteredArticles.every((a) => selectedIds.has(a.id));
  const someSelected = filteredArticles.some((a) => selectedIds.has(a.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredArticles.map((a) => a.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handlePublish = async (slug: string) => {
    try {
      await fetch(`/api/articles/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      router.refresh();
    } catch (error) {
      console.error("Error publishing:", error);
    }
  };

  const handleArchive = async (slug: string) => {
    try {
      await fetch(`/api/articles/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      router.refresh();
    } catch (error) {
      console.error("Error archiving:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteSlug) return;
    setIsDeleting(true);

    try {
      await fetch(`/api/articles/${deleteSlug}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setIsDeleting(false);
      setDeleteSlug(null);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setIsBulkLoading(true);

    const selectedArticles = articles.filter((a) => selectedIds.has(a.id));

    try {
      for (const article of selectedArticles) {
        if (bulkAction === "delete") {
          await fetch(`/api/articles/${article.slug}`, { method: "DELETE" });
        } else {
          await fetch(`/api/articles/${article.slug}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: bulkAction === "publish" ? "published" : "archived" }),
          });
        }
      }
      setSelectedIds(new Set());
      router.refresh();
    } catch (error) {
      console.error("Bulk action error:", error);
    } finally {
      setIsBulkLoading(false);
      setBulkAction(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="article">Article</SelectItem>
            <SelectItem value="news">News</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="livestream">Livestream</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkAction("publish")}
            >
              <Globe className="mr-2 h-4 w-4" />
              Publish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkAction("archive")}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600"
              onClick={() => setBulkAction("delete")}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto"
          >
            Clear selection
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No articles found
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles.map((article) => {
                const TypeIcon = typeIcons[article.type] || Newspaper;
                return (
                  <TableRow key={article.id} className={selectedIds.has(article.id) ? "bg-muted/50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(article.id)}
                        onCheckedChange={() => toggleOne(article.id)}
                        aria-label={`Select ${article.title}`}
                      />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium truncate max-w-[300px]">{article.title}</p>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${typeColors[article.type]}`}>
                        <TypeIcon className="h-4 w-4" />
                        <span className="capitalize">{article.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[article.status || "draft"]}>
                        {article.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{article.author || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(article.publishedAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(article.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/news/${article.slug}`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/content/articles/${article.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {article.status !== "published" && (
                            <DropdownMenuItem onClick={() => handlePublish(article.slug)}>
                              <Globe className="mr-2 h-4 w-4 text-green-500" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          {article.status !== "archived" && (
                            <DropdownMenuItem onClick={() => handleArchive(article.slug)}>
                              <Archive className="mr-2 h-4 w-4 text-gray-500" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteSlug(article.slug)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteSlug} onOpenChange={() => setDeleteSlug(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Action Confirmation */}
      <AlertDialog open={!!bulkAction} onOpenChange={() => setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === "publish" && "Publish Articles"}
              {bulkAction === "archive" && "Archive Articles"}
              {bulkAction === "delete" && "Delete Articles"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === "publish" &&
                `Are you sure you want to publish ${selectedIds.size} article(s)?`}
              {bulkAction === "archive" &&
                `Are you sure you want to archive ${selectedIds.size} article(s)?`}
              {bulkAction === "delete" &&
                `Are you sure you want to delete ${selectedIds.size} article(s)? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAction}
              disabled={isBulkLoading}
              className={bulkAction === "delete" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isBulkLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {bulkAction === "publish" && "Publish All"}
                  {bulkAction === "archive" && "Archive All"}
                  {bulkAction === "delete" && "Delete All"}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
