import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { userSettings, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

// GET /api/user/settings - Get user settings
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, session.user.id),
    });

    return NextResponse.json(settings || {});
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/user/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      bio,
      website,
      location,
      github,
      twitter,
      emailNotifications,
      weeklyDigest,
      courseUpdates,
      discussionReplies,
      projectFeedback,
    } = body;

    const existingSettings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, session.user.id),
    });

    if (existingSettings) {
      await db
        .update(userSettings)
        .set({
          bio,
          website,
          location,
          github,
          twitter,
          emailNotifications,
          weeklyDigest,
          courseUpdates,
          discussionReplies,
          projectFeedback,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, session.user.id));
    } else {
      await db.insert(userSettings).values({
        id: nanoid(),
        userId: session.user.id,
        bio,
        website,
        location,
        github,
        twitter,
        emailNotifications,
        weeklyDigest,
        courseUpdates,
        discussionReplies,
        projectFeedback,
      });
    }

    const updatedSettings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, session.user.id),
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
