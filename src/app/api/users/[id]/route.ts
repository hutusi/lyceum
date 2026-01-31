import { NextRequest, NextResponse } from "next/server";
import { eq, count, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, userFollows, userSettings, projects, discussions, userPoints } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

// GET /api/users/[id] - Get user profile with stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user settings (bio, links)
    const settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, id),
    });

    // Get follower count
    const [followerCount] = await db
      .select({ count: count() })
      .from(userFollows)
      .where(eq(userFollows.followingId, id));

    // Get following count
    const [followingCount] = await db
      .select({ count: count() })
      .from(userFollows)
      .where(eq(userFollows.followerId, id));

    // Get project count (approved only)
    const [projectCount] = await db
      .select({ count: count() })
      .from(projects)
      .where(
        and(
          eq(projects.userId, id),
          eq(projects.status, "approved")
        )
      );

    // Get discussion count
    const [discussionCount] = await db
      .select({ count: count() })
      .from(discussions)
      .where(eq(discussions.userId, id));

    // Get points data
    const pointsData = await db.query.userPoints.findFirst({
      where: eq(userPoints.userId, id),
    });

    // Check if current user is following this user
    let isFollowing = false;
    if (session?.user?.id && session.user.id !== id) {
      const follow = await db.query.userFollows.findFirst({
        where: and(
          eq(userFollows.followerId, session.user.id),
          eq(userFollows.followingId, id)
        ),
      });
      isFollowing = !!follow;
    }

    return NextResponse.json({
      user: {
        ...user,
        bio: settings?.bio || null,
        website: settings?.website || null,
        github: settings?.github || null,
        twitter: settings?.twitter || null,
        location: settings?.location || null,
      },
      stats: {
        followers: followerCount.count,
        following: followingCount.count,
        projects: projectCount.count,
        discussions: discussionCount.count,
        points: pointsData?.totalPoints || 0,
        level: pointsData?.level || 1,
      },
      isFollowing,
      isOwnProfile: session?.user?.id === id,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
