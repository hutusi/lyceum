import { NextRequest, NextResponse } from "next/server";
import { eq, desc, ne, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { articles, tags, articleTags, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// GET /api/articles/[slug] - Get article details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get article with author
    const article = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        coverImage: articles.coverImage,
        type: articles.type,
        videoUrl: articles.videoUrl,
        status: articles.status,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        authorId: articles.authorId,
        authorName: users.name,
        authorImage: users.image,
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.slug, slug))
      .limit(1);

    if (article.length === 0) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    const articleData = article[0];

    // Check if article is published (unless admin)
    const session = await auth();
    if (articleData.status !== "published" && session?.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Get tags
    const articleTagsList = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(articleTags)
      .innerJoin(tags, eq(articleTags.tagId, tags.id))
      .where(eq(articleTags.articleId, articleData.id));

    // Get related articles (same type, different article)
    const relatedArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        coverImage: articles.coverImage,
        type: articles.type,
        publishedAt: articles.publishedAt,
      })
      .from(articles)
      .where(
        and(
          eq(articles.type, articleData.type),
          eq(articles.status, "published"),
          ne(articles.id, articleData.id)
        )
      )
      .orderBy(desc(articles.publishedAt))
      .limit(3);

    return NextResponse.json({
      ...articleData,
      author: {
        id: articleData.authorId,
        name: articleData.authorName,
        image: articleData.authorImage,
      },
      tags: articleTagsList,
      relatedArticles,
    });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/articles/[slug] - Update article (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const { title, excerpt, content, coverImage, type, videoUrl, status, tagNames } = body;

    // Get existing article
    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) {
      updateData.title = title;
      // Update slug if title changed
      if (title !== existingArticle.title) {
        let newSlug = generateSlug(title);
        const slugExists = await db.query.articles.findFirst({
          where: and(eq(articles.slug, newSlug), ne(articles.id, existingArticle.id)),
        });
        if (slugExists) {
          newSlug = `${newSlug}-${nanoid(6)}`;
        }
        updateData.slug = newSlug;
      }
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (type !== undefined) updateData.type = type;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (status !== undefined) {
      updateData.status = status;
      // Set publishedAt when publishing
      if (status === "published" && existingArticle.status !== "published") {
        updateData.publishedAt = new Date();
      }
    }

    // Update article
    const updatedArticle = await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, existingArticle.id))
      .returning();

    // Update tags if provided
    if (tagNames !== undefined) {
      // Remove existing tags
      await db.delete(articleTags).where(eq(articleTags.articleId, existingArticle.id));

      // Add new tags
      for (const tagName of tagNames) {
        const tagSlug = generateSlug(tagName);

        let tag = await db.query.tags.findFirst({
          where: eq(tags.slug, tagSlug),
        });

        if (!tag) {
          const newTag = await db
            .insert(tags)
            .values({
              id: nanoid(),
              name: tagName,
              slug: tagSlug,
            })
            .returning();
          tag = newTag[0];
        }

        await db.insert(articleTags).values({
          articleId: existingArticle.id,
          tagId: tag.id,
        });
      }
    }

    return NextResponse.json({
      message: "Article updated successfully",
      article: updatedArticle[0],
    });
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[slug] - Delete article (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { slug } = await params;

    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    await db.delete(articles).where(eq(articles.id, existingArticle.id));

    return NextResponse.json({
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
