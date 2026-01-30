"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle } from "lucide-react";

export function ProjectSubmitForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    repoUrl: "",
    demoUrl: "",
    coverImage: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit project");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Project Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Your project has been submitted for review. You&apos;ll be notified when it&apos;s approved.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push("/create/showcase")}>
              View Showcase
            </Button>
            <Button onClick={() => {
              setIsSubmitted(false);
              setFormData({
                title: "",
                description: "",
                content: "",
                repoUrl: "",
                demoUrl: "",
                coverImage: "",
              });
            }}>
              Submit Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              placeholder="My Awesome AI Project"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description *</Label>
            <Textarea
              id="description"
              placeholder="A brief description of what your project does..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              required
            />
            <p className="text-xs text-muted-foreground">
              This will appear in the project card. Keep it concise.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Full Description</Label>
            <Textarea
              id="content"
              placeholder="Detailed description of your project, how it works, technologies used, etc..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="repoUrl">Repository URL</Label>
              <Input
                id="repoUrl"
                type="url"
                placeholder="https://github.com/username/project"
                value={formData.repoUrl}
                onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="demoUrl">Demo URL</Label>
              <Input
                id="demoUrl"
                type="url"
                placeholder="https://myproject.demo.com"
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
              />
            </div>
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
            <p className="text-xs text-muted-foreground">
              A screenshot or preview image for your project (16:9 ratio recommended).
            </p>
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/create/showcase")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.title || !formData.description}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Project"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
