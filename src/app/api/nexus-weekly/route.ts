import { NextRequest, NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { nexusWeeklyIssues } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

// GET /api/nexus-weekly - List all issues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const session = await auth();
    const isAdmin = session?.user?.role === "admin";

    let query = db
      .select()
      .from(nexusWeeklyIssues)
      .$dynamic();

    // Public users only see published issues
    if (!isAdmin) {
      query = query.where(eq(nexusWeeklyIssues.status, "published"));
    } else if (status && status !== "all") {
      query = query.where(eq(nexusWeeklyIssues.status, status as "draft" | "published"));
    }

    const issues = await query.orderBy(desc(nexusWeeklyIssues.issueNumber));

    return NextResponse.json({ issues });
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/nexus-weekly - Create a new issue (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { issueNumber, title, content, status } = body;

    if (!issueNumber || !title || !content) {
      return NextResponse.json(
        { error: "Issue number, title, and content are required" },
        { status: 400 }
      );
    }

    // Check if issue number already exists
    const existing = await db.query.nexusWeeklyIssues.findFirst({
      where: eq(nexusWeeklyIssues.issueNumber, issueNumber),
    });

    if (existing) {
      return NextResponse.json(
        { error: "An issue with this number already exists" },
        { status: 409 }
      );
    }

    const newIssue = await db
      .insert(nexusWeeklyIssues)
      .values({
        id: nanoid(),
        issueNumber,
        title,
        content,
        status: status || "draft",
        publishedAt: status === "published" ? new Date() : null,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Issue created successfully",
        issue: newIssue[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating issue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
