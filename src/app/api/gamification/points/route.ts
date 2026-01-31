import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  getUserPointsAndLevel,
  getRecentPointTransactions,
  getUserBadges,
  LEVEL_THRESHOLDS,
} from "@/lib/gamification";

// GET /api/gamification/points - Get current user's points and level
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get("history") === "true";
    const includeBadges = searchParams.get("badges") === "true";

    const pointsData = await getUserPointsAndLevel(session.user.id!);

    const result: Record<string, unknown> = {
      ...pointsData,
      levelThresholds: LEVEL_THRESHOLDS,
    };

    if (includeHistory) {
      const transactions = await getRecentPointTransactions(session.user.id!, 20);
      result.transactions = transactions;
    }

    if (includeBadges) {
      const badges = await getUserBadges(session.user.id!);
      result.badges = badges;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
