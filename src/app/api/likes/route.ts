import { NextRequest, NextResponse } from "next/server";
import { eq, and, count, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { likes } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

type ResourceType = "article" | "project" | "discussion" | "tool" | "comment";

// GET /api/likes - Get like status and count for resources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceType = searchParams.get("resourceType") as ResourceType;
    const resourceId = searchParams.get("resourceId");
    const resourceIds = searchParams.get("resourceIds"); // Comma-separated for batch

    if (!resourceType) {
      return NextResponse.json(
        { error: "resourceType is required" },
        { status: 400 }
      );
    }

    const session = await auth();

    // Batch mode: get like counts for multiple resources
    if (resourceIds) {
      const ids = resourceIds.split(",").filter(Boolean);

      // Get like counts for all resources
      const likeCounts = await Promise.all(
        ids.map(async (id) => {
          const [result] = await db
            .select({ count: count() })
            .from(likes)
            .where(
              and(
                eq(likes.resourceType, resourceType),
                eq(likes.resourceId, id)
              )
            );
          return { resourceId: id, count: result.count };
        })
      );

      // Get user's likes if authenticated
      let userLikes: string[] = [];
      if (session?.user?.id) {
        const userLikeRecords = await db
          .select({ resourceId: likes.resourceId })
          .from(likes)
          .where(
            and(
              eq(likes.userId, session.user.id),
              eq(likes.resourceType, resourceType),
              inArray(likes.resourceId, ids)
            )
          );
        userLikes = userLikeRecords.map((l) => l.resourceId);
      }

      return NextResponse.json({
        likes: likeCounts.reduce(
          (acc, item) => ({
            ...acc,
            [item.resourceId]: {
              count: item.count,
              isLiked: userLikes.includes(item.resourceId),
            },
          }),
          {}
        ),
      });
    }

    // Single resource mode
    if (!resourceId) {
      return NextResponse.json(
        { error: "resourceId is required" },
        { status: 400 }
      );
    }

    // Get like count
    const [likeCount] = await db
      .select({ count: count() })
      .from(likes)
      .where(
        and(
          eq(likes.resourceType, resourceType),
          eq(likes.resourceId, resourceId)
        )
      );

    // Check if user has liked
    let isLiked = false;
    if (session?.user?.id) {
      const userLike = await db.query.likes.findFirst({
        where: and(
          eq(likes.userId, session.user.id),
          eq(likes.resourceType, resourceType),
          eq(likes.resourceId, resourceId)
        ),
      });
      isLiked = !!userLike;
    }

    return NextResponse.json({
      count: likeCount.count,
      isLiked,
    });
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/likes - Like a resource
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { resourceType, resourceId } = body;

    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: "resourceType and resourceId are required" },
        { status: 400 }
      );
    }

    const validTypes: ResourceType[] = ["article", "project", "discussion", "tool", "comment"];
    if (!validTypes.includes(resourceType)) {
      return NextResponse.json(
        { error: "Invalid resourceType" },
        { status: 400 }
      );
    }

    // Check if already liked
    const existingLike = await db.query.likes.findFirst({
      where: and(
        eq(likes.userId, session.user.id!),
        eq(likes.resourceType, resourceType),
        eq(likes.resourceId, resourceId)
      ),
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "Already liked" },
        { status: 409 }
      );
    }

    // Create like
    await db.insert(likes).values({
      id: nanoid(),
      userId: session.user.id!,
      resourceType,
      resourceId,
    });

    // Get updated count
    const [likeCount] = await db
      .select({ count: count() })
      .from(likes)
      .where(
        and(
          eq(likes.resourceType, resourceType),
          eq(likes.resourceId, resourceId)
        )
      );

    return NextResponse.json({
      message: "Liked successfully",
      isLiked: true,
      count: likeCount.count,
    });
  } catch (error) {
    console.error("Error liking resource:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/likes - Unlike a resource
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const resourceType = searchParams.get("resourceType") as ResourceType;
    const resourceId = searchParams.get("resourceId");

    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: "resourceType and resourceId are required" },
        { status: 400 }
      );
    }

    // Delete like
    await db
      .delete(likes)
      .where(
        and(
          eq(likes.userId, session.user.id!),
          eq(likes.resourceType, resourceType),
          eq(likes.resourceId, resourceId)
        )
      );

    // Get updated count
    const [likeCount] = await db
      .select({ count: count() })
      .from(likes)
      .where(
        and(
          eq(likes.resourceType, resourceType),
          eq(likes.resourceId, resourceId)
        )
      );

    return NextResponse.json({
      message: "Unliked successfully",
      isLiked: false,
      count: likeCount.count,
    });
  } catch (error) {
    console.error("Error unliking resource:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
