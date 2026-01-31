"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function FollowButton({
  userId,
  initialIsFollowing,
  onFollowChange,
  size = "default",
  variant = "default",
}: FollowButtonProps) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  // Don't show button if not logged in or viewing own profile
  if (!session?.user || session.user.id === userId) {
    return null;
  }

  async function handleToggleFollow() {
    setIsLoading(true);

    try {
      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch(`/api/users/${userId}/follow`, { method });

      if (response.ok) {
        const newState = !isFollowing;
        setIsFollowing(newState);
        onFollowChange?.(newState);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={isLoading}
      size={size}
      variant={isFollowing ? "outline" : variant}
      className={isFollowing ? "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive" : ""}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}
