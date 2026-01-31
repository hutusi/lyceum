import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { awardPoints } from "@/lib/gamification";
import { trackActivity } from "@/lib/activity";

// GET /api/projects/[id] - Get project details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const isAdmin = session?.user?.role === "admin";

    const project = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        content: projects.content,
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
      .where(eq(projects.id, id))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Only show approved/featured projects to public, or if user is owner/admin
    const isOwner = session?.user?.id === project[0].userId;
    const isPublic = project[0].status === "approved" || project[0].status === "featured";

    if (!isPublic && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ project: project[0] });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update project
export async function PATCH(
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
    const body = await request.json();
    const { title, description, content, repoUrl, demoUrl, coverImage, status } = body;

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "admin";
    const isOwner = project.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "You can only edit your own projects" },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};

    // Owner can update content fields
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (repoUrl !== undefined) updateData.repoUrl = repoUrl;
    if (demoUrl !== undefined) updateData.demoUrl = demoUrl;
    if (coverImage !== undefined) updateData.coverImage = coverImage;

    // Only admin can change status
    if (status !== undefined && isAdmin) {
      updateData.status = status;
    }

    const updatedProject = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    // Award points if status changed to approved or featured
    if (status !== undefined && isAdmin && project.userId) {
      const wasApproved = project.status === "pending" || project.status === "rejected";
      const wasFeatured = project.status !== "featured";

      if (status === "approved" && wasApproved) {
        await awardPoints({
          userId: project.userId,
          type: "project_approved",
          resourceType: "project",
          resourceId: id,
        });
        await trackActivity({
          userId: project.userId,
          type: "project_approved",
          resourceType: "project",
          resourceId: id,
          resourceTitle: project.title,
        });
      } else if (status === "featured" && wasFeatured) {
        await awardPoints({
          userId: project.userId,
          type: "project_featured",
          resourceType: "project",
          resourceId: id,
        });
      }
    }

    return NextResponse.json({
      message: "Project updated successfully",
      project: updatedProject[0],
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project
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

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "admin";
    const isOwner = project.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "You can only delete your own projects" },
        { status: 403 }
      );
    }

    await db.delete(projects).where(eq(projects.id, id));

    return NextResponse.json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
