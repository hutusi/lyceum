import { Metadata } from "next";
import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { practiceTopics, discussions } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TopicsTable } from "./topics-table";

export const metadata: Metadata = {
  title: "Manage Practice Topics - Admin",
};

export default async function AdminPracticePage() {
  const topics = await db
    .select({
      id: practiceTopics.id,
      title: practiceTopics.title,
      slug: practiceTopics.slug,
      description: practiceTopics.description,
      difficulty: practiceTopics.difficulty,
      category: practiceTopics.category,
      createdAt: practiceTopics.createdAt,
      discussionCount: sql<number>`(SELECT COUNT(*) FROM discussions WHERE topic_id = ${practiceTopics.id})`,
    })
    .from(practiceTopics)
    .orderBy(desc(practiceTopics.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Practice Topics</h1>
          <p className="text-muted-foreground">
            Manage practice topics and exercises
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/practice/new">
            <Plus className="mr-2 h-4 w-4" />
            New Topic
          </Link>
        </Button>
      </div>

      <TopicsTable topics={topics} />
    </div>
  );
}
