import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { eq, desc, count, and, isNotNull } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import {
  enrollments,
  courses,
  lessons,
  lessonProgress,
  discussions,
  comments,
  projects,
  userActivities,
  userSettings,
  userFollows,
} from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  GraduationCap,
  Code2,
  Rocket,
  Settings,
  MessageSquare,
  CheckCircle,
  Clock,
  ExternalLink,
  Award,
  Trophy,
} from "lucide-react";
import { PointsDisplay, BadgeDisplay, Leaderboard } from "@/components/gamification";
import { getUserPointsAndLevel, getUserBadges, getLeaderboard } from "@/lib/gamification";
import { FollowersList } from "@/components/social";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your profile and learning progress.",
};

export const dynamic = "force-dynamic";

async function getUserStats(userId: string) {
  const [enrollmentCount] = await db
    .select({ count: count() })
    .from(enrollments)
    .where(eq(enrollments.userId, userId));

  const [completedCount] = await db
    .select({ count: count() })
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), isNotNull(enrollments.completedAt)));

  const [discussionCount] = await db
    .select({ count: count() })
    .from(discussions)
    .where(eq(discussions.userId, userId));

  const [projectCount] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.userId, userId));

  const [commentCount] = await db
    .select({ count: count() })
    .from(comments)
    .where(eq(comments.userId, userId));

  const [followerCount] = await db
    .select({ count: count() })
    .from(userFollows)
    .where(eq(userFollows.followingId, userId));

  const [followingCount] = await db
    .select({ count: count() })
    .from(userFollows)
    .where(eq(userFollows.followerId, userId));

  return {
    coursesEnrolled: enrollmentCount.count,
    coursesCompleted: completedCount.count,
    discussions: discussionCount.count,
    projects: projectCount.count,
    comments: commentCount.count,
    followers: followerCount.count,
    following: followingCount.count,
  };
}

async function getUserEnrollments(userId: string) {
  const userEnrollments = await db.query.enrollments.findMany({
    where: eq(enrollments.userId, userId),
    with: {
      course: {
        with: {
          lessons: true,
        },
      },
    },
    orderBy: desc(enrollments.enrolledAt),
    limit: 5,
  });

  // Calculate progress for each enrollment
  const enrollmentsWithProgress = await Promise.all(
    userEnrollments.map(async (enrollment) => {
      const totalLessons = enrollment.course.lessons.length;
      if (totalLessons === 0) {
        return { ...enrollment, progress: 0 };
      }

      const lessonIds = enrollment.course.lessons.map((l) => l.id);
      const [completedLessons] = await db
        .select({ count: count() })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, userId),
            eq(lessonProgress.completed, true)
          )
        );

      const progress = Math.round((completedLessons.count / totalLessons) * 100);
      return { ...enrollment, progress };
    })
  );

  return enrollmentsWithProgress;
}

async function getUserActivities(userId: string) {
  return db.query.userActivities.findMany({
    where: eq(userActivities.userId, userId),
    orderBy: desc(userActivities.createdAt),
    limit: 10,
  });
}

async function getUserProjects(userId: string) {
  return db.query.projects.findMany({
    where: eq(projects.userId, userId),
    orderBy: desc(projects.createdAt),
    limit: 5,
  });
}

async function getUserSettingsData(userId: string) {
  return db.query.userSettings.findFirst({
    where: eq(userSettings.userId, userId),
  });
}

function getActivityIcon(type: string) {
  switch (type) {
    case "course_enrolled":
    case "course_completed":
    case "lesson_completed":
      return <GraduationCap className="h-4 w-4" />;
    case "discussion_created":
    case "comment_added":
      return <MessageSquare className="h-4 w-4" />;
    case "project_submitted":
    case "project_approved":
      return <Rocket className="h-4 w-4" />;
    default:
      return <Code2 className="h-4 w-4" />;
  }
}

