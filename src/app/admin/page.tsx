import { Metadata } from "next";
import Link from "next/link";
import { count, eq, desc, gte, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  articles,
  courses,
  projects,
  enrollments,
  discussions,
  sharedTools,
  userActivities,
} from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  GraduationCap,
  Users,
  Rocket,
  MessageSquare,
  Wrench,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "AI Coding Lyceum administration dashboard.",
};

async function getStats() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    [totalUsers],
    [newUsersThisWeek],
    [totalArticles],
    [publishedArticles],
    [totalCourses],
    [publishedCourses],
    [totalProjects],
    [pendingProjects],
    [totalDiscussions],
    [totalTools],
    [pendingTools],
    [totalEnrollments],
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo)),
    db.select({ count: count() }).from(articles),
    db.select({ count: count() }).from(articles).where(eq(articles.status, "published")),
    db.select({ count: count() }).from(courses),
    db.select({ count: count() }).from(courses).where(eq(courses.status, "published")),
    db.select({ count: count() }).from(projects),
    db.select({ count: count() }).from(projects).where(eq(projects.status, "pending")),
    db.select({ count: count() }).from(discussions),
    db.select({ count: count() }).from(sharedTools),
    db.select({ count: count() }).from(sharedTools).where(eq(sharedTools.status, "pending")),
    db.select({ count: count() }).from(enrollments),
  ]);

  return {
    totalUsers: totalUsers.count,
    newUsersThisWeek: newUsersThisWeek.count,
    totalArticles: totalArticles.count,
    publishedArticles: publishedArticles.count,
    totalCourses: totalCourses.count,
    publishedCourses: publishedCourses.count,
    totalProjects: totalProjects.count,
    pendingProjects: pendingProjects.count,
    totalDiscussions: totalDiscussions.count,
    totalTools: totalTools.count,
    pendingTools: pendingTools.count,
    totalEnrollments: totalEnrollments.count,
  };
}

