import { NextRequest, NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { sharedTools, toolTags, sharedToolTags, toolVersions, toolReviews, users } from "@/lib/db/schema";

// GET /api/tools/[slug] - Get tool details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get tool with user info
    const tool = await db
      .select({
        id: sharedTools.id,
        name: sharedTools.name,
        slug: sharedTools.slug,
        description: sharedTools.description,
        readme: sharedTools.readme,
        type: sharedTools.type,
        version: sharedTools.version,
        repoUrl: sharedTools.repoUrl,
        installCommand: sharedTools.installCommand,
        configSchema: sharedTools.configSchema,
        downloads: sharedTools.downloads,
        stars: sharedTools.stars,
        status: sharedTools.status,
        publishedAt: sharedTools.publishedAt,
        createdAt: sharedTools.createdAt,
        userId: sharedTools.userId,
        userName: users.name,
        userImage: users.image,
      })
      .from(sharedTools)
      .leftJoin(users, eq(sharedTools.userId, users.id))
      .where(eq(sharedTools.slug, slug))
      .limit(1);

    if (tool.length === 0) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      );
    }

    const toolData = tool[0];

    // Get tags
    const tags = await db
      .select({
        id: toolTags.id,
        name: toolTags.name,
        slug: toolTags.slug,
      })
      .from(sharedToolTags)
      .innerJoin(toolTags, eq(sharedToolTags.tagId, toolTags.id))
      .where(eq(sharedToolTags.toolId, toolData.id));

    // Get versions
    const versions = await db
      .select()
      .from(toolVersions)
      .where(eq(toolVersions.toolId, toolData.id))
      .orderBy(desc(toolVersions.publishedAt));

    // Get reviews with user info
    const reviews = await db
      .select({
        id: toolReviews.id,
        rating: toolReviews.rating,
        content: toolReviews.content,
        createdAt: toolReviews.createdAt,
        userId: toolReviews.userId,
        userName: users.name,
        userImage: users.image,
      })
      .from(toolReviews)
      .leftJoin(users, eq(toolReviews.userId, users.id))
      .where(eq(toolReviews.toolId, toolData.id))
      .orderBy(desc(toolReviews.createdAt))
      .limit(20);

    // Calculate average rating
    const ratingResult = await db
      .select({
        avgRating: sql<number>`avg(${toolReviews.rating})`,
        totalReviews: sql<number>`count(*)`,
      })
      .from(toolReviews)
      .where(eq(toolReviews.toolId, toolData.id));

    const avgRating = ratingResult[0]?.avgRating || 0;
    const totalReviews = ratingResult[0]?.totalReviews || 0;

    return NextResponse.json({
      ...toolData,
      author: {
        id: toolData.userId,
        name: toolData.userName,
        image: toolData.userImage,
      },
      tags,
      versions,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        content: r.content,
        createdAt: r.createdAt,
        user: {
          id: r.userId,
          name: r.userName,
          image: r.userImage,
        },
      })),
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews,
    });
  } catch (error) {
    console.error("Error fetching tool:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
