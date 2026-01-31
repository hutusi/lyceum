import { db } from "@/lib/db";
import {
  userPoints,
  pointTransactions,
  badges,
  userBadges,
  enrollments,
  lessonProgress,
  discussions,
  comments,
  projects,
  sharedTools,
} from "@/lib/db/schema";
import { eq, sql, count, and } from "drizzle-orm";
import { nanoid } from "nanoid";

// Point values for different actions
export const POINT_VALUES = {
  course_enrolled: 10,
  lesson_completed: 5,
  course_completed: 50,
  discussion_created: 15,
  comment_added: 5,
  project_submitted: 20,
  project_approved: 30,
  project_featured: 50,
  tool_published: 20,
  tool_approved: 30,
  review_added: 10,
  daily_login: 5,
  first_enrollment: 25,
  first_project: 25,
  streak_bonus: 10,
} as const;

// Level thresholds
export const LEVEL_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  500, // Level 4
  1000, // Level 5
  2000, // Level 6
  3500, // Level 7
  5000, // Level 8
  7500, // Level 9
  10000, // Level 10
];

export function calculateLevel(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getNextLevelThreshold(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  }
  return LEVEL_THRESHOLDS[currentLevel];
}

export function getLevelProgress(points: number, level: number): number {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

type PointType = keyof typeof POINT_VALUES;

interface AwardPointsParams {
  userId: string;
  type: PointType;
  description?: string;
  resourceType?: string;
  resourceId?: string;
}

export async function awardPoints({
  userId,
  type,
  description,
  resourceType,
  resourceId,
}: AwardPointsParams): Promise<{ points: number; newLevel?: number }> {
  const pointValue = POINT_VALUES[type];

  // Create point transaction
  await db.insert(pointTransactions).values({
    id: nanoid(),
    userId,
    points: pointValue,
    type,
    description: description || getDefaultDescription(type),
    resourceType,
    resourceId,
  });

  // Get or create user points record
  const existingPoints = await db
    .select()
    .from(userPoints)
    .where(eq(userPoints.userId, userId))
    .limit(1);

  let totalPoints: number;
  let previousLevel: number;

  if (existingPoints.length === 0) {
    totalPoints = pointValue;
    previousLevel = 1;
    await db.insert(userPoints).values({
      id: nanoid(),
      userId,
      totalPoints,
      level: calculateLevel(totalPoints),
    });
  } else {
    previousLevel = existingPoints[0].level || 1;
    totalPoints = (existingPoints[0].totalPoints || 0) + pointValue;
    const newLevel = calculateLevel(totalPoints);
    await db
      .update(userPoints)
      .set({
        totalPoints,
        level: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(userPoints.userId, userId));
  }

  const newLevel = calculateLevel(totalPoints);

  // Check for badge eligibility after points update
  await checkAndAwardBadges(userId);

  return {
    points: pointValue,
    newLevel: newLevel > previousLevel ? newLevel : undefined,
  };
}

function getDefaultDescription(type: PointType): string {
  const descriptions: Record<PointType, string> = {
    course_enrolled: "Enrolled in a course",
    lesson_completed: "Completed a lesson",
    course_completed: "Completed a course",
    discussion_created: "Started a discussion",
    comment_added: "Added a comment",
    project_submitted: "Submitted a project",
    project_approved: "Project was approved",
    project_featured: "Project was featured",
    tool_published: "Published a tool",
    tool_approved: "Tool was approved",
    review_added: "Added a review",
    daily_login: "Daily login bonus",
    first_enrollment: "First course enrollment bonus",
    first_project: "First project submission bonus",
    streak_bonus: "Login streak bonus",
  };
  return descriptions[type];
}

// Badge definitions - these will be seeded into the database
export const BADGE_DEFINITIONS = [
  // Learning badges
  {
    slug: "first-steps",
    name: "First Steps",
    description: "Enroll in your first course",
    icon: "GraduationCap",
    category: "learning" as const,
    requirement: "enrollments",
    threshold: 1,
    points: 10,
  },
  {
    slug: "dedicated-learner",
    name: "Dedicated Learner",
    description: "Complete 10 lessons",
    icon: "BookOpen",
    category: "learning" as const,
    requirement: "lessons_completed",
    threshold: 10,
    points: 25,
  },
  {
    slug: "course-completer",
    name: "Course Completer",
    description: "Complete your first course",
    icon: "Award",
    category: "learning" as const,
    requirement: "courses_completed",
    threshold: 1,
    points: 50,
  },
  {
    slug: "knowledge-seeker",
    name: "Knowledge Seeker",
    description: "Enroll in 5 courses",
    icon: "Library",
    category: "learning" as const,
    requirement: "enrollments",
    threshold: 5,
    points: 30,
  },
  {
    slug: "master-student",
    name: "Master Student",
    description: "Complete 5 courses",
    icon: "Trophy",
    category: "learning" as const,
    requirement: "courses_completed",
    threshold: 5,
    points: 100,
  },
  // Community badges
  {
    slug: "conversation-starter",
    name: "Conversation Starter",
    description: "Start your first discussion",
    icon: "MessageSquare",
    category: "community" as const,
    requirement: "discussions",
    threshold: 1,
    points: 15,
  },
  {
    slug: "helpful-contributor",
    name: "Helpful Contributor",
    description: "Add 10 comments",
    icon: "MessageCircle",
    category: "community" as const,
    requirement: "comments",
    threshold: 10,
    points: 25,
  },
  {
    slug: "community-pillar",
    name: "Community Pillar",
    description: "Start 10 discussions",
    icon: "Users",
    category: "community" as const,
    requirement: "discussions",
    threshold: 10,
    points: 50,
  },
  // Achievement badges
  {
    slug: "creator",
    name: "Creator",
    description: "Submit your first project",
    icon: "Lightbulb",
    category: "achievement" as const,
    requirement: "projects",
    threshold: 1,
    points: 25,
  },
  {
    slug: "innovator",
    name: "Innovator",
    description: "Have a project approved",
    icon: "Sparkles",
    category: "achievement" as const,
    requirement: "projects_approved",
    threshold: 1,
    points: 40,
  },
  {
    slug: "tool-maker",
    name: "Tool Maker",
    description: "Publish your first tool",
    icon: "Wrench",
    category: "achievement" as const,
    requirement: "tools",
    threshold: 1,
    points: 30,
  },
  {
    slug: "rising-star",
    name: "Rising Star",
    description: "Have a project featured",
    icon: "Star",
    category: "achievement" as const,
    requirement: "projects_featured",
    threshold: 1,
    points: 75,
  },
  // Special badges
  {
    slug: "centurion",
    name: "Centurion",
    description: "Earn 100 points",
    icon: "Zap",
    category: "special" as const,
    requirement: "points",
    threshold: 100,
    points: 0,
  },
  {
    slug: "high-achiever",
    name: "High Achiever",
    description: "Reach level 5",
    icon: "Medal",
    category: "special" as const,
    requirement: "level",
    threshold: 5,
    points: 50,
  },
  {
    slug: "elite",
    name: "Elite",
    description: "Reach level 10",
    icon: "Crown",
    category: "special" as const,
    requirement: "level",
    threshold: 10,
    points: 100,
  },
];

export async function seedBadges(): Promise<void> {
  for (const badge of BADGE_DEFINITIONS) {
    const existing = await db
      .select()
      .from(badges)
      .where(eq(badges.slug, badge.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(badges).values({
        id: nanoid(),
        ...badge,
      });
    }
  }
}

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const earnedBadges: string[] = [];

  // Get user's current badges
  const currentBadges = await db
    .select({ badgeId: userBadges.badgeId })
    .from(userBadges)
    .where(eq(userBadges.userId, userId));

  const currentBadgeIds = new Set(currentBadges.map((b) => b.badgeId));

  // Get all badges
  const allBadges = await db.select().from(badges);

  // Get user stats
  const stats = await getUserStats(userId);

  for (const badge of allBadges) {
    if (currentBadgeIds.has(badge.id)) continue;

    const isEligible = checkBadgeEligibility(badge, stats);
    if (isEligible) {
      await db.insert(userBadges).values({
        id: nanoid(),
        userId,
        badgeId: badge.id,
      });
      earnedBadges.push(badge.name);

      // Award bonus points for earning a badge
      if (badge.points && badge.points > 0) {
        await db.insert(pointTransactions).values({
          id: nanoid(),
          userId,
          points: badge.points,
          type: "streak_bonus", // Using as a generic bonus type
          description: `Badge earned: ${badge.name}`,
        });

        // Update total points
        await db
          .update(userPoints)
          .set({
            totalPoints: sql`${userPoints.totalPoints} + ${badge.points}`,
            updatedAt: new Date(),
          })
          .where(eq(userPoints.userId, userId));
      }
    }
  }

  return earnedBadges;
}

interface UserStats {
  enrollments: number;
  lessonsCompleted: number;
  coursesCompleted: number;
  discussions: number;
  comments: number;
  projects: number;
  projectsApproved: number;
  projectsFeatured: number;
  tools: number;
  toolsApproved: number;
  points: number;
  level: number;
}

async function getUserStats(userId: string): Promise<UserStats> {
  const [
    enrollmentCount,
    lessonCount,
    courseCompleteCount,
    discussionCount,
    commentCount,
    projectCount,
    projectApprovedCount,
    projectFeaturedCount,
    toolCount,
    toolApprovedCount,
    pointsData,
  ] = await Promise.all([
    db.select({ count: count() }).from(enrollments).where(eq(enrollments.userId, userId)),
    db
      .select({ count: count() })
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.completed, true))),
    db
      .select({ count: count() })
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), sql`${enrollments.completedAt} IS NOT NULL`)),
    db.select({ count: count() }).from(discussions).where(eq(discussions.userId, userId)),
    db.select({ count: count() }).from(comments).where(eq(comments.userId, userId)),
    db.select({ count: count() }).from(projects).where(eq(projects.userId, userId)),
    db
      .select({ count: count() })
      .from(projects)
      .where(and(eq(projects.userId, userId), eq(projects.status, "approved"))),
    db
      .select({ count: count() })
      .from(projects)
      .where(and(eq(projects.userId, userId), eq(projects.status, "featured"))),
    db.select({ count: count() }).from(sharedTools).where(eq(sharedTools.userId, userId)),
    db
      .select({ count: count() })
      .from(sharedTools)
      .where(and(eq(sharedTools.userId, userId), eq(sharedTools.status, "approved"))),
    db.select().from(userPoints).where(eq(userPoints.userId, userId)).limit(1),
  ]);

  return {
    enrollments: enrollmentCount[0]?.count || 0,
    lessonsCompleted: lessonCount[0]?.count || 0,
    coursesCompleted: courseCompleteCount[0]?.count || 0,
    discussions: discussionCount[0]?.count || 0,
    comments: commentCount[0]?.count || 0,
    projects: projectCount[0]?.count || 0,
    projectsApproved: projectApprovedCount[0]?.count || 0,
    projectsFeatured: projectFeaturedCount[0]?.count || 0,
    tools: toolCount[0]?.count || 0,
    toolsApproved: toolApprovedCount[0]?.count || 0,
    points: pointsData[0]?.totalPoints || 0,
    level: pointsData[0]?.level || 1,
  };
}

