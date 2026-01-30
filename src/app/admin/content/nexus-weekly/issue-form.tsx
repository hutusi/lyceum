"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Issue {
  id: string;
  issueNumber: number;
  title: string;
  content: string;
  status: string | null;
}

interface IssueFormProps {
  issue?: Issue;
  nextIssueNumber?: number;
}

export function IssueForm({ issue, nextIssueNumber = 1 }: IssueFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    issueNumber: issue?.issueNumber || nextIssueNumber,
    title: issue?.title || "",
    content: issue?.content || "",
    status: issue?.status || "draft",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const url = issue
        ? `/api/nexus-weekly/${issue.id}`
        : "/api/nexus-weekly";

      const method = issue ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save issue");
      }

      router.push("/admin/content/nexus-weekly");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="issueNumber">Issue Number *</Label>
              <Input
                id="issueNumber"
                type="number"
                value={formData.issueNumber}
                onChange={(e) => setFormData({ ...formData, issueNumber: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="The Rise of AI Agents"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Write your newsletter content here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={20}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Use markdown formatting for rich content.
            </p>
          </div>

          <div className="space-y-2 max-w-xs">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/content/nexus-weekly")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : issue ? (
                "Update Issue"
              ) : (
                "Create Issue"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
