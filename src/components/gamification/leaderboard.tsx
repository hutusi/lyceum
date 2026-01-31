"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  userId: string;
  userName: string | null;
  userImage: string | null;
  totalPoints: number;
  level: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-medium text-muted-foreground w-5 text-center">{rank}</span>;
  }
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
    case 2:
      return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
    case 3:
      return "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200";
    default:
      return "";
  }
}

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No entries yet. Be the first to earn points!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.userId === currentUserId;

            return (
              <div
                key={entry.userId}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border
                  ${getRankStyle(rank)}
                  ${isCurrentUser ? "ring-2 ring-primary ring-offset-1" : ""}
                `}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(rank)}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.userImage || ""} alt={entry.userName || ""} />
                  <AvatarFallback className="text-xs">
                    {entry.userName?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {entry.userName || "Anonymous"}
                    {isCurrentUser && (
                      <span className="text-xs text-muted-foreground ml-1">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{entry.totalPoints.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