async function getRecentActivity() {
  return db.query.userActivities.findMany({
    orderBy: desc(userActivities.createdAt),
    limit: 10,
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

async function getPendingItems() {
  const [pendingProjects, pendingTools] = await Promise.all([
    db.query.projects.findMany({
      where: eq(projects.status, "pending"),
      orderBy: desc(projects.createdAt),
      limit: 5,
      with: {
        user: {
          columns: {
            name: true,
          },
        },
      },
    }),
    db.query.sharedTools.findMany({
      where: eq(sharedTools.status, "pending"),
      orderBy: desc(sharedTools.createdAt),
      limit: 5,
      with: {
        user: {
          columns: {
            name: true,
          },
        },
      },
    }),
  ]);

  return { pendingProjects, pendingTools };
}

function getActivityLabel(type: string) {
  switch (type) {
    case "course_enrolled":
      return "enrolled in";
    case "course_completed":
      return "completed";
    case "lesson_completed":
      return "completed lesson";
    case "discussion_created":
      return "started discussion";
    case "comment_added":
      return "commented on";
    case "project_submitted":
      return "submitted project";
    case "project_approved":
      return "project approved";
    case "tool_published":
      return "published tool";
    case "review_added":
      return "reviewed";
    default:
      return type.replace(/_/g, " ");
  }
}

export default async function AdminDashboardPage() {
  const [stats, recentActivity, pendingItems] = await Promise.all([
    getStats(),
    getRecentActivity(),
    getPendingItems(),
  ]);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      description: `+${stats.newUsersThisWeek} this week`,
      icon: Users,
      trend: stats.newUsersThisWeek > 0 ? "up" : "neutral",
    },
    {
      title: "Articles",
      value: stats.publishedArticles.toString(),
      description: `${stats.totalArticles} total`,
      icon: FileText,
      href: "/admin/content/articles",
    },
    {
      title: "Courses",
      value: stats.publishedCourses.toString(),
      description: `${stats.totalEnrollments} enrollments`,
      icon: GraduationCap,
      href: "/admin/content/courses",
    },
    {
      title: "Projects",
      value: stats.totalProjects.toString(),
      description: stats.pendingProjects > 0 ? `${stats.pendingProjects} pending review` : "All reviewed",
      icon: Rocket,
      href: "/admin/content/projects",
      alert: stats.pendingProjects > 0,
    },
    {
      title: "Discussions",
      value: stats.totalDiscussions.toString(),
      description: "Community discussions",
      icon: MessageSquare,
      href: "/admin/content/practice",
    },
    {
      title: "Shared Tools",
      value: stats.totalTools.toString(),
      description: stats.pendingTools > 0 ? `${stats.pendingTools} pending review` : "All reviewed",
      icon: Wrench,
      href: "/admin/content/tools",
      alert: stats.pendingTools > 0,
    },
  ];

  const totalPending = stats.pendingProjects + stats.pendingTools;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the AI Coding Lyceum admin panel.
        </p>
      </div>

      {/* Pending Review Alert */}
      {totalPending > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <p className="font-medium text-yellow-700 dark:text-yellow-300">
              {totalPending} items pending review
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              {stats.pendingProjects > 0 && `${stats.pendingProjects} projects`}
              {stats.pendingProjects > 0 && stats.pendingTools > 0 && ", "}
              {stats.pendingTools > 0 && `${stats.pendingTools} tools`}
            </p>
          </div>
          <Link
            href="/admin/moderation"
            className="text-sm font-medium text-yellow-700 dark:text-yellow-300 hover:underline"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const CardWrapper = stat.href ? Link : "div";
          return (
            <CardWrapper
              key={stat.title}
              href={stat.href || "#"}
              className={stat.href ? "block" : ""}
            >
              <Card className={stat.href ? "hover:bg-muted/50 transition-colors" : ""}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {stat.alert && (
                      <Badge variant="destructive" className="text-xs">
                        Action needed
                      </Badge>
                    )}
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    {stat.trend === "up" && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </CardWrapper>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {activity.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p>
                        <span className="font-medium">{activity.user?.name || "User"}</span>
                        {" "}
                        <span className="text-muted-foreground">
                          {getActivityLabel(activity.type)}
                        </span>
                        {" "}
                        <span className="font-medium truncate">{activity.resourceTitle}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.createdAt?.toLocaleDateString("en-US", {
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
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity to display.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/content/articles/new">
              <div className="p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors flex items-center gap-3">
                <Plus className="h-4 w-4" />
                <div>
                  <p className="font-medium">Create New Article</p>
                  <p className="text-sm text-muted-foreground">Add a new article or news post</p>
                </div>
              </div>
            </Link>
            <Link href="/admin/content/courses/new">
              <div className="p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors flex items-center gap-3">
                <Plus className="h-4 w-4" />
                <div>
                  <p className="font-medium">Create New Course</p>
                  <p className="text-sm text-muted-foreground">Add a new course or workshop</p>
                </div>
              </div>
            </Link>
            <Link href="/admin/content/practice/new">
              <div className="p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors flex items-center gap-3">
                <Plus className="h-4 w-4" />
                <div>
                  <p className="font-medium">Create Practice Topic</p>
                  <p className="text-sm text-muted-foreground">Add a new practice topic</p>
                </div>
              </div>
            </Link>
            <Link href="/admin/content/nexus-weekly/new">
              <div className="p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors flex items-center gap-3">
                <Plus className="h-4 w-4" />
                <div>
                  <p className="font-medium">Publish Nexus Weekly</p>
                  <p className="text-sm text-muted-foreground">Create a new weekly issue</p>
                </div>
              </div>
            </Link>
            {totalPending > 0 && (
              <Link href="/admin/moderation">
                <div className="p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950 hover:bg-yellow-100 dark:hover:bg-yellow-900 cursor-pointer transition-colors flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-300">Review Pending Content</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">{totalPending} items need review</p>
                  </div>
                </div>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Pending Review */}
        {(pendingItems.pendingProjects.length > 0 || pendingItems.pendingTools.length > 0) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Pending Review
              </CardTitle>
              <CardDescription>Content awaiting admin approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {pendingItems.pendingProjects.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Rocket className="h-4 w-4" />
                      Projects
                    </h4>
                    <div className="space-y-2">
                      {pendingItems.pendingProjects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/admin/content/projects`}
                          className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                        >
                          <p className="font-medium truncate">{project.title}</p>
                          <p className="text-sm text-muted-foreground">
                            by {project.user?.name || "Unknown"} &bull;{" "}
                            {project.createdAt?.toLocaleDateString()}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {pendingItems.pendingTools.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Shared Tools
                    </h4>
                    <div className="space-y-2">
                      {pendingItems.pendingTools.map((tool) => (
                        <Link
                          key={tool.id}
                          href={`/admin/content/tools`}
                          className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                        >
                          <p className="font-medium truncate">{tool.name}</p>
                          <p className="text-sm text-muted-foreground">
                            by {tool.user?.name || "Unknown"} &bull;{" "}
                            {tool.createdAt?.toLocaleDateString()}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
