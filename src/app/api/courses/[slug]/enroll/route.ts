import { NextRequest, NextResponse } from "next/server";
import { eq, and, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { courses, enrollments } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { trackActivity } from "@/lib/activity";
import { awardPoints } from "@/lib/gamification";

// POST /api/courses/[slug]/enroll - Enroll in a course
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    // Get course
    const course = await db.query.courses.findFirst({
      where: and(
        eq(courses.slug, slug),
        eq(courses.status, "published")
      ),
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, session.user.id!),
        eq(enrollments.courseId, course.id)
      ),
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 409 }
      );
    }

    // Create enrollment
    const newEnrollment = await db
      .insert(enrollments)
      .values({
        id: nanoid(),
        userId: session.user.id,
        courseId: course.id,
      })
      .returning();

    // Track activity
    await trackActivity({
      userId: session.user.id!,
      type: "course_enrolled",
      resourceType: "course",
      resourceId: course.id,
      resourceTitle: course.title,
    });

    // Award points
    await awardPoints({
      userId: session.user.id!,
      type: "course_enrolled",
      resourceType: "course",
      resourceId: course.id,
    });

    // Check if this is the first enrollment for bonus points
    const enrollmentCount = await db
      .select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.userId, session.user.id!));

    if (enrollmentCount[0]?.count === 1) {
      await awardPoints({
        userId: session.user.id!,
        type: "first_enrollment",
        description: "Bonus for your first course enrollment!",
      });
    }

    return NextResponse.json(
      {
        message: "Enrolled successfully",
        enrollment: newEnrollment[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error enrolling:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[slug]/enroll - Unenroll from a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;

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

    // Delete enrollment
    await db
      .delete(enrollments)
      .where(
        and(
          eq(enrollments.userId, session.user.id!),
          eq(enrollments.courseId, course.id)
        )
      );

    return NextResponse.json({
      message: "Unenrolled successfully",
    });
  } catch (error) {
    console.error("Error unenrolling:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
