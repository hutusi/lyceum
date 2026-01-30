import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { nexusWeeklyIssues } from "@/lib/db/schema";
import { ArrowLeft } from "lucide-react";
import { IssueForm } from "../../issue-form";

type Props = {
  params: Promise<{ id: string }>;
};

async function getIssue(id: string) {
  const issue = await db.query.nexusWeeklyIssues.findFirst({
    where: eq(nexusWeeklyIssues.id, id),
  });
  return issue;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const issue = await getIssue(id);

  if (!issue) {
    return { title: "Issue Not Found" };
  }

  return {
    title: `Edit Issue #${issue.issueNumber} - Admin`,
  };
}

export default async function EditIssuePage({ params }: Props) {
  const { id } = await params;
  const issue = await getIssue(id);

  if (!issue) {
    notFound();
  }

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
        <h1 className="text-3xl font-bold">Edit Issue #{issue.issueNumber}</h1>
        <p className="text-muted-foreground">Update the issue details.</p>
      </div>

      <IssueForm issue={issue} />
    </div>
  );
}
