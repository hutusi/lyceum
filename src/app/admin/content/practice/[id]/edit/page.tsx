import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { practiceTopics } from "@/lib/db/schema";
import { ArrowLeft } from "lucide-react";
import { TopicForm } from "../../topic-form";

type Props = {
  params: Promise<{ id: string }>;
};

async function getTopic(id: string) {
  const topic = await db.query.practiceTopics.findFirst({
    where: eq(practiceTopics.id, id),
  });
  return topic;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const topic = await getTopic(id);

  if (!topic) {
    return { title: "Topic Not Found" };
  }

  return {
    title: `Edit: ${topic.title} - Admin`,
  };
}

export default async function EditTopicPage({ params }: Props) {
  const { id } = await params;
  const topic = await getTopic(id);

  if (!topic) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/content/practice"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Practice Topics
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Edit Topic</h1>
        <p className="text-muted-foreground">Update the practice topic details.</p>
      </div>

      <TopicForm topic={topic} />
    </div>
  );
}
