"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Wrench, Bot, Plug, X, Loader2 } from "lucide-react";

const toolTypes = [
  {
    value: "skill",
    label: "Skill",
    description: "A reusable capability that extends your Code Agent",
    icon: Wrench,
    color: "text-blue-500",
  },
  {
    value: "agent",
    label: "Sub-Agent",
    description: "A specialized AI agent for delegated tasks",
    icon: Bot,
    color: "text-green-500",
  },
  {
    value: "mcp",
    label: "MCP",
    description: "Model Context Protocol for external service integration",
    icon: Plug,
    color: "text-purple-500",
  },
];

export function PublishForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    readme: "",
    type: "skill",
    repoUrl: "",
    configSchema: "",
  });

  const [tags, setTags] = useState<string[]>([]);
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
      // Validate config schema if provided
      let configSchema = null;
      if (formData.configSchema.trim()) {
        try {
          configSchema = JSON.parse(formData.configSchema);
        } catch {
          throw new Error("Invalid JSON in configuration schema");
        }
      }

      const response = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          configSchema,
          tags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to publish tool");
      }

      router.push(`/share?published=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish tool");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tool Type */}
      <Card>
        <CardHeader>
          <CardTitle>Tool Type</CardTitle>
          <CardDescription>Select the type of tool you want to publish</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {toolTypes.map((type) => {
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
                    className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Icon className={`mb-3 h-6 w-6 ${type.color}`} />
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
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Provide details about your tool</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="My Awesome Tool"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description *</Label>
            <Textarea
              id="description"
              placeholder="A brief description of what your tool does..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="readme">Readme / Documentation</Label>
            <Textarea
              id="readme"
              placeholder="Detailed documentation, usage instructions, examples..."
              value={formData.readme}
              onChange={(e) => setFormData({ ...formData, readme: e.target.value })}
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              Markdown formatting is supported
            </p>
          </div>

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

      {/* Repository & Config */}
      <Card>
        <CardHeader>
          <CardTitle>Repository & Configuration</CardTitle>
          <CardDescription>Link to your source code and provide configuration options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repoUrl">Repository URL</Label>
            <Input
              id="repoUrl"
              type="url"
              placeholder="https://github.com/username/repo"
              value={formData.repoUrl}
              onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="configSchema">Configuration Schema (JSON)</Label>
            <Textarea
              id="configSchema"
              placeholder={`{
  "apiKey": {
    "type": "string",
    "description": "Your API key",
    "required": true
  }
}`}
              value={formData.configSchema}
              onChange={(e) => setFormData({ ...formData, configSchema: e.target.value })}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Define configuration options users need to provide
            </p>
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
              Submitting...
            </>
          ) : (
            "Submit for Review"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Your submission will be reviewed by our team before being published.
        This typically takes 1-2 business days.
      </p>
    </form>
  );
}
