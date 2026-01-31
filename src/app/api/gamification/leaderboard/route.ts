import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/gamification";

// GET /api/gamification/leaderboard - Get the points leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const leaderboard = await getLeaderboard(Math.min(limit, 100));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