function checkBadgeEligibility(
  badge: typeof badges.$inferSelect,
  stats: UserStats
): boolean {
  const threshold = badge.threshold || 0;

  switch (badge.requirement) {
    case "enrollments":
      return stats.enrollments >= threshold;
    case "lessons_completed":
      return stats.lessonsCompleted >= threshold;
    case "courses_completed":
      return stats.coursesCompleted >= threshold;
    case "discussions":
      return stats.discussions >= threshold;
    case "comments":
      return stats.comments >= threshold;
    case "projects":
      return stats.projects >= threshold;
    case "projects_approved":
      return stats.projectsApproved >= threshold;
    case "projects_featured":
      return stats.projectsFeatured >= threshold;
    case "tools":
      return stats.tools >= threshold;
    case "tools_approved":
      return stats.toolsApproved >= threshold;
    case "points":
      return stats.points >= threshold;
    case "level":
      return stats.level >= threshold;
    default:
      return false;
  }
}

export async function getUserPointsAndLevel(userId: string): Promise<{
  points: number;
  level: number;
  nextLevelThreshold: number;
  levelProgress: number;
}> {
  const pointsData = await db
    .select()
    .from(userPoints)
    .where(eq(userPoints.userId, userId))
    .limit(1);

  const points = pointsData[0]?.totalPoints || 0;
  const level = pointsData[0]?.level || 1;

  return {
    points,
    level,
    nextLevelThreshold: getNextLevelThreshold(level),
    levelProgress: getLevelProgress(points, level),
  };
}

