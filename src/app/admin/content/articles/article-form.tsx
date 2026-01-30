"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Video, Radio, X, Loader2 } from "lucide-react";

interface ArticleFormProps {
  article?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    type: string;
    videoUrl: string | null;
    status: string | null;
    tags: { name: string; slug: string }[];
  };
}

const articleTypes = [
  {
    value: "article",
    label: "Article",
    description: "Long-form written content",
    icon: Newspaper,
    color: "text-blue-500",
  },
  {
    value: "news",
    label: "News",
    description: "Short news updates and announcements",
    icon: Newspaper,
    color: "text-green-500",
  },
  {
    value: "video",
    label: "Video",
    description: "Video content with embed support",
    icon: Video,
    color: "text-purple-500",
  },
  {
    value: "livestream",
    label: "Live Stream",
    description: "Live streaming events",
    icon: Radio,
    color: "text-red-500",
  },
];

export function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: article?.title || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    coverImage: article?.coverImage || "",
    type: article?.type || "article",
    videoUrl: article?.videoUrl || "",
    status: article?.status || "draft",
  });

  const [tags, setTags] = useState<string[]>(article?.tags.map((t) => t.name) || []);
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const url = article ? `/api/articles/${article.slug}` : "/api/articles";
      const method = article ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tagNames: tags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save article");
      }

      router.push("/admin/content/articles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save article");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showVideoUrl = formData.type === "video" || formData.type === "livestream";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Article Type */}
      <Card>
        <CardHeader>
          <CardTitle>Content Type</CardTitle>
          <CardDescription>Select the type of content you want to create</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {articleTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.value}>
                  <RadioGroupItem
                    value={type.value}
                    id={type.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={type.value}
                    className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                  >
                    <Icon className={`mb-2 h-6 w-6 ${type.color}`} />
                    <span className="font-medium">{type.label}</span>
                    <span className="text-xs text-muted-foreground text-center mt-1">
                      {type.description}
                    </span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
          <CardDescription>Fill in the details for your content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              placeholder="A brief summary of the content..."
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Write your content here... (Markdown supported)"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Supports Markdown formatting: **bold**, *italic*, `code`, [links](url), etc.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            />
          </div>

          {showVideoUrl && (
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL *</Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                required={showVideoUrl}
              />
              <p className="text-xs text-muted-foreground">
                Supports YouTube, Vimeo, and Bilibili URLs
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (press Enter to add)</Label>
            <Input
              id="tags"
              placeholder="Add up to 5 tags..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              disabled={tags.length >= 5}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Publishing */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
          <CardDescription>Choose when to publish your content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="status" className="w-[200px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : article ? (
            "Update Article"
          ) : (
            "Create Article"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
