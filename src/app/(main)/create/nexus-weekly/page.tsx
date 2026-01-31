import { Metadata } from "next";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { nexusWeeklyIssues } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Newspaper, Calendar, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Nexus Weekly",
  description: "Your weekly digest of AI news, trends, and community highlights.",
};

export const dynamic = "force-dynamic";

export default async function NexusWeeklyPage() {
  const issues = await db
    .select()
    .from(nexusWeeklyIssues)
    .where(eq(nexusWeeklyIssues.status, "published"))
    .orderBy(desc(nexusWeeklyIssues.issueNumber));

  const latestIssue = issues[0];
  const pastIssues = issues.slice(1);

  return (
    <div className="container py-8">
      <Link
        href="/create"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Create
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Newspaper className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Nexus Weekly</h1>
        </div>
        <p className="text-muted-foreground">
          Your weekly digest of AI news, trends, and community highlights.
        </p>
      </div>

      {issues.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No Issues Yet</CardTitle>
            <CardDescription>
              The first issue of AI Nexus Weekly is coming soon!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Latest Issue */}
          {latestIssue && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Latest Issue</h2>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Issue #{latestIssue.issueNumber}</Badge>
                    <Badge variant="secondary">Latest</Badge>
                  </div>
                  <CardTitle className="text-2xl">{latestIssue.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {latestIssue.publishedAt?.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {latestIssue.content.slice(0, 300)}...
                  </p>
                  <Button asChild>
                    <Link href={`/create/nexus-weekly/${latestIssue.id}`}>
                      Read Full Issue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Past Issues */}
          {pastIssues.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Past Issues</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastIssues.map((issue) => (
                  <Card key={issue.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <Badge variant="outline" className="w-fit mb-2">
                        Issue #{issue.issueNumber}
                      </Badge>
                      <CardTitle className="text-lg line-clamp-2">
                        <Link href={`/create/nexus-weekly/${issue.id}`} className="hover:underline">
                          {issue.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {issue.publishedAt?.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
