import { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { nexusWeeklyIssues } from "@/lib/db/schema";
import { ArrowLeft } from "lucide-react";
import { IssueForm } from "../issue-form";

export const metadata: Metadata = {
  title: "New Issue - Admin",
};

export default async function NewIssuePage() {
  // Get next issue number
  const latestIssue = await db
    .select({ issueNumber: nexusWeeklyIssues.issueNumber })
    .from(nexusWeeklyIssues)
    .orderBy(desc(nexusWeeklyIssues.issueNumber))
    .limit(1);

  const nextIssueNumber = (latestIssue[0]?.issueNumber || 0) + 1;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/content/nexus-weekly"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Nexus Weekly
      </Link>

      <div>
        <h1 className="text-3xl font-bold">New Issue</h1>
        <p className="text-muted-foreground">Create a new AI Nexus Weekly issue.</p>
      </div>

      <IssueForm nextIssueNumber={nextIssueNumber} />
    </div>
  );
}
