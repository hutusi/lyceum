import { Metadata } from "next";
import Link from "next/link";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, lessons, enrollments, users } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CoursesTable } from "./courses-table";

export const metadata: Metadata = {
  title: "Manage Courses - Admin",
  description: "Manage courses, workshops, and lessons.",
};

async function getCourses() {
  const coursesList = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      difficulty: courses.difficulty,
      category: courses.category,
      status: courses.status,
      createdAt: courses.createdAt,
      authorName: users.name,
    })
    .from(courses)
    .leftJoin(users, eq(courses.authorId, users.id))
    .orderBy(desc(courses.createdAt));

  // Get stats for each course
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

      return {
        ...course,
        lessonCount: lessonCount[0]?.count || 0,
        enrollmentCount: enrollmentCount[0]?.count || 0,
      };
    })
  );

  // Get counts by status
  const statusCounts = await db
    .select({
      status: courses.status,
      count: sql<number>`count(*)`,
    })
    .from(courses)
    .groupBy(courses.status);

  const counts = statusCounts.reduce(
    (acc, { status, count }) => {
      acc[status || "unknown"] = count;
      return acc;
    },
    { draft: 0, published: 0, archived: 0 } as Record<string, number>
  );

  return { courses: coursesWithStats, counts };
}

export default async function AdminCoursesPage() {
  const { courses, counts } = await getCourses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Courses</h1>
          <p className="text-muted-foreground">
            Create and manage courses, workshops, and lessons.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Drafts</p>
          <p className="text-2xl font-bold text-yellow-600">{counts.draft}</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="text-2xl font-bold text-green-600">{counts.published}</p>
        </div>
        <div className="bg-gray-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Archived</p>
          <p className="text-2xl font-bold text-gray-600">{counts.archived}</p>
        </div>
      </div>

      <CoursesTable courses={courses} />
    </div>
  );
}
