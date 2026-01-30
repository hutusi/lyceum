import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TopicForm } from "../topic-form";

export const metadata: Metadata = {
  title: "New Practice Topic - Admin",
};

export default function NewTopicPage() {
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
        <h1 className="text-3xl font-bold">New Practice Topic</h1>
        <p className="text-muted-foreground">Create a new practice topic for the community.</p>
      </div>

      <TopicForm />
    </div>
  );
}
