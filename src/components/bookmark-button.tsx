"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  resourceType: "article" | "course" | "tool" | "discussion" | "project";
  resourceId: string;
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function BookmarkButton({
  resourceType,
  resourceId,
  className,
  variant = "ghost",
  size = "icon",
}: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      setIsChecking(false);
      return;
    }

    // Check if already bookmarked
    const checkBookmark = async () => {
      try {
        const res = await fetch(`/api/bookmarks?type=${resourceType}`);
        if (res.ok) {
          const data = await res.json();
          const found = data.bookmarks.some(
            (b: { resourceId: string }) => b.resourceId === resourceId
          );
          setIsBookmarked(found);
        }
      } catch (error) {
        console.error("Error checking bookmark:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkBookmark();
  }, [session, resourceType, resourceId]);

  const handleToggle = async () => {
    if (!session?.user) {
      // Could redirect to login or show a message
      return;
    }

    setIsLoading(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const res = await fetch(
          `/api/bookmarks?resourceType=${resourceType}&resourceId=${resourceId}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          setIsBookmarked(false);
        }
      } else {
        // Add bookmark
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceType, resourceId }),
        });
        if (res.ok) {
          setIsBookmarked(true);
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  if (isChecking) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={className}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        isBookmarked && "text-primary",
        className
      )}
      title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
}
