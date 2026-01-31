"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ResourceType = "article" | "project" | "discussion" | "tool" | "comment";

interface LikeButtonProps {
  resourceType: ResourceType;
  resourceId: string;
  initialCount: number;
  initialIsLiked: boolean;
  onLikeChange?: (isLiked: boolean, count: number) => void;
  showCount?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function LikeButton({
  resourceType,
  resourceId,
  initialCount,
  initialIsLiked,
  onLikeChange,
  showCount = true,
  size = "sm",
  variant = "ghost",
}: LikeButtonProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggleLike() {
    if (!session?.user) {
      // Could redirect to login or show a toast
      return;
    }

    setIsLoading(true);

    try {
      let response;
      if (isLiked) {
        response = await fetch(
          `/api/likes?resourceType=${resourceType}&resourceId=${resourceId}`,
          { method: "DELETE" }
        );
      } else {
        response = await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceType, resourceId }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
        setCount(data.count);
        onLikeChange?.(data.isLiked, data.count);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handleToggleLike}
      disabled={isLoading || !session?.user}
      size={size}
      variant={variant}
      className={cn(
        "gap-1.5",
        isLiked && "text-red-500 hover:text-red-600"
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn(
            "h-4 w-4 transition-all",
            isLiked && "fill-current"
          )}
        />
      )}
      {showCount && count > 0 && (
        <span className="text-sm">{count}</span>
      )}
    </Button>
  );
}
