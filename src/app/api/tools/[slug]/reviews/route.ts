import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { sharedTools, toolReviews } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { awardPoints } from "@/lib/gamification";
import { trackActivity } from "@/lib/activity";

// POST /api/tools/[slug]/reviews - Add a review
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
    const { rating, content } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Get tool
    const tool = await db.query.sharedTools.findFirst({
      where: eq(sharedTools.slug, slug),
    });

    if (!tool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      );
    }

    // Check if user already reviewed this tool
    const existingReview = await db.query.toolReviews.findFirst({
      where: and(
        eq(toolReviews.toolId, tool.id),
        eq(toolReviews.userId, session.user.id!)
      ),
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this tool" },
        { status: 409 }
      );
    }

    // Create review
    const newReview = await db
      .insert(toolReviews)
      .values({
        id: nanoid(),
        toolId: tool.id,
        userId: session.user.id,
        rating,
        content,
      })
      .returning();

    // Update tool's star count (average rating * factor for display)
    const ratingResult = await db
      .select({
        avgRating: sql<number>`avg(${toolReviews.rating})`,
        totalReviews: sql<number>`count(*)`,
      })
      .from(toolReviews)
      .where(eq(toolReviews.toolId, tool.id));

    const avgRating = ratingResult[0]?.avgRating || 0;
    const totalReviews = ratingResult[0]?.totalReviews || 0;

    // Update stars as weighted average (avg * log(reviews+1) for visibility)
    const stars = Math.round(avgRating * Math.log(totalReviews + 1) * 10);
    await db
      .update(sharedTools)
      .set({ stars })
      .where(eq(sharedTools.id, tool.id));

    // Track activity
    await trackActivity({
      userId: session.user.id!,
      type: "review_added",
      resourceType: "review",
      resourceId: newReview[0].id,
      resourceTitle: tool.name,
    });

    // Award points for adding a review
    await awardPoints({
      userId: session.user.id!,
      type: "review_added",
      resourceType: "review",
      resourceId: newReview[0].id,
    });

    return NextResponse.json(
      {
        message: "Review added successfully",
        review: newReview[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
