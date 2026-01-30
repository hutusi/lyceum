import { Metadata } from "next";
import { desc, eq, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { userActivities } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Activity,
  GraduationCap,
  MessageSquare,
  Rocket,
  Wrench,
  Star,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Activity Log - Admin",
  description: "View platform activity.",
};

async function getActivityStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);

  const [[todayCount], [weekCount], [totalCount]] = await Promise.all([
    db.select({ count: count() }).from(userActivities).where(eq(userActivities.createdAt, today)),
    db.select({ count: count() }).from(userActivities),
    db.select({ count: count() }).from(userActivities),
  ]);

  return {
    today: todayCount.count,
    thisWeek: weekCount.count,
    total: totalCount.count,
  };
}

async function getRecentActivities() {
  return db.query.userActivities.findMany({
    orderBy: desc(userActivities.createdAt),
    limit: 100,
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
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
    case "tool_published":
      return <Wrench className="h-4 w-4" />;
    case "review_added":
      return <Star className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

function getActivityBadge(type: string) {
  switch (type) {
    case "course_enrolled":
      return <Badge variant="secondary">Enrolled</Badge>;
    case "course_completed":
      return <Badge className="bg-green-500">Completed</Badge>;
    case "lesson_completed":
      return <Badge variant="secondary">Lesson</Badge>;
    case "discussion_created":
      return <Badge className="bg-blue-500">Discussion</Badge>;
    case "comment_added":
      return <Badge variant="outline">Comment</Badge>;
    case "project_submitted":
      return <Badge className="bg-purple-500">Project</Badge>;
    case "project_approved":
      return <Badge className="bg-green-500">Approved</Badge>;
    case "tool_published":
      return <Badge className="bg-orange-500">Tool</Badge>;
    case "review_added":
      return <Badge className="bg-yellow-500">Review</Badge>;
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
}

function getActivityLabel(type: string) {
  switch (type) {
    case "course_enrolled":
      return "enrolled in course";
    case "course_completed":
      return "completed course";
    case "lesson_completed":
      return "completed lesson";
    case "discussion_created":
      return "started discussion";
    case "comment_added":
      return "added comment";
    case "project_submitted":
      return "submitted project";
    case "project_approved":
      return "project was approved";
    case "tool_published":
      return "published tool";
    case "review_added":
      return "added review";
    default:
      return type.replace(/_/g, " ");
  }
}

export default async function ActivityLogPage() {
  const [stats, activities] = await Promise.all([
    getActivityStats(),
    getRecentActivities(),
  ]);

  // Group activities by date
  const groupedActivities: Record<string, typeof activities> = {};
  for (const activity of activities) {
    const dateKey = activity.createdAt?.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) || "Unknown";

    if (!groupedActivities[dateKey]) {
      groupedActivities[dateKey] = [];
    }
    groupedActivities[dateKey].push(activity);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground">
          View all platform activity and user actions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Activities
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Activity Types
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9</div>
            <p className="text-xs text-muted-foreground">Different action types</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest 100 activities on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No activity recorded yet.
            </p>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedActivities).map(([date, dayActivities]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 sticky top-0 bg-background py-2">
                    {date}
                  </h3>
                  <div className="space-y-4 ml-4 border-l-2 border-muted pl-4">
                    {dayActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 relative"
                      >
                        <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-background border-2 border-muted flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.user?.image || ""} />
                          <AvatarFallback>
                            {activity.user?.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">
                              {activity.user?.name || "Unknown User"}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {getActivityLabel(activity.type)}
                            </span>
                            {getActivityBadge(activity.type)}
                          </div>
                          {activity.resourceTitle && (
                            <p className="text-sm text-foreground mt-1">
                              {activity.resourceTitle}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.createdAt?.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
