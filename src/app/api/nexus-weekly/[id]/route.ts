import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { nexusWeeklyIssues } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

// GET /api/nexus-weekly/[id] - Get issue details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const isAdmin = session?.user?.role === "admin";

    const issue = await db.query.nexusWeeklyIssues.findFirst({
      where: eq(nexusWeeklyIssues.id, id),
    });

    if (!issue) {
      return NextResponse.json(
        { error: "Issue not found" },
        { status: 404 }
      );
    }

    // Only show published issues to public
    if (issue.status !== "published" && !isAdmin) {
      return NextResponse.json(
        { error: "Issue not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ issue });
  } catch (error) {
    console.error("Error fetching issue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/nexus-weekly/[id] - Update issue (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { issueNumber, title, content, status } = body;

    const issue = await db.query.nexusWeeklyIssues.findFirst({
      where: eq(nexusWeeklyIssues.id, id),
    });

    if (!issue) {
      return NextResponse.json(
        { error: "Issue not found" },
        { status: 404 }
      );
    }

    // Check if new issue number is taken
    if (issueNumber && issueNumber !== issue.issueNumber) {
      const existing = await db.query.nexusWeeklyIssues.findFirst({
        where: eq(nexusWeeklyIssues.issueNumber, issueNumber),
      });

      if (existing) {
        return NextResponse.json(
          { error: "An issue with this number already exists" },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (issueNumber !== undefined) updateData.issueNumber = issueNumber;
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) {
      updateData.status = status;
      // Set publishedAt when publishing
      if (status === "published" && issue.status !== "published") {
        updateData.publishedAt = new Date();
      }
    }

    const updatedIssue = await db
      .update(nexusWeeklyIssues)
      .set(updateData)
      .where(eq(nexusWeeklyIssues.id, id))
      .returning();

    return NextResponse.json({
      message: "Issue updated successfully",
      issue: updatedIssue[0],
    });
  } catch (error) {
    console.error("Error updating issue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/nexus-weekly/[id] - Delete issue (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const issue = await db.query.nexusWeeklyIssues.findFirst({
      where: eq(nexusWeeklyIssues.id, id),
    });

    if (!issue) {
      return NextResponse.json(
        { error: "Issue not found" },
        { status: 404 }
      );
    }

    await db.delete(nexusWeeklyIssues).where(eq(nexusWeeklyIssues.id, id));

    return NextResponse.json({
      message: "Issue deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting issue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
