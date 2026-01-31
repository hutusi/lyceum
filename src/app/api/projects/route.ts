import { NextRequest, NextResponse } from "next/server";
import { eq, desc, like, or, and, sql, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { projects, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { trackActivity } from "@/lib/activity";
import { awardPoints } from "@/lib/gamification";

// GET /api/projects - List projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");

    let query = db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        repoUrl: projects.repoUrl,
        demoUrl: projects.demoUrl,
        coverImage: projects.coverImage,
        status: projects.status,
        createdAt: projects.createdAt,
        userId: projects.userId,
        userName: users.name,
        userImage: users.image,
      })
      .from(projects)
      .leftJoin(users, eq(projects.userId, users.id))
      .$dynamic();

    // By default, only show approved projects to public
    const session = await auth();
    const isAdmin = session?.user?.role === "admin";

    if (!isAdmin) {
      // Public: show approved and featured only
      if (featured === "true") {
        query = query.where(eq(projects.status, "featured"));
      } else {
        query = query.where(
          or(eq(projects.status, "approved"), eq(projects.status, "featured"))
        );
      }
    } else if (status && status !== "all") {
      // Admin: can filter by status
      query = query.where(eq(projects.status, status as "pending" | "approved" | "featured" | "rejected"));
    }

    if (search) {
      query = query.where(like(projects.title, `%${search}%`));
    }

    const projectsList = await query.orderBy(desc(projects.createdAt));

    return NextResponse.json({ projects: projectsList });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Submit a new project
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
    const { title, description, content, repoUrl, demoUrl, coverImage } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const newProject = await db
      .insert(projects)
      .values({
        id: nanoid(),
        userId: session.user.id,
        title,
        description,
        content,
        repoUrl,
        demoUrl,
        coverImage,
        status: "pending", // Projects start as pending for admin review
      })
      .returning();

    // Track activity
    await trackActivity({
      userId: session.user.id!,
      type: "project_submitted",
      resourceType: "project",
      resourceId: newProject[0].id,
      resourceTitle: title,
    });

    // Award points for project submission
    await awardPoints({
      userId: session.user.id!,
      type: "project_submitted",
      resourceType: "project",
      resourceId: newProject[0].id,
    });

    // Check if this is the first project for bonus points
    const projectCount = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.userId, session.user.id!));

    if (projectCount[0]?.count === 1) {
      await awardPoints({
        userId: session.user.id!,
        type: "first_project",
        description: "Bonus for your first project submission!",
      });
    }

    return NextResponse.json(
      {
        message: "Project submitted successfully. It will be reviewed by an admin.",
        project: newProject[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
