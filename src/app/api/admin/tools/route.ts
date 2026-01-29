import { NextRequest, NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { sharedTools, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

// GET /api/admin/tools - List all tools for admin (including pending)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const whereClause = status ? eq(sharedTools.status, status as "pending" | "approved" | "featured" | "rejected") : undefined;

    const tools = await db
      .select({
        id: sharedTools.id,
        name: sharedTools.name,
        slug: sharedTools.slug,
        description: sharedTools.description,
        type: sharedTools.type,
        version: sharedTools.version,
        status: sharedTools.status,
        downloads: sharedTools.downloads,
        stars: sharedTools.stars,
        createdAt: sharedTools.createdAt,
        publishedAt: sharedTools.publishedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(sharedTools)
      .leftJoin(users, eq(sharedTools.userId, users.id))
      .where(whereClause)
      .orderBy(desc(sharedTools.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(sharedTools)
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    // Get counts by status
    const statusCounts = await db
      .select({
        status: sharedTools.status,
        count: sql<number>`count(*)`,
      })
      .from(sharedTools)
      .groupBy(sharedTools.status);

    return NextResponse.json({
      tools: tools.map((t) => ({
        ...t,
        author: {
          name: t.userName,
          email: t.userEmail,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts: statusCounts.reduce((acc, { status, count }) => {
        acc[status || "unknown"] = count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error("Error fetching tools for admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
