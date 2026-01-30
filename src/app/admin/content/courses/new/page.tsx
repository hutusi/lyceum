import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CourseForm } from "../course-form";

export const metadata: Metadata = {
  title: "New Course - Admin",
  description: "Create a new course or workshop.",
};

export default function NewCoursePage() {
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
        <h1 className="text-3xl font-bold">New Course</h1>
        <p className="text-muted-foreground">
          Create a new course, workshop, or prompt engineering guide.
        </p>
      </div>

      <CourseForm />
    </div>
  );
}
