import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { eq, desc, like, and, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, lessons, enrollments, users } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, Clock } from "lucide-react";
import { CourseSearch } from "./course-search";
import { CourseFilters } from "./course-filters";

export const metadata: Metadata = {
  title: "Learn",
  description: "Master AI coding through structured courses, workshops, and prompt engineering techniques.",
};

export const dynamic = "force-dynamic";

interface SearchParams {
  category?: string;
  difficulty?: string;
  search?: string;
}

async function getCourses(searchParams: SearchParams) {
  const { category, difficulty, search } = searchParams;

  // Build conditions
  const conditions = [eq(courses.status, "published")];

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

  const whereClause = and(...conditions);

  // Get courses
  const coursesList = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      coverImage: courses.coverImage,
      difficulty: courses.difficulty,
      category: courses.category,
      authorName: users.name,
    })
    .from(courses)
    .leftJoin(users, eq(courses.authorId, users.id))
    .where(whereClause)
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
        lessonCount: lessonCount[0]?.count || 0,
        enrollmentCount: enrollmentCount[0]?.count || 0,
        duration,
      };
    })
  );

  return coursesWithStats;
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

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const coursesList = await getCourses(params);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learn</h1>
        <p className="text-muted-foreground">
          Master AI coding through structured courses, workshops, and prompt engineering techniques.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <CourseSearch initialSearch={params.search} />
        <CourseFilters
          currentCategory={params.category}
          currentDifficulty={params.difficulty}
        />
      </div>

      {/* Course Grid */}
      {coursesList.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No courses found</CardTitle>
            <CardDescription>
              {params.search || params.category || params.difficulty
                ? "Try adjusting your search or filters."
                : "Check back later for new courses!"}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesList.map((course) => (
            <Link key={course.id} href={`/learn/${course.slug}`}>
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
                {course.coverImage && (
                  <div className="aspect-video bg-muted relative">
                    <Image
                      src={course.coverImage}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex gap-2 mb-2">
                    <Badge className={difficultyColors[course.difficulty as keyof typeof difficultyColors]}>
                      {course.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {categoryLabels[course.category as keyof typeof categoryLabels]}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.lessonCount} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration || "N/A"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.enrollmentCount} enrolled
                  </span>
                  <Button size="sm">Start Learning</Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
