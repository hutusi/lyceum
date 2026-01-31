import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { users, userFollows } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { trackActivity } from "@/lib/activity";

// POST /api/users/[id]/follow - Follow a user
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

    // Can't follow yourself
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userToFollow = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!userToFollow) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await db.query.userFollows.findFirst({
      where: and(
        eq(userFollows.followerId, session.user.id!),
        eq(userFollows.followingId, id)
      ),
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 409 }
      );
    }

    // Create follow relationship
    await db.insert(userFollows).values({
      id: nanoid(),
      followerId: session.user.id!,
      followingId: id,
    });

    // Track activity (optional - could be noisy)
    // await trackActivity({
    //   userId: session.user.id!,
    //   type: "user_followed",
    //   resourceType: "user",
    //   resourceId: id,
    //   resourceTitle: userToFollow.name || "User",
    // });

    return NextResponse.json({
      message: "Followed successfully",
      following: true,
    });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]/follow - Unfollow a user
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

    // Delete follow relationship
    await db
      .delete(userFollows)
      .where(
        and(
          eq(userFollows.followerId, session.user.id!),
          eq(userFollows.followingId, id)
        )
      );

    return NextResponse.json({
      message: "Unfollowed successfully",
      following: false,
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
