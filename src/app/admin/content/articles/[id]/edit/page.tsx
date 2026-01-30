import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, tags, articleTags } from "@/lib/db/schema";
import { ArrowLeft } from "lucide-react";
import { ArticleForm } from "../../article-form";

type Props = {
  params: Promise<{ id: string }>;
};

async function getArticle(id: string) {
  const article = await db.query.articles.findFirst({
    where: eq(articles.id, id),
  });

  if (!article) {
    return null;
  }

  // Get tags
  const articleTagsList = await db
    .select({
      name: tags.name,
      slug: tags.slug,
    })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, article.id));

  return {
    ...article,
    tags: articleTagsList,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: `Edit: ${article.title} - Admin`,
  };
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

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
        <h1 className="text-3xl font-bold">Edit Article</h1>
        <p className="text-muted-foreground">Update the article details below.</p>
      </div>

      <ArticleForm article={article} />
    </div>
  );
}
