import { NextRequest, NextResponse } from "next/server";
import { eq, asc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { courses, lessons } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

// GET /api/courses/[slug]/lessons - Get all lessons
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const course = await db.query.courses.findFirst({
      where: eq(courses.slug, slug),
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const lessonsList = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, course.id))
      .orderBy(asc(lessons.order));

    return NextResponse.json({ lessons: lessonsList });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/courses/[slug]/lessons - Create a new lesson
export async function POST(
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
    const { title, content, videoUrl, duration } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.slug, slug),
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Get next order number
    const maxOrder = await db
      .select({ max: sql<number>`max(${lessons.order})` })
      .from(lessons)
      .where(eq(lessons.courseId, course.id));

    const nextOrder = (maxOrder[0]?.max || 0) + 1;

    const newLesson = await db
      .insert(lessons)
      .values({
        id: nanoid(),
        courseId: course.id,
        title,
        content,
        videoUrl,
        duration: duration || null,
        order: nextOrder,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Lesson created successfully",
        lesson: newLesson[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
