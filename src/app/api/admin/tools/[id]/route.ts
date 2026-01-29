import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sharedTools } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

// PATCH /api/admin/tools/[id] - Update tool status (admin only)
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
    const { status } = body;

    if (!status || !["pending", "approved", "featured", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status required (pending, approved, featured, rejected)" },
        { status: 400 }
      );
    }

    // Get tool
    const tool = await db.query.sharedTools.findFirst({
      where: eq(sharedTools.id, id),
    });

    if (!tool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      );
    }

    // Update status
    const updatedTool = await db
      .update(sharedTools)
      .set({
        status,
        publishedAt: status === "approved" || status === "featured" ? new Date() : tool.publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(sharedTools.id, id))
      .returning();

    return NextResponse.json({
      message: "Tool status updated successfully",
      tool: updatedTool[0],
    });
  } catch (error) {
    console.error("Error updating tool:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tools/[id] - Delete a tool (admin only)
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

    // Delete tool (cascades to tags, reviews, versions due to schema)
    await db.delete(sharedTools).where(eq(sharedTools.id, id));

    return NextResponse.json({
      message: "Tool deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tool:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
