import { NextRequest, NextResponse } from "next/server";
import { eq, desc, like, and, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { courses, lessons, enrollments, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// GET /api/courses - List published courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "published";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];

    if (status !== "all") {
      conditions.push(eq(courses.status, status as "draft" | "published" | "archived"));
    }

    if (category && category !== "all") {
      conditions.push(eq(courses.category, category as "course" | "workshop" | "prompt-engineering"));
    }

    if (difficulty && difficulty !== "all") {
      conditions.push(eq(courses.difficulty, difficulty as "beginner" | "intermediate" | "advanced"));
    }

    if (search) {
      const searchCondition = or(
        like(courses.title, `%${search}%`),
        like(courses.description, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get courses with author and lesson count
    const coursesList = await db
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
      })
      .from(courses)
      .leftJoin(users, eq(courses.authorId, users.id))
      .where(whereClause)
      .orderBy(desc(courses.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    // Get lesson count and enrollment count for each course
    const coursesWithStats = await Promise.all(
      coursesList.map(async (course) => {
        const lessonCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(lessons)
          .where(eq(lessons.courseId, course.id));

        const enrollmentCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(enrollments)
          .where(eq(enrollments.courseId, course.id));

        // Calculate total duration
        const durationResult = await db
          .select({ total: sql<number>`sum(${lessons.duration})` })
          .from(lessons)
          .where(eq(lessons.courseId, course.id));

        const totalMinutes = durationResult[0]?.total || 0;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        return {
          ...course,
          author: course.authorName,
          lessonCount: lessonCount[0]?.count || 0,
          enrollmentCount: enrollmentCount[0]?.count || 0,
          duration,
        };
      })
    );

    return NextResponse.json({
      courses: coursesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course (admin only)
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
    const { title, description, coverImage, difficulty, category, status } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = generateSlug(title);
    const existingCourse = await db.query.courses.findFirst({
      where: eq(courses.slug, slug),
    });

    if (existingCourse) {
      slug = `${slug}-${nanoid(6)}`;
    }

    const courseId = nanoid();

    const newCourse = await db
      .insert(courses)
      .values({
        id: courseId,
        title,
        slug,
        description,
        coverImage,
        difficulty: difficulty || "beginner",
        category: category || "course",
        status: status || "draft",
        authorId: session.user.id,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Course created successfully",
        course: newCourse[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
