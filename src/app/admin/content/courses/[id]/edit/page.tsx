import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { ArrowLeft } from "lucide-react";
import { CourseForm } from "../../course-form";

type Props = {
  params: Promise<{ id: string }>;
};

async function getCourse(id: string) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, id),
  });
  return course;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    return { title: "Course Not Found" };
  }

  return {
    title: `Edit: ${course.title} - Admin`,
  };
}

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
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
        <h1 className="text-3xl font-bold">Edit Course</h1>
        <p className="text-muted-foreground">Update the course details below.</p>
      </div>

      <CourseForm course={course} />
    </div>
  );
}
