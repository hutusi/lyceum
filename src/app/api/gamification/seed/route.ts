import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { seedBadges } from "@/lib/gamification";

// POST /api/gamification/seed - Seed badges (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    await seedBadges();

    return NextResponse.json({
      message: "Badges seeded successfully",
    });
  } catch (error) {
    console.error("Error seeding badges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