function getActivityLabel(type: string) {
  switch (type) {
    case "course_enrolled":
      return "Enrolled in";
    case "course_completed":
      return "Completed";
    case "lesson_completed":
      return "Completed lesson";
    case "discussion_created":
      return "Started discussion";
    case "comment_added":
      return "Commented on";
    case "project_submitted":
      return "Submitted project";
    case "project_approved":
      return "Project approved";
    case "tool_published":
      return "Published tool";
    case "review_added":
      return "Reviewed";
    default:
      return type;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "approved":
      return <Badge variant="default">Approved</Badge>;
    case "featured":
      return <Badge className="bg-yellow-500">Featured</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return null;
  }
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id!;

  const [stats, userEnrollments, activities, userProjects, settings, pointsData, userBadges, leaderboard] = await Promise.all([
    getUserStats(userId),
    getUserEnrollments(userId),
    getUserActivities(userId),
    getUserProjects(userId),
    getUserSettingsData(userId),
    getUserPointsAndLevel(userId),
    getUserBadges(userId),
    getLeaderboard(10),
  ]);

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
              <AvatarFallback className="text-2xl">
                {session.user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">{session.user.name}</CardTitle>
            <CardDescription>{session.user.email}</CardDescription>
            {settings?.bio && (
              <p className="text-sm text-muted-foreground mt-2">{settings.bio}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">
                {session.user.role === "admin" ? "Administrator" : "Member"}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Trophy className="h-3 w-3" />
                Level {pointsData.level}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Followers/Following */}
            <div className="flex items-center justify-center gap-6 py-4 border-b mb-4">
              <FollowersList userId={userId} type="followers" count={stats.followers} />
              <FollowersList userId={userId} type="following" count={stats.following} />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Courses Enrolled</span>
                <span className="font-medium">{stats.coursesEnrolled}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Courses Completed</span>
                <span className="font-medium">{stats.coursesCompleted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discussions</span>
                <span className="font-medium">{stats.discussions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comments</span>
                <span className="font-medium">{stats.comments}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Projects</span>
                <span className="font-medium">{stats.projects}</span>
              </div>
            </div>

            {/* Social Links */}
            {(settings?.website || settings?.github || settings?.twitter) && (
              <div className="mt-6 pt-4 border-t space-y-2">
                {settings.website && (
                  <a
                    href={settings.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {settings.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {settings.github && (
                  <a
                    href={`https://github.com/${settings.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Code2 className="h-4 w-4" />
                    {settings.github}
                  </a>
                )}
              </div>
            )}

            <div className="mt-6 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/profile/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/profile/bookmarks">
                  <BookOpen className="mr-2 h-4 w-4" />
                  My Bookmarks
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity & Progress */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="progress" className="space-y-6">
            <TabsList>
              <TabsTrigger value="progress" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Learning Progress
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Recent Activity
              </TabsTrigger>
              <TabsTrigger value="projects" className="gap-2">
                <Rocket className="h-4 w-4" />
                My Projects
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2">
                <Award className="h-4 w-4" />
                Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="progress" className="space-y-4">
              {userEnrollments.length > 0 ? (
                <>
                  {userEnrollments.map((enrollment) => (
                    <Card key={enrollment.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link
                              href={`/learn/${enrollment.course.slug}`}
                              className="font-medium hover:underline"
                            >
                              {enrollment.course.title}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">
                              {enrollment.course.lessons.length} lessons
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {enrollment.completedAt ? (
                              <Badge className="bg-green-500">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <Clock className="mr-1 h-3 w-3" />
                                In Progress
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="text-center">
                    <Button variant="outline" asChild>
                      <Link href="/learn">Browse More Courses</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <Card className="border-dashed">
                  <CardHeader className="text-center">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <CardTitle>No Courses Started</CardTitle>
                    <CardDescription>
                      Start learning by enrolling in a course from the Learn section.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button asChild>
                      <Link href="/learn">Browse Courses</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              {activities.length > 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                        >
                          <div className="mt-0.5 p-2 rounded-full bg-muted">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="text-muted-foreground">
                                {getActivityLabel(activity.type)}
                              </span>{" "}
                              <span className="font-medium">{activity.resourceTitle}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {activity.createdAt?.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardHeader className="text-center">
                    <Code2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <CardTitle>No Recent Activity</CardTitle>
                    <CardDescription>
                      Your recent discussions and contributions will appear here.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              {userProjects.length > 0 ? (
                <>
                  {userProjects.map((project) => (
                    <Card key={project.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link
                              href={`/create/showcase/${project.id}`}
                              className="font-medium hover:underline"
                            >
                              {project.title}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {project.description}
                            </p>
                          </div>
                          <div className="ml-4">{getStatusBadge(project.status!)}</div>
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Submitted{" "}
                            {project.createdAt?.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {project.repoUrl && (
                            <a
                              href={project.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-foreground"
                            >
                              View Repository
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="text-center">
                    <Button variant="outline" asChild>
                      <Link href="/create/showcase/submit">Submit New Project</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <Card className="border-dashed">
                  <CardHeader className="text-center">
                    <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <CardTitle>No Projects Yet</CardTitle>
                    <CardDescription>
                      Submit your projects in the Create section to showcase them here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button asChild>
                      <Link href="/create/showcase/submit">Submit a Project</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <PointsDisplay
                points={pointsData.points}
                level={pointsData.level}
                levelProgress={pointsData.levelProgress}
                nextLevelThreshold={pointsData.nextLevelThreshold}
              />
              <BadgeDisplay badges={userBadges} />
              <Leaderboard entries={leaderboard} currentUserId={userId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
