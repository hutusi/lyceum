import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, lessons } from "@/lib/db/schema";
import { ArrowLeft } from "lucide-react";
import { LessonsManager } from "./lessons-manager";

type Props = {
  params: Promise<{ id: string }>;
};

async function getCourseWithLessons(id: string) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, id),
  });

  if (!course) {
    return null;
  }

  const lessonsList = await db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, id))
    .orderBy(asc(lessons.order));

  return { course, lessons: lessonsList };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getCourseWithLessons(id);

  if (!data) {
    return { title: "Course Not Found" };
  }

  return {
    title: `Lessons: ${data.course.title} - Admin`,
  };
}

export default async function ManageLessonsPage({ params }: Props) {
  const { id } = await params;
  const data = await getCourseWithLessons(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/content/courses"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courses
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Manage Lessons</h1>
        <p className="text-muted-foreground">
          Add and edit lessons for: {data.course.title}
        </p>
      </div>

      <LessonsManager courseId={data.course.id} courseSlug={data.course.slug} initialLessons={data.lessons} />
    </div>
  );
}
