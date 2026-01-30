import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, lt, gt, desc, asc, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { nexusWeeklyIssues } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Newspaper } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

async function getIssue(id: string) {
  const issue = await db.query.nexusWeeklyIssues.findFirst({
    where: eq(nexusWeeklyIssues.id, id),
  });
  return issue || null;
}

async function getAdjacentIssues(issueNumber: number) {
  const prevIssue = await db
    .select({ id: nexusWeeklyIssues.id, issueNumber: nexusWeeklyIssues.issueNumber, title: nexusWeeklyIssues.title })
    .from(nexusWeeklyIssues)
    .where(and(
      eq(nexusWeeklyIssues.status, "published"),
      lt(nexusWeeklyIssues.issueNumber, issueNumber)
    ))
    .orderBy(desc(nexusWeeklyIssues.issueNumber))
    .limit(1);

  const nextIssue = await db
    .select({ id: nexusWeeklyIssues.id, issueNumber: nexusWeeklyIssues.issueNumber, title: nexusWeeklyIssues.title })
    .from(nexusWeeklyIssues)
    .where(and(
      eq(nexusWeeklyIssues.status, "published"),
      gt(nexusWeeklyIssues.issueNumber, issueNumber)
    ))
    .orderBy(asc(nexusWeeklyIssues.issueNumber))
    .limit(1);

  return {
    prev: prevIssue[0] || null,
    next: nextIssue[0] || null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const issue = await getIssue(id);

  if (!issue) {
    return { title: "Issue Not Found" };
  }

  return {
    title: `Issue #${issue.issueNumber}: ${issue.title} - AI Nexus Weekly`,
    description: issue.content.slice(0, 160),
  };
}

export default async function IssueDetailPage({ params }: Props) {
  const { id } = await params;
  const issue = await getIssue(id);

  if (!issue) {
    notFound();
  }

  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  // Only show published issues to public
  if (issue.status !== "published" && !isAdmin) {
    notFound();
  }

  const { prev, next } = await getAdjacentIssues(issue.issueNumber);

  return (
    <div className="container py-8 max-w-4xl">
      <Link
        href="/create/nexus-weekly"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        All Issues
      </Link>

      {/* Draft indicator */}
      {issue.status === "draft" && isAdmin && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            This issue is a draft and not visible to the public.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="h-6 w-6 text-primary" />
          <Badge variant="outline">Issue #{issue.issueNumber}</Badge>
        </div>
        <h1 className="text-3xl font-bold mb-4">{issue.title}</h1>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {issue.publishedAt?.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }) || "Draft"}
        </div>
      </div>

      {/* Content */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap">
            {issue.content}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t">
        {prev ? (
          <Button variant="outline" asChild>
            <Link href={`/create/nexus-weekly/${prev.id}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Issue #{prev.issueNumber}</span>
              <span className="sm:hidden">Prev</span>
            </Link>
          </Button>
        ) : (
          <div />
        )}

        <Button variant="ghost" asChild>
          <Link href="/create/nexus-weekly">All Issues</Link>
        </Button>

        {next ? (
          <Button variant="outline" asChild>
            <Link href={`/create/nexus-weekly/${next.id}`}>
              <span className="hidden sm:inline">Issue #{next.issueNumber}</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
