import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { eq, and, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, lessons, enrollments, lessonProgress } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  List,
} from "lucide-react";
import { LessonVideo } from "./lesson-video";
import { LessonContent } from "./lesson-content";
import { MarkCompleteButton } from "./mark-complete-button";

type Props = {
  params: Promise<{ slug: string; lessonId: string }>;
};

async function getLesson(slug: string, lessonId: string, userId?: string) {
  // Get course
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.slug, slug), eq(courses.status, "published")),
  });

  if (!course) {
    return null;
  }

  // Get lesson
  const lesson = await db.query.lessons.findFirst({
    where: and(eq(lessons.id, lessonId), eq(lessons.courseId, course.id)),
  });

  if (!lesson) {
    return null;
  }

  // Get all lessons for navigation
  const allLessons = await db
    .select({ id: lessons.id, title: lessons.title, order: lessons.order })
    .from(lessons)
    .where(eq(lessons.courseId, course.id))
    .orderBy(asc(lessons.order));

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Check enrollment and progress
  let isEnrolled = false;
  let isCompleted = false;
  let completedCount = 0;

  if (userId) {
    const enrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, course.id)
      ),
    });

    isEnrolled = !!enrollment;

    if (isEnrolled) {
      const progress = await db.query.lessonProgress.findFirst({
        where: and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.lessonId, lessonId)
        ),
      });

      isCompleted = progress?.completed || false;

      // Get completed count
      const completed = await db
        .select({ lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, userId),
            eq(lessonProgress.completed, true)
          )
        );
      completedCount = completed.filter((c) =>
        allLessons.some((l) => l.id === c.lessonId)
      ).length;
    }
  }

  return {
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
    },
    lesson,
    allLessons,
    prevLesson,
    nextLesson,
    isEnrolled,
    isCompleted,
    progressPercent:
      allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lessonId } = await params;
  const data = await getLesson(slug, lessonId);

  if (!data) {
    return { title: "Lesson Not Found" };
  }

  return {
    title: `${data.lesson.title} - ${data.course.title}`,
  };
}

export default async function LessonPage({ params }: Props) {
  const { slug, lessonId } = await params;
  const session = await auth();
  const data = await getLesson(slug, lessonId, session?.user?.id);

  if (!data) {
    notFound();
  }

  // Redirect to course page if not enrolled (except first lesson preview)
  const lessonIndex = data.allLessons.findIndex((l) => l.id === lessonId);
  if (!data.isEnrolled && lessonIndex > 0) {
    redirect(`/learn/${slug}`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/learn/${data.course.slug}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Course
                </Link>
              </Button>
              <div className="hidden md:block">
                <p className="font-medium">{data.course.title}</p>
                <p className="text-sm text-muted-foreground">
                  Lesson {lessonIndex + 1} of {data.allLessons.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <Progress value={data.progressPercent} className="w-24" />
                <span className="text-sm">{data.progressPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video */}
            {data.lesson.videoUrl && (
              <LessonVideo url={data.lesson.videoUrl} title={data.lesson.title} />
            )}

            {/* Lesson Title & Actions */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{data.lesson.title}</h1>
                {data.lesson.duration && (
                  <p className="text-muted-foreground">
                    {data.lesson.duration} minutes
                  </p>
                )}
              </div>
              {data.isEnrolled && (
                <MarkCompleteButton
                  courseSlug={slug}
                  lessonId={lessonId}
                  isCompleted={data.isCompleted}
                />
              )}
            </div>

            {/* Lesson Content */}
            {data.lesson.content && (
              <LessonContent content={data.lesson.content} />
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              {data.prevLesson ? (
                <Button variant="outline" asChild>
                  <Link href={`/learn/${slug}/lessons/${data.prevLesson.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Link>
                </Button>
              ) : (
                <div />
              )}
              {data.nextLesson ? (
                <Button asChild>
                  <Link href={`/learn/${slug}/lessons/${data.nextLesson.id}`}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href={`/learn/${slug}`}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Course
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar - Lesson List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Course Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {data.allLessons.map((l, index) => {
                    const isCurrent = l.id === lessonId;
                    return (
                      <Link
                        key={l.id}
                        href={`/learn/${slug}/lessons/${l.id}`}
                        className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                          isCurrent
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <span className="truncate">{l.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
