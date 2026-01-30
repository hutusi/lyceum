"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

interface NewsSearchProps {
  initialSearch?: string;
}

export function NewsSearch({ initialSearch }: NewsSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch || "");

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
      params.delete("page"); // Reset to first page on search
    } else {
      params.delete("search");
    }
    router.push(`/news?${params.toString()}`);
  }, 300);

  useEffect(() => {
    setSearch(initialSearch || "");
  }, [initialSearch]);

  return (
    <div className="relative max-w-xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search articles, videos, news..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          handleSearch(e.target.value);
        }}
        className="pl-10"
      />
    </div>
  );
}
