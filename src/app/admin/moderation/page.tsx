import { Metadata } from "next";
import { eq, desc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, sharedTools } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Rocket, Wrench, AlertCircle, CheckCircle } from "lucide-react";
import { ProjectsModeration } from "./projects-moderation";
import { ToolsModeration } from "./tools-moderation";

export const metadata: Metadata = {
  title: "Content Moderation - Admin",
  description: "Review and moderate user-submitted content.",
};

async function getModerationStats() {
  const [[pendingProjects], [pendingTools]] = await Promise.all([
    db.select({ count: count() }).from(projects).where(eq(projects.status, "pending")),
    db.select({ count: count() }).from(sharedTools).where(eq(sharedTools.status, "pending")),
  ]);

  return {
    pendingProjects: pendingProjects.count,
    pendingTools: pendingTools.count,
  };
}

async function getPendingProjects() {
  return db.query.projects.findMany({
    where: eq(projects.status, "pending"),
    orderBy: desc(projects.createdAt),
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

async function getPendingTools() {
  return db.query.sharedTools.findMany({
    where: eq(sharedTools.status, "pending"),
    orderBy: desc(sharedTools.createdAt),
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

export default async function ModerationPage() {
  const [stats, pendingProjects, pendingTools] = await Promise.all([
    getModerationStats(),
    getPendingProjects(),
    getPendingTools(),
  ]);

  const totalPending = stats.pendingProjects + stats.pendingTools;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground">
          Review and approve user-submitted content.
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pending
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
            <p className="text-xs text-muted-foreground">Items awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Projects
            </CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Tools
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTools}</div>
          </CardContent>
        </Card>
      </div>

      {totalPending === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">
              There&apos;s no content pending review at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects" className="gap-2">
              <Rocket className="h-4 w-4" />
              Projects
              {stats.pendingProjects > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.pendingProjects}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-2">
              <Wrench className="h-4 w-4" />
              Shared Tools
              {stats.pendingTools > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.pendingTools}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <ProjectsModeration projects={pendingProjects} />
          </TabsContent>

          <TabsContent value="tools">
            <ToolsModeration tools={pendingTools} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
