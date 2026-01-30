import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { eq, asc, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, lessons, enrollments, lessonProgress, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  User,
  Play,
  CheckCircle,
  Lock,
} from "lucide-react";
import { EnrollButton } from "./enroll-button";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getCourse(slug: string, userId?: string) {
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
    .where(and(eq(courses.slug, slug), eq(courses.status, "published")))
    .limit(1);

  if (course.length === 0) {
    return null;
  }

  const courseData = course[0];

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

  // Check enrollment and progress
  let isEnrolled = false;
  let completedLessonIds: string[] = [];

  if (userId) {
    const enrollment = await db.query.enrollments.findFirst({
      where: and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseData.id)
      ),
    });

    if (enrollment) {
      isEnrolled = true;

      // Get completed lessons
      const progress = await db
        .select({ lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, userId),
            eq(lessonProgress.completed, true)
          )
        );
      completedLessonIds = progress.map((p) => p.lessonId);
    }
  }

  return {
    ...courseData,
    lessons: lessonsList,
    lessonCount: lessonsList.length,
    enrollmentCount: enrollmentCount[0]?.count || 0,
    duration,
    isEnrolled,
    completedLessonIds,
    progressPercent: lessonsList.length > 0
      ? Math.round((completedLessonIds.length / lessonsList.length) * 100)
      : 0,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    return { title: "Course Not Found" };
  }

  return {
    title: course.title,
    description: course.description || `Learn ${course.title} on AI Coding Lyceum`,
  };
}

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-500",
  intermediate: "bg-yellow-500/10 text-yellow-500",
  advanced: "bg-red-500/10 text-red-500",
};

const categoryLabels = {
  course: "Course",
  workshop: "Workshop",
  "prompt-engineering": "Prompt Engineering",
};

function formatDuration(minutes: number | null) {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const course = await getCourse(slug, session?.user?.id);

  if (!course) {
    notFound();
  }

  return (
    <div className="container py-8">
      {/* Back link */}
      <Link
        href="/learn"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courses
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            {course.coverImage && (
              <div className="aspect-video bg-muted relative rounded-lg overflow-hidden mb-6">
                <Image
                  src={course.coverImage}
                  alt={course.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <Badge className={difficultyColors[course.difficulty as keyof typeof difficultyColors]}>
                {course.difficulty}
              </Badge>
              <Badge variant="outline">
                {categoryLabels[course.category as keyof typeof categoryLabels]}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-muted-foreground text-lg">{course.description}</p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-6 text-sm">
              <span className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                {course.lessonCount} lessons
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                {course.duration}
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                {course.enrollmentCount} enrolled
              </span>
            </div>
          </div>

          {/* Progress (if enrolled) */}
          {course.isEnrolled && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Progress value={course.progressPercent} className="flex-1" />
                  <span className="text-sm font-medium">{course.progressPercent}%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {course.completedLessonIds.length} of {course.lessonCount} lessons completed
                </p>
              </CardContent>
            </Card>
          )}

          {/* Lessons */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {course.lessonCount} lessons • {course.duration} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => {
                  const isCompleted = course.completedLessonIds.includes(lesson.id);
                  const isLocked = !course.isEnrolled && index > 0;

                  return (
                    <div
                      key={lesson.id}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        isLocked ? "opacity-50" : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {isLocked ? (
                          <p className="font-medium">{lesson.title}</p>
                        ) : (
                          <Link
                            href={`/learn/${course.slug}/lessons/${lesson.id}`}
                            className="font-medium hover:text-primary"
                          >
                            {lesson.title}
                          </Link>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {formatDuration(lesson.duration)}
                        </p>
                      </div>
                      {!isLocked && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/learn/${course.slug}/lessons/${lesson.id}`}>
                            <Play className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enroll Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                {course.isEnrolled ? "Continue Learning" : "Start Learning"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.isEnrolled ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    You&apos;re enrolled in this course. Pick up where you left off!
                  </p>
                  {course.lessons.length > 0 && (
                    <Button asChild className="w-full">
                      <Link
                        href={`/learn/${course.slug}/lessons/${
                          course.lessons.find(
                            (l) => !course.completedLessonIds.includes(l.id)
                          )?.id || course.lessons[0].id
                        }`}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Continue
                      </Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Enroll now to access all lessons and track your progress.
                  </p>
                  <EnrollButton courseSlug={course.slug} />
                </>
              )}
            </CardContent>
          </Card>

          {/* Author Card */}
          {course.authorName && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={course.authorImage || ""} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{course.authorName}</p>
                    <p className="text-sm text-muted-foreground">Course Creator</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulty</span>
                <span className="font-medium capitalize">{course.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">
                  {categoryLabels[course.category as keyof typeof categoryLabels]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lessons</span>
                <span className="font-medium">{course.lessonCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{course.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enrolled</span>
                <span className="font-medium">{course.enrollmentCount} students</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
