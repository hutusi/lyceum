"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Bot, Plug, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tag {
  name: string;
  slug: string;
  count: number;
}

interface ToolFiltersProps {
  currentType?: string;
  currentTag?: string;
  popularTags: Tag[];
}

const types = [
  { value: "all", label: "All", icon: null },
  { value: "skill", label: "Skills", icon: Wrench, color: "text-blue-500" },
  { value: "agent", label: "Agents", icon: Bot, color: "text-green-500" },
  { value: "mcp", label: "MCPs", icon: Plug, color: "text-purple-500" },
];

export function ToolFilters({ currentType, currentTag, popularTags }: ToolFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    router.push(`/share?${params.toString()}`);
  };

  const handleTagClick = (tagSlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentTag === tagSlug) {
      params.delete("tag");
    } else {
      params.set("tag", tagSlug);
    }
    router.push(`/share?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/share");
  };

  const hasFilters = currentType || currentTag || searchParams.get("search");

  return (
    <div className="space-y-4">
      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        {types.map((type) => {
          const Icon = type.icon;
          const isActive = (currentType || "all") === type.value;
          return (
            <Button
              key={type.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleTypeChange(type.value)}
              className={cn(!isActive && type.color)}
            >
              {Icon && <Icon className="mr-1 h-4 w-4" />}
              {type.label}
            </Button>
          );
        })}
      </div>

      {/* Tags Filter */}
      {popularTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Tags:</span>
          {popularTags.map((tag) => (
            <Badge
              key={tag.slug}
              variant={currentTag === tag.slug ? "default" : "outline"}
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleTagClick(tag.slug)}
            >
              {tag.name}
              {tag.count > 0 && <span className="ml-1 text-xs opacity-70">({tag.count})</span>}
            </Badge>
          ))}
        </div>
      )}

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
          <X className="mr-1 h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
