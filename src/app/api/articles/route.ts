import { NextRequest, NextResponse } from "next/server";
import { eq, desc, like, and, or, sql } from "drizzle-orm";
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

// GET /api/articles - List published articles with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const status = searchParams.get("status") || "published";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];

    if (status !== "all") {
      conditions.push(eq(articles.status, status as "draft" | "published" | "archived"));
    }

    if (type && type !== "all") {
      conditions.push(eq(articles.type, type as "article" | "news" | "video" | "livestream"));
    }

    if (search) {
      conditions.push(
        or(
          like(articles.title, `%${search}%`),
          like(articles.excerpt, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get articles with author info
    const articlesList = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        coverImage: articles.coverImage,
        type: articles.type,
        videoUrl: articles.videoUrl,
        status: articles.status,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        authorId: articles.authorId,
        authorName: users.name,
        authorImage: users.image,
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(whereClause)
      .orderBy(desc(articles.publishedAt), desc(articles.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    // Get tags for each article
    const articlesWithTags = await Promise.all(
      articlesList.map(async (article) => {
        const articleTagsList = await db
          .select({
            id: tags.id,
            name: tags.name,
            slug: tags.slug,
          })
          .from(articleTags)
          .innerJoin(tags, eq(articleTags.tagId, tags.id))
          .where(eq(articleTags.articleId, article.id));

        return {
          ...article,
          tags: articleTagsList,
          author: {
            id: article.authorId,
            name: article.authorName,
            image: article.authorImage,
          },
        };
      })
    );

    // Filter by tag if specified
    let filteredArticles = articlesWithTags;
    if (tag) {
      filteredArticles = articlesWithTags.filter((article) =>
        article.tags.some((t) => t.slug === tag || t.name.toLowerCase() === tag.toLowerCase())
      );
    }

    return NextResponse.json({
      articles: filteredArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/articles - Create a new article (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, excerpt, content, coverImage, type, videoUrl, status, tagNames } = body;

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: "Title, content, and type are required" },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = generateSlug(title);
    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
    });

    if (existingArticle) {
      slug = `${slug}-${nanoid(6)}`;
    }

    const articleId = nanoid();
    const now = new Date();

    // Create article
    const newArticle = await db
      .insert(articles)
      .values({
        id: articleId,
        title,
        slug,
        excerpt,
        content,
        coverImage,
        type,
        videoUrl,
        status: status || "draft",
        authorId: session.user.id,
        publishedAt: status === "published" ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Handle tags
    if (tagNames && Array.isArray(tagNames)) {
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
          articleId,
          tagId: tag.id,
        });
      }
    }

    return NextResponse.json(
      {
        message: "Article created successfully",
        article: newArticle[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
