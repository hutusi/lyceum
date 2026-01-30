import { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, users } from "@/lib/db/schema";
import { ProjectsTable } from "./projects-table";

export const metadata: Metadata = {
  title: "Manage Projects - Admin",
};

export default async function AdminProjectsPage() {
  const projectsList = await db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      repoUrl: projects.repoUrl,
      demoUrl: projects.demoUrl,
      status: projects.status,
      createdAt: projects.createdAt,
      userId: projects.userId,
      userName: users.name,
    })
    .from(projects)
    .leftJoin(users, eq(projects.userId, users.id))
    .orderBy(desc(projects.createdAt));

  // Count by status
  const pendingCount = projectsList.filter(p => p.status === "pending").length;
  const approvedCount = projectsList.filter(p => p.status === "approved").length;
  const featuredCount = projectsList.filter(p => p.status === "featured").length;
  const rejectedCount = projectsList.filter(p => p.status === "rejected").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">
          Review and manage community project submissions
        </p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-sm text-muted-foreground">Pending Review</div>
        </div>
        <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950">
          <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </div>
        <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950">
          <div className="text-2xl font-bold text-blue-600">{featuredCount}</div>
          <div className="text-sm text-muted-foreground">Featured</div>
        </div>
        <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-950">
          <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          <div className="text-sm text-muted-foreground">Rejected</div>
        </div>
      </div>

      <ProjectsTable projects={projectsList} />
    </div>
  );
}
