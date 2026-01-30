import { NextRequest, NextResponse } from "next/server";
import { eq, desc, like, or, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, enrollments, discussions, projects } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";

// GET /api/admin/users - List all users
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
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
      })
      .from(users)
      .$dynamic();

    if (search) {
      query = query.where(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    if (role && role !== "all") {
      query = query.where(eq(users.role, role as "user" | "admin"));
    }

    const usersList = await query
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ total }] = await db.select({ total: count() }).from(users);

    // Get stats for each user
    const usersWithStats = await Promise.all(
      usersList.map(async (user) => {
        const [[enrollmentCount], [discussionCount], [projectCount]] = await Promise.all([
          db.select({ count: count() }).from(enrollments).where(eq(enrollments.userId, user.id)),
          db.select({ count: count() }).from(discussions).where(eq(discussions.userId, user.id)),
          db.select({ count: count() }).from(projects).where(eq(projects.userId, user.id)),
        ]);

        return {
          ...user,
          stats: {
            enrollments: enrollmentCount.count,
            discussions: discussionCount.count,
            projects: projectCount.count,
          },
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
