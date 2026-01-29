import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, MessageSquare, Clock, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Learn",
  description: "Master AI coding through structured courses, workshops, and prompt engineering techniques.",
};

const courses = [
  {
    id: 1,
    title: "Introduction to AI Coding",
    description: "Learn the fundamentals of AI-assisted programming and how to leverage AI tools effectively.",
    difficulty: "beginner",
    category: "course",
    lessons: 12,
    duration: "6 hours",
    enrolled: 234,
  },
  {
    id: 2,
    title: "Advanced Prompt Engineering",
    description: "Master the art of crafting effective prompts for various AI models and use cases.",
    difficulty: "intermediate",
    category: "prompt-engineering",
    lessons: 8,
    duration: "4 hours",
    enrolled: 156,
  },
  {
    id: 3,
    title: "Building AI Agents Workshop",
    description: "Hands-on workshop to build your first AI agent using modern frameworks.",
    difficulty: "advanced",
    category: "workshop",
    lessons: 6,
    duration: "3 hours",
    enrolled: 89,
  },
];

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-500",
  intermediate: "bg-yellow-500/10 text-yellow-500",
  advanced: "bg-red-500/10 text-red-500",
};

export default function LearnPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learn</h1>
        <p className="text-muted-foreground">
          Master AI coding through structured courses, workshops, and prompt engineering techniques.
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="workshops" className="gap-2">
            <Users className="h-4 w-4" />
            Workshops
          </TabsTrigger>
          <TabsTrigger value="prompts" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Prompt Engineering
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex gap-2 mb-2">
                    <Badge className={difficultyColors[course.difficulty as keyof typeof difficultyColors]}>
                      {course.difficulty}
                    </Badge>
                    <Badge variant="outline">{course.category}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.lessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.enrolled} enrolled
                  </span>
                  <Button asChild>
                    <Link href={`/learn/courses/${course.id}`}>Start Learning</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses
              .filter((c) => c.category === "course")
              .map((course) => (
                <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Badge className={difficultyColors[course.difficulty as keyof typeof difficultyColors]} >
                      {course.difficulty}
                    </Badge>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/learn/courses/${course.id}`}>View Course</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="workshops" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses
              .filter((c) => c.category === "workshop")
              .map((course) => (
                <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Badge className={difficultyColors[course.difficulty as keyof typeof difficultyColors]}>
                      {course.difficulty}
                    </Badge>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/learn/workshops/${course.id}`}>Join Workshop</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses
              .filter((c) => c.category === "prompt-engineering")
              .map((course) => (
                <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Badge className={difficultyColors[course.difficulty as keyof typeof difficultyColors]}>
                      {course.difficulty}
                    </Badge>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/learn/prompts/${course.id}`}>Start Learning</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
