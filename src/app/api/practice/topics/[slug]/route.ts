import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { practiceTopics, discussions } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

// GET /api/practice/topics/[slug] - Get topic details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const topic = await db
      .select({
        id: practiceTopics.id,
        title: practiceTopics.title,
        slug: practiceTopics.slug,
        description: practiceTopics.description,
        difficulty: practiceTopics.difficulty,
        category: practiceTopics.category,
        createdAt: practiceTopics.createdAt,
        discussionCount: sql<number>`(SELECT COUNT(*) FROM discussions WHERE topic_id = ${practiceTopics.id})`,
      })
      .from(practiceTopics)
      .where(eq(practiceTopics.slug, slug))
      .limit(1);

    if (topic.length === 0) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ topic: topic[0] });
  } catch (error) {
    console.error("Error fetching topic:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/practice/topics/[slug] - Update topic (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const { title, slug: newSlug, description, difficulty, category } = body;

    const topic = await db.query.practiceTopics.findFirst({
      where: eq(practiceTopics.slug, slug),
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    // Check if new slug is taken by another topic
    if (newSlug && newSlug !== slug) {
      const existing = await db.query.practiceTopics.findFirst({
        where: eq(practiceTopics.slug, newSlug),
      });

      if (existing) {
        return NextResponse.json(
          { error: "A topic with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (newSlug !== undefined) updateData.slug = newSlug;
    if (description !== undefined) updateData.description = description;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (category !== undefined) updateData.category = category;

    const updatedTopic = await db
      .update(practiceTopics)
      .set(updateData)
      .where(eq(practiceTopics.id, topic.id))
      .returning();

    return NextResponse.json({
      message: "Topic updated successfully",
      topic: updatedTopic[0],
    });
  } catch (error) {
    console.error("Error updating topic:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/practice/topics/[slug] - Delete topic (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

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

    await db.delete(practiceTopics).where(eq(practiceTopics.id, topic.id));

    return NextResponse.json({
      message: "Topic deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
