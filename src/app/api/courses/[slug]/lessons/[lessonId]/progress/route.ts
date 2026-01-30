import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { courses, lessons, enrollments, lessonProgress } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { trackActivity } from "@/lib/activity";

// POST /api/courses/[slug]/lessons/[lessonId]/progress - Update lesson progress
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug, lessonId } = await params;
    const body = await request.json();
    const { completed, progressPercent } = body;

    // Get course
    const course = await db.query.courses.findFirst({
      where: eq(courses.slug, slug),
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if enrolled
    const enrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, session.user.id!),
        eq(enrollments.courseId, course.id)
      ),
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "You must be enrolled in this course" },
        { status: 403 }
      );
    }

    // Get lesson
    const lesson = await db.query.lessons.findFirst({
      where: and(
        eq(lessons.id, lessonId),
        eq(lessons.courseId, course.id)
      ),
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Check if progress exists
    const existingProgress = await db.query.lessonProgress.findFirst({
      where: and(
        eq(lessonProgress.userId, session.user.id!),
        eq(lessonProgress.lessonId, lessonId)
      ),
    });

    let progress;

    if (existingProgress) {
      // Update existing progress
      const updateData: Record<string, unknown> = {
        lastAccessedAt: new Date(),
      };
      if (completed !== undefined) {
        updateData.completed = completed;
      }
      if (progressPercent !== undefined) {
        updateData.progressPercent = progressPercent;
      }

      progress = await db
        .update(lessonProgress)
        .set(updateData)
        .where(eq(lessonProgress.id, existingProgress.id))
        .returning();
    } else {
      // Create new progress
      progress = await db
        .insert(lessonProgress)
        .values({
          id: nanoid(),
          userId: session.user.id!,
          lessonId,
          completed: completed || false,
          progressPercent: progressPercent || 0,
          lastAccessedAt: new Date(),
        })
        .returning();
    }

    // Track lesson completion activity
    if (completed && (!existingProgress || !existingProgress.completed)) {
      await trackActivity({
        userId: session.user.id!,
        type: "lesson_completed",
        resourceType: "lesson",
        resourceId: lessonId,
        resourceTitle: lesson.title,
        metadata: { courseId: course.id, courseTitle: course.title },
      });
    }

    return NextResponse.json({
      message: "Progress updated",
      progress: progress[0],
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/courses/[slug]/lessons/[lessonId]/progress - Get lesson progress
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { lessonId } = await params;

    const progress = await db.query.lessonProgress.findFirst({
      where: and(
        eq(lessonProgress.userId, session.user.id!),
        eq(lessonProgress.lessonId, lessonId)
      ),
    });

    return NextResponse.json({
      progress: progress || { completed: false, progressPercent: 0 },
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
