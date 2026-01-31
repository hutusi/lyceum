"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  GraduationCap,
  BookOpen,
  Award,
  Library,
  Trophy,
  MessageSquare,
  MessageCircle,
  Users,
  Lightbulb,
  Sparkles,
  Wrench,
  Star,
  Zap,
  Medal,
  Crown,
} from "lucide-react";

interface BadgeData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  category: string;
  earnedAt?: Date | null;
}

interface BadgeDisplayProps {
  badges: BadgeData[];
  showAll?: boolean;
  allBadges?: BadgeData[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  BookOpen,
  Award,
  Library,
  Trophy,
  MessageSquare,
  MessageCircle,
  Users,
  Lightbulb,
  Sparkles,
  Wrench,
  Star,
  Zap,
  Medal,
  Crown,
};

const categoryColors: Record<string, string> = {
  learning: "from-blue-500 to-cyan-500",
  community: "from-green-500 to-emerald-500",
  achievement: "from-purple-500 to-pink-500",
  special: "from-yellow-500 to-orange-500",
};

function BadgeIcon({ icon, earned, category }: { icon: string; earned: boolean; category: string }) {
  const IconComponent = iconMap[icon] || Award;
  const colorClass = earned ? categoryColors[category] || "from-gray-400 to-gray-500" : "from-gray-300 to-gray-400";

  return (
    <div
      className={`
        flex items-center justify-center h-12 w-12 rounded-full
        bg-gradient-to-br ${colorClass}
        ${earned ? "text-white" : "text-gray-500 opacity-50"}
        transition-all duration-200
        ${earned ? "hover:scale-110" : ""}
      `}
    >
      <IconComponent className="h-6 w-6" />
    </div>
  );
}

export function BadgeDisplay({ badges, showAll = false, allBadges = [] }: BadgeDisplayProps) {
  const earnedBadgeIds = new Set(badges.map((b) => b.id));

  // If showAll, display all badges with earned ones highlighted
  const displayBadges = showAll
    ? allBadges.map((b) => ({
        ...b,
        earned: earnedBadgeIds.has(b.id),
        earnedAt: badges.find((eb) => eb.id === b.id)?.earnedAt,
      }))
    : badges.map((b) => ({ ...b, earned: true }));

  // Group by category
  const groupedBadges = displayBadges.reduce(
    (acc, badge) => {
      const category = badge.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(badge);
      return acc;
    },
    {} as Record<string, typeof displayBadges>
  );

  const categoryLabels: Record<string, string> = {
    learning: "Learning",
    community: "Community",
    achievement: "Achievement",
    special: "Special",
  };

  if (badges.length === 0 && !showAll) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No badges earned yet. Keep learning and contributing to unlock badges!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="h-5 w-5" />
          Badges
          {badges.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {badges.length} earned
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <TooltipProvider>
          {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                {categoryLabels[category] || category}
              </h4>
              <div className="flex flex-wrap gap-3">
                {categoryBadges.map((badge) => (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                      <button className="relative focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
                        <BadgeIcon
                          icon={badge.icon}
                          earned={badge.earned}
                          category={badge.category}
                        />
                        {badge.earned && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                            <svg
                              className="h-2.5 w-2.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="font-semibold">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                      {badge.earned && badge.earnedAt && (
                        <p className="text-xs text-green-500 mt-1">
                          Earned{" "}
                          {new Date(badge.earnedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}
                      {!badge.earned && (
                        <p className="text-xs text-muted-foreground mt-1 italic">Not yet earned</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
