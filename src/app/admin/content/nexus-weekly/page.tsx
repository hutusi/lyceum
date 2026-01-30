import { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { nexusWeeklyIssues } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { IssuesTable } from "./issues-table";

export const metadata: Metadata = {
  title: "Manage Nexus Weekly - Admin",
};

export default async function AdminNexusWeeklyPage() {
  const issues = await db
    .select()
    .from(nexusWeeklyIssues)
    .orderBy(desc(nexusWeeklyIssues.issueNumber));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Nexus Weekly</h1>
          <p className="text-muted-foreground">
            Create and manage weekly newsletter issues
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/nexus-weekly/new">
            <Plus className="mr-2 h-4 w-4" />
            New Issue
          </Link>
        </Button>
      </div>

      <IssuesTable issues={issues} />
    </div>
  );
}
