import { NextRequest, NextResponse } from "next/server";
import { eq, asc, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { courses, lessons, enrollments, lessonProgress, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// GET /api/courses/[slug] - Get course details with lessons
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();

    // Get course with author
    const course = await db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        coverImage: courses.coverImage,
        difficulty: courses.difficulty,
        category: courses.category,
        status: courses.status,
        createdAt: courses.createdAt,
        authorId: courses.authorId,
        authorName: users.name,
        authorImage: users.image,
      })
      .from(courses)
      .leftJoin(users, eq(courses.authorId, users.id))
      .where(eq(courses.slug, slug))
      .limit(1);

    if (course.length === 0) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const courseData = course[0];

    // Check if published (unless admin)
    if (courseData.status !== "published" && session?.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Get lessons
    const lessonsList = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, courseData.id))
      .orderBy(asc(lessons.order));

    // Get enrollment count
    const enrollmentCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(enrollments)
      .where(eq(enrollments.courseId, courseData.id));

    // Calculate total duration
    const totalMinutes = lessonsList.reduce((acc, l) => acc + (l.duration || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Check if user is enrolled and get progress
    let isEnrolled = false;
    let completedLessons = 0;
    let enrollment = null;

    if (session?.user?.id) {
      const userEnrollment = await db.query.enrollments.findFirst({
        where: and(
          eq(enrollments.userId, session.user.id),
          eq(enrollments.courseId, courseData.id)
        ),
      });

      if (userEnrollment) {
        isEnrolled = true;
        enrollment = userEnrollment;

        // Get completed lessons count
        const completedResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(lessonProgress)
          .where(
            and(
              eq(lessonProgress.userId, session.user.id),
              eq(lessonProgress.completed, true)
            )
          );
        completedLessons = completedResult[0]?.count || 0;
      }
    }

    return NextResponse.json({
      ...courseData,
      author: {
        id: courseData.authorId,
        name: courseData.authorName,
        image: courseData.authorImage,
      },
      lessons: lessonsList,
      lessonCount: lessonsList.length,
      enrollmentCount: enrollmentCount[0]?.count || 0,
      duration,
      isEnrolled,
      completedLessons,
      enrollment,
      progressPercent: lessonsList.length > 0
        ? Math.round((completedLessons / lessonsList.length) * 100)
        : 0,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[slug] - Update course (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const { title, description, coverImage, difficulty, category, status } = body;

    const existingCourse = await db.query.courses.findFirst({
      where: eq(courses.slug, slug),
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      updateData.title = title;
      if (title !== existingCourse.title) {
        let newSlug = generateSlug(title);
        const slugExists = await db.query.courses.findFirst({
          where: eq(courses.slug, newSlug),
        });
        if (slugExists && slugExists.id !== existingCourse.id) {
          newSlug = `${newSlug}-${nanoid(6)}`;
        }
        updateData.slug = newSlug;
      }
    }
    if (description !== undefined) updateData.description = description;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;

    const updatedCourse = await db
      .update(courses)
      .set(updateData)
      .where(eq(courses.id, existingCourse.id))
      .returning();

    return NextResponse.json({
      message: "Course updated successfully",
      course: updatedCourse[0],
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[slug] - Delete course (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { slug } = await params;

    const existingCourse = await db.query.courses.findFirst({
      where: eq(courses.slug, slug),
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    await db.delete(courses).where(eq(courses.id, existingCourse.id));

    return NextResponse.json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
