"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reply, Trash2 } from "lucide-react";
import { CommentForm } from "./comment-form";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  content: string;
  parentId: string | null;
  createdAt: Date | null;
  userId: string | null;
  userName: string | null;
  userImage: string | null;
  replies: Comment[];
}

interface CommentListProps {
  comments: Comment[];
  discussionId: string;
  currentUserId?: string;
  depth?: number;
}

export function CommentList({
  comments,
  discussionId,
  currentUserId,
  depth = 0,
}: CommentListProps) {
  return (
    <div className={depth > 0 ? "ml-8 border-l-2 border-muted pl-4" : ""}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          discussionId={discussionId}
          currentUserId={currentUserId}
          depth={depth}
        />
      ))}
    </div>
  );
}

function CommentItem({
  comment,
  discussionId,
  currentUserId,
  depth,
}: {
  comment: Comment;
  discussionId: string;
  currentUserId?: string;
  depth: number;
}) {
  const router = useRouter();
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = currentUserId && currentUserId === comment.userId;
  const maxDepth = 3; // Limit nesting depth

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/practice/comments/${comment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="py-4">
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.userImage || undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(comment.userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {comment.userName || "Anonymous"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {comment.createdAt?.toLocaleDateString()}
                </span>
              </div>
              <div className="text-sm whitespace-pre-wrap">{comment.content}</div>
              <div className="flex items-center gap-2 mt-2">
                {depth < maxDepth && currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setIsReplying(!isReplying)}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-red-500 hover:text-red-600"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>

          {isReplying && (
            <div className="mt-4 ml-11">
              <CommentForm
                discussionId={discussionId}
                parentId={comment.id}
                onCancel={() => setIsReplying(false)}
                placeholder={`Reply to ${comment.userName || "this comment"}...`}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {comment.replies.length > 0 && (
        <CommentList
          comments={comment.replies}
          discussionId={discussionId}
          currentUserId={currentUserId}
          depth={depth + 1}
        />
      )}
    </div>
  );
}
