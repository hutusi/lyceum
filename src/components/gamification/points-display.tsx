"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, TrendingUp } from "lucide-react";

interface PointsDisplayProps {
  points: number;
  level: number;
  levelProgress: number;
  nextLevelThreshold: number;
  compact?: boolean;
}

export function PointsDisplay({
  points,
  level,
  levelProgress,
  nextLevelThreshold,
  compact = false,
}: PointsDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="font-semibold">{points.toLocaleString()}</span>
          <span className="text-muted-foreground">pts</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <span className="font-semibold">Level {level}</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Points & Level
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{points.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <span className="text-2xl font-bold">{level}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Level</p>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress to Level {level + 1}</span>
            <span className="font-medium">{Math.round(levelProgress)}%</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {nextLevelThreshold - points > 0
              ? `${(nextLevelThreshold - points).toLocaleString()} points to next level`
              : "Max level reached!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
