import { NextRequest, NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { practiceTopics, discussions, comments, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { trackActivity } from "@/lib/activity";
import { awardPoints } from "@/lib/gamification";

// GET /api/practice/topics/[slug]/discussions - List discussions for a topic
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const topic = await db.query.practiceTopics.findFirst({
      where: eq(practiceTopics.slug, slug),
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    const discussionsList = await db
      .select({
        id: discussions.id,
        title: discussions.title,
        content: discussions.content,
        isPinned: discussions.isPinned,
        createdAt: discussions.createdAt,
        userId: discussions.userId,
        userName: users.name,
        userImage: users.image,
        commentCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE discussion_id = ${discussions.id})`,
      })
      .from(discussions)
      .leftJoin(users, eq(discussions.userId, users.id))
      .where(eq(discussions.topicId, topic.id))
      .orderBy(desc(discussions.isPinned), desc(discussions.createdAt));

    return NextResponse.json({ discussions: discussionsList });
  } catch (error) {
    console.error("Error fetching discussions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/practice/topics/[slug]/discussions - Create a new discussion
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const topic = await db.query.practiceTopics.findFirst({
      where: eq(practiceTopics.slug, slug),
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    const newDiscussion = await db
      .insert(discussions)
      .values({
        id: nanoid(),
        topicId: topic.id,
        userId: session.user.id,
        title,
        content,
      })
      .returning();

    // Track activity
    await trackActivity({
      userId: session.user.id!,
      type: "discussion_created",
      resourceType: "discussion",
      resourceId: newDiscussion[0].id,
      resourceTitle: title,
      metadata: { topicId: topic.id, topicTitle: topic.title },
    });

    // Award points for creating discussion
    await awardPoints({
      userId: session.user.id!,
      type: "discussion_created",
      resourceType: "discussion",
      resourceId: newDiscussion[0].id,
    });

    return NextResponse.json(
      {
        message: "Discussion created successfully",
        discussion: newDiscussion[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating discussion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
