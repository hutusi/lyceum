import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArticleForm } from "../article-form";

export const metadata: Metadata = {
  title: "New Article - Admin",
  description: "Create a new article, news, video, or live stream.",
};

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/content/articles"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Articles
      </Link>

      <div>
        <h1 className="text-3xl font-bold">New Article</h1>
        <p className="text-muted-foreground">
          Create a new article, news, video, or live stream.
        </p>
      </div>

      <ArticleForm />
    </div>
  );
}
