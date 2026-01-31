import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badges, userBadges } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { getUserBadges } from "@/lib/gamification";

// GET /api/gamification/badges - Get all badges or user's badges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      // Get specific user's earned badges
      const userBadgesList = await getUserBadges(userId);
      return NextResponse.json({ badges: userBadgesList });
    }

    // Get all badges with count of users who earned them
    const allBadges = await db
      .select({
        id: badges.id,
        name: badges.name,
        slug: badges.slug,
        description: badges.description,
        icon: badges.icon,
        category: badges.category,
        requirement: badges.requirement,
        threshold: badges.threshold,
        points: badges.points,
        earnedCount: sql<number>`(
          SELECT COUNT(*) FROM user_badges WHERE badge_id = ${badges.id}
        )`,
      })
      .from(badges)
      .orderBy(badges.category, badges.threshold);

    return NextResponse.json({ badges: allBadges });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
