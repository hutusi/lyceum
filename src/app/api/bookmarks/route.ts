import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { bookmarks, articles, courses, sharedTools, discussions, projects } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

// GET /api/bookmarks - Get user's bookmarks
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let query = db.query.bookmarks.findMany({
      where: type
        ? and(
            eq(bookmarks.userId, session.user.id),
            eq(bookmarks.resourceType, type as "article" | "course" | "tool" | "discussion" | "project")
          )
        : eq(bookmarks.userId, session.user.id),
      orderBy: desc(bookmarks.createdAt),
    });

    const userBookmarks = await query;

    // Fetch details for each bookmark
    const bookmarksWithDetails = await Promise.all(
      userBookmarks.map(async (bookmark) => {
        let resource = null;

        switch (bookmark.resourceType) {
          case "article":
            resource = await db.query.articles.findFirst({
              where: eq(articles.id, bookmark.resourceId),
              columns: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                coverImage: true,
                type: true,
              },
            });
            break;
          case "course":
            resource = await db.query.courses.findFirst({
              where: eq(courses.id, bookmark.resourceId),
              columns: {
                id: true,
                title: true,
                slug: true,
                description: true,
                coverImage: true,
                difficulty: true,
              },
            });
            break;
          case "tool":
            resource = await db.query.sharedTools.findFirst({
              where: eq(sharedTools.id, bookmark.resourceId),
              columns: {
                id: true,
                name: true,
                slug: true,
                description: true,
                type: true,
              },
            });
            break;
          case "discussion":
            resource = await db.query.discussions.findFirst({
              where: eq(discussions.id, bookmark.resourceId),
              columns: {
                id: true,
                title: true,
                content: true,
              },
            });
            break;
          case "project":
            resource = await db.query.projects.findFirst({
              where: eq(projects.id, bookmark.resourceId),
              columns: {
                id: true,
                title: true,
                description: true,
                coverImage: true,
              },
            });
            break;
        }

        return {
          ...bookmark,
          resource,
        };
      })
    );

    // Filter out bookmarks where resource was deleted
    const validBookmarks = bookmarksWithDetails.filter((b) => b.resource !== null);

    return NextResponse.json({ bookmarks: validBookmarks });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/bookmarks - Add a bookmark
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { resourceType, resourceId } = body;

    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: "Resource type and ID are required" },
        { status: 400 }
      );
    }

    // Check if already bookmarked
    const existingBookmark = await db.query.bookmarks.findFirst({
      where: and(
        eq(bookmarks.userId, session.user.id),
        eq(bookmarks.resourceType, resourceType),
        eq(bookmarks.resourceId, resourceId)
      ),
    });

    if (existingBookmark) {
      return NextResponse.json(
        { error: "Already bookmarked" },
        { status: 409 }
      );
    }

    const newBookmark = await db
      .insert(bookmarks)
      .values({
        id: nanoid(),
        userId: session.user.id,
        resourceType,
        resourceId,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Bookmark added",
        bookmark: newBookmark[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding bookmark:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookmarks - Remove a bookmark
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const resourceType = searchParams.get("resourceType");
    const resourceId = searchParams.get("resourceId");

    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: "Resource type and ID are required" },
        { status: 400 }
      );
    }

    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, session.user.id),
          eq(bookmarks.resourceType, resourceType as "article" | "course" | "tool" | "discussion" | "project"),
          eq(bookmarks.resourceId, resourceId)
        )
      );

    return NextResponse.json({ message: "Bookmark removed" });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