export async function getUserBadges(userId: string): Promise<
  Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string;
    category: string;
    earnedAt: Date | null;
  }>
> {
  const result = await db
    .select({
      id: badges.id,
      name: badges.name,
      slug: badges.slug,
      description: badges.description,
      icon: badges.icon,
      category: badges.category,
      earnedAt: userBadges.earnedAt,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId))
    .orderBy(userBadges.earnedAt);

  return result;
}

export async function getLeaderboard(
  limit: number = 10
): Promise<
  Array<{
    userId: string;
    userName: string | null;
    userImage: string | null;
    totalPoints: number;
    level: number;
  }>
> {
  const result = await db.query.userPoints.findMany({
    orderBy: (userPoints, { desc }) => [desc(userPoints.totalPoints)],
    limit,
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return result.map((r) => ({
    userId: r.userId,
    userName: r.user?.name || null,
    userImage: r.user?.image || null,
    totalPoints: r.totalPoints || 0,
    level: r.level || 1,
  }));
}

export async function getRecentPointTransactions(
  userId: string,
  limit: number = 10
): Promise<
  Array<{
    id: string;
    points: number;
    type: string;
    description: string | null;
    createdAt: Date | null;
  }>
> {
  const result = await db
    .select()
    .from(pointTransactions)
    .where(eq(pointTransactions.userId, userId))
    .orderBy(sql`${pointTransactions.createdAt} DESC`)
    .limit(limit);

  return result;
}
