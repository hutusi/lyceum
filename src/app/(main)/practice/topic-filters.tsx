"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TopicFiltersProps {
  categories: string[];
}

export function TopicFilters({ categories }: TopicFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDifficultyChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== "all") {
      params.set("difficulty", value);
    } else {
      params.delete("difficulty");
    }
    params.set("tab", "topics");
    router.push(`/practice?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== "all") {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    params.set("tab", "topics");
    router.push(`/practice?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      <Select
        defaultValue={searchParams.get("difficulty") || "all"}
        onValueChange={handleDifficultyChange}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="easy">Easy</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="hard">Hard</SelectItem>
        </SelectContent>
      </Select>

      {categories.length > 0 && (
        <Select
          defaultValue={searchParams.get("category") || "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
