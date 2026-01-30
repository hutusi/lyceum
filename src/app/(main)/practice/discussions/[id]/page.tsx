import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, asc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { discussions, comments, users, practiceTopics } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Pin, MessageCircle } from "lucide-react";
import { CommentForm } from "./comment-form";
import { CommentList } from "./comment-list";

type Props = {
  params: Promise<{ id: string }>;
};

async function getDiscussionWithComments(id: string) {
  const discussion = await db
    .select({
      id: discussions.id,
      title: discussions.title,
      content: discussions.content,
      isPinned: discussions.isPinned,
      createdAt: discussions.createdAt,
      userId: discussions.userId,
      userName: users.name,
      userImage: users.image,
      topicId: discussions.topicId,
      topicTitle: practiceTopics.title,
      topicSlug: practiceTopics.slug,
    })
    .from(discussions)
    .leftJoin(users, eq(discussions.userId, users.id))
    .leftJoin(practiceTopics, eq(discussions.topicId, practiceTopics.id))
    .where(eq(discussions.id, id))
    .limit(1);

  if (discussion.length === 0) {
    return null;
  }

  // Fetch comments with user info
  const commentsList = await db
    .select({
      id: comments.id,
      content: comments.content,
      parentId: comments.parentId,
      createdAt: comments.createdAt,
      userId: comments.userId,
      userName: users.name,
      userImage: users.image,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.discussionId, id))
    .orderBy(asc(comments.createdAt));

  // Build nested comment tree
  type CommentWithReplies = (typeof commentsList)[0] & { replies: CommentWithReplies[] };
  const commentMap = new Map<string, CommentWithReplies>();
  const rootComments: CommentWithReplies[] = [];

  for (const comment of commentsList) {
    commentMap.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of commentsList) {
    const commentWithReplies = commentMap.get(comment.id)!;
    if (comment.parentId && commentMap.has(comment.parentId)) {
      commentMap.get(comment.parentId)!.replies.push(commentWithReplies);
    } else {
      rootComments.push(commentWithReplies);
    }
  }

  return { discussion: discussion[0], comments: rootComments };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getDiscussionWithComments(id);

  if (!data) {
    return { title: "Discussion Not Found" };
  }

  return {
    title: data.discussion.title,
    description: data.discussion.content.slice(0, 160),
  };
}

export default async function DiscussionDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getDiscussionWithComments(id);

  if (!data) {
    notFound();
  }

  const session = await auth();
  const { discussion, comments: commentsList } = data;

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="container py-8 max-w-4xl">
      <Link
        href={discussion.topicSlug ? `/practice/topics/${discussion.topicSlug}` : "/practice"}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {discussion.topicTitle || "Practice"}
      </Link>

      {/* Discussion */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {discussion.isPinned && (
              <Badge variant="secondary" className="gap-1">
                <Pin className="h-3 w-3" />
                Pinned
              </Badge>
            )}
            {discussion.topicTitle && (
              <Link href={`/practice/topics/${discussion.topicSlug}`}>
                <Badge variant="outline">{discussion.topicTitle}</Badge>
              </Link>
            )}
          </div>
          <CardTitle className="text-2xl">{discussion.title}</CardTitle>
          <CardDescription className="flex items-center gap-3 mt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={discussion.userImage || undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(discussion.userName)}
              </AvatarFallback>
            </Avatar>
            <span>{discussion.userName || "Anonymous"}</span>
            <span>-</span>
            <span>{discussion.createdAt?.toLocaleDateString()}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {discussion.content}
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h2 className="text-xl font-semibold">
            {commentsList.length} {commentsList.length === 1 ? "Reply" : "Replies"}
          </h2>
        </div>

        {/* Add Comment Form */}
        {session?.user ? (
          <CommentForm discussionId={discussion.id} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground mb-4">Sign in to reply</p>
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        {commentsList.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              No replies yet. Be the first to respond!
            </CardContent>
          </Card>
        ) : (
          <CommentList
            comments={commentsList}
            discussionId={discussion.id}
            currentUserId={session?.user?.id}
          />
        )}
      </div>
    </div>
  );
}
