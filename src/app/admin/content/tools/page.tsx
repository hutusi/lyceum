import { Metadata } from "next";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { sharedTools, users } from "@/lib/db/schema";
import { ToolsTable } from "./tools-table";

export const metadata: Metadata = {
  title: "Manage Tools - Admin",
  description: "Manage shared tools, skills, agents, and MCPs.",
};

async function getTools() {
  const tools = await db
    .select({
      id: sharedTools.id,
      name: sharedTools.name,
      slug: sharedTools.slug,
      description: sharedTools.description,
      type: sharedTools.type,
      version: sharedTools.version,
      status: sharedTools.status,
      downloads: sharedTools.downloads,
      stars: sharedTools.stars,
      createdAt: sharedTools.createdAt,
      publishedAt: sharedTools.publishedAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(sharedTools)
    .leftJoin(users, eq(sharedTools.userId, users.id))
    .orderBy(desc(sharedTools.createdAt));

  // Get counts by status
  const statusCounts = await db
    .select({
      status: sharedTools.status,
      count: sql<number>`count(*)`,
    })
    .from(sharedTools)
    .groupBy(sharedTools.status);

  const counts = statusCounts.reduce(
    (acc, { status, count }) => {
      acc[status || "unknown"] = count;
      return acc;
    },
    { pending: 0, approved: 0, featured: 0, rejected: 0 } as Record<string, number>
  );

  return {
    tools: tools.map((t) => ({
      ...t,
      author: {
        name: t.userName,
        email: t.userEmail,
      },
    })),
    counts,
  };
}

export default async function AdminToolsPage() {
  const { tools, counts } = await getTools();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Tools</h1>
        <p className="text-muted-foreground">
          Review and approve tool submissions from the community.
        </p>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold text-green-600">{counts.approved}</p>
        </div>
        <div className="bg-purple-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Featured</p>
          <p className="text-2xl font-bold text-purple-600">{counts.featured}</p>
        </div>
        <div className="bg-red-500/10 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
        </div>
      </div>

      <ToolsTable tools={tools} />
    </div>
  );
}
