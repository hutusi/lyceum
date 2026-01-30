import { NextRequest, NextResponse } from "next/server";
import { eq, desc, like, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { practiceTopics, discussions } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

// GET /api/practice/topics - List all topics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const difficulty = searchParams.get("difficulty");
    const category = searchParams.get("category");

    // Build query with discussion counts
    let query = db
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
      .$dynamic();

    // Apply filters
    const conditions = [];

    if (search) {
      conditions.push(like(practiceTopics.title, `%${search}%`));
    }

    if (difficulty && difficulty !== "all") {
      conditions.push(eq(practiceTopics.difficulty, difficulty as "easy" | "medium" | "hard"));
    }

    if (category && category !== "all") {
      conditions.push(eq(practiceTopics.category, category));
    }

    if (conditions.length > 0) {
      for (const condition of conditions) {
        query = query.where(condition);
      }
    }

    const topics = await query.orderBy(desc(practiceTopics.createdAt));

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/practice/topics - Create a new topic (admin only)
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
    const { title, slug, description, difficulty, category } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await db.query.practiceTopics.findFirst({
      where: eq(practiceTopics.slug, slug),
    });

    if (existing) {
      return NextResponse.json(
        { error: "A topic with this slug already exists" },
        { status: 409 }
      );
    }

    const newTopic = await db
      .insert(practiceTopics)
      .values({
        id: nanoid(),
        title,
        slug,
        description,
        difficulty,
        category,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Topic created successfully",
        topic: newTopic[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
