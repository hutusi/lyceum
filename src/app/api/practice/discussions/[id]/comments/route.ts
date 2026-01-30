import { NextRequest, NextResponse } from "next/server";
import { eq, asc, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { discussions, comments, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { trackActivity } from "@/lib/activity";

// GET /api/practice/discussions/[id]/comments - Get comments for a discussion
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const discussion = await db.query.discussions.findFirst({
      where: eq(discussions.id, id),
    });

    if (!discussion) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      );
    }

    // Get all comments for this discussion
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
    const commentMap = new Map();
    const rootComments: typeof commentsList = [];

    // First pass: create map of all comments
    for (const comment of commentsList) {
      commentMap.set(comment.id, { ...comment, replies: [] });
    }

    // Second pass: build tree structure
    for (const comment of commentsList) {
      const commentWithReplies = commentMap.get(comment.id);
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId).replies.push(commentWithReplies);
      } else {
        rootComments.push(commentWithReplies);
      }
    }

    return NextResponse.json({ comments: rootComments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/practice/discussions/[id]/comments - Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { content, parentId } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const discussion = await db.query.discussions.findFirst({
      where: eq(discussions.id, id),
    });

    if (!discussion) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      );
    }

    // If parentId is provided, verify it exists and belongs to this discussion
    if (parentId) {
      const parentComment = await db.query.comments.findFirst({
        where: eq(comments.id, parentId),
      });

      if (!parentComment || parentComment.discussionId !== id) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    const newComment = await db
      .insert(comments)
      .values({
        id: nanoid(),
        discussionId: id,
        userId: session.user.id,
        content,
        parentId: parentId || null,
      })
      .returning();

    // Track activity
    await trackActivity({
      userId: session.user.id!,
      type: "comment_added",
      resourceType: "comment",
      resourceId: newComment[0].id,
      resourceTitle: discussion.title,
      metadata: { discussionId: id },
    });

    // Fetch with user info
    const commentWithUser = await db
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
      .where(eq(comments.id, newComment[0].id))
      .limit(1);

    return NextResponse.json(
      {
        message: "Comment added successfully",
        comment: { ...commentWithUser[0], replies: [] },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
