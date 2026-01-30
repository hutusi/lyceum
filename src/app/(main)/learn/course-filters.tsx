"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseFiltersProps {
  currentCategory?: string;
  currentDifficulty?: string;
}

const categories = [
  { value: "all", label: "All", icon: GraduationCap },
  { value: "course", label: "Courses", icon: BookOpen },
  { value: "workshop", label: "Workshops", icon: Users },
  { value: "prompt-engineering", label: "Prompt Engineering", icon: MessageSquare },
];

const difficulties = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner", color: "text-green-500" },
  { value: "intermediate", label: "Intermediate", color: "text-yellow-500" },
  { value: "advanced", label: "Advanced", color: "text-red-500" },
];

export function CourseFilters({ currentCategory, currentDifficulty }: CourseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/learn?${params.toString()}`);
  };

  const handleDifficultyChange = (difficulty: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (difficulty === "all") {
      params.delete("difficulty");
    } else {
      params.set("difficulty", difficulty);
    }
    router.push(`/learn?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/learn");
  };

  const hasFilters = currentCategory || currentDifficulty || searchParams.get("search");

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = (currentCategory || "all") === cat.value;
          return (
            <Button
              key={cat.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(cat.value)}
            >
              <Icon className="mr-1 h-4 w-4" />
              {cat.label}
            </Button>
          );
        })}
      </div>

      {/* Difficulty Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Difficulty:</span>
        {difficulties.map((diff) => {
          const isActive = (currentDifficulty || "all") === diff.value;
          return (
            <Button
              key={diff.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleDifficultyChange(diff.value)}
              className={cn(!isActive && diff.color)}
            >
              {diff.label}
            </Button>
          );
        })}
      </div>

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
