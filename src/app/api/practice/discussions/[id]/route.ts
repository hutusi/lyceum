import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { discussions, comments, users, practiceTopics } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

// GET /api/practice/discussions/[id] - Get discussion with comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
        commentCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE discussion_id = ${discussions.id})`,
      })
      .from(discussions)
      .leftJoin(users, eq(discussions.userId, users.id))
      .leftJoin(practiceTopics, eq(discussions.topicId, practiceTopics.id))
      .where(eq(discussions.id, id))
      .limit(1);

    if (discussion.length === 0) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ discussion: discussion[0] });
  } catch (error) {
    console.error("Error fetching discussion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/practice/discussions/[id] - Update discussion
export async function PATCH(
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
    const { title, content, isPinned } = body;

    const discussion = await db.query.discussions.findFirst({
      where: eq(discussions.id, id),
    });

    if (!discussion) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      );
    }

    // Only author or admin can update
    const isAdmin = session.user.role === "admin";
    const isAuthor = discussion.userId === session.user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: "You can only edit your own discussions" },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    // Only admin can pin/unpin
    if (isPinned !== undefined && isAdmin) {
      updateData.isPinned = isPinned;
    }

    const updatedDiscussion = await db
      .update(discussions)
      .set(updateData)
      .where(eq(discussions.id, id))
      .returning();

    return NextResponse.json({
      message: "Discussion updated successfully",
      discussion: updatedDiscussion[0],
    });
  } catch (error) {
    console.error("Error updating discussion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/practice/discussions/[id] - Delete discussion
export async function DELETE(
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

    const discussion = await db.query.discussions.findFirst({
      where: eq(discussions.id, id),
    });

    if (!discussion) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      );
    }

    // Only author or admin can delete
    const isAdmin = session.user.role === "admin";
    const isAuthor = discussion.userId === session.user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: "You can only delete your own discussions" },
        { status: 403 }
      );
    }

    await db.delete(discussions).where(eq(discussions.id, id));

    return NextResponse.json({
      message: "Discussion deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting discussion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
