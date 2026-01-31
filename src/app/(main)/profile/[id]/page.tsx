import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, desc, and, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, userSettings, projects, discussions, userFollows, userPoints } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code2,
  Rocket,
  MessageSquare,
  ExternalLink,
  MapPin,
  Trophy,
} from "lucide-react";
import { FollowButton, FollowersList } from "@/components/social";
import { getUserBadges } from "@/lib/gamification";
import { BadgeDisplay } from "@/components/gamification";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    return { title: "User Not Found" };
  }

  return {
    title: user.name || "User Profile",
    description: `View ${user.name}'s profile on AI Coding Lyceum`,
  };
}

async function getUserData(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return null;

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, userId),
  });

  return { ...user, settings };
}

async function getUserStats(userId: string) {
  const [followerCount] = await db
    .select({ count: db.$count(userFollows, eq(userFollows.followingId, userId)) })
    .from(userFollows)
    .where(eq(userFollows.followingId, userId));

  const [followingCount] = await db
    .select({ count: db.$count(userFollows, eq(userFollows.followerId, userId)) })
    .from(userFollows)
    .where(eq(userFollows.followerId, userId));

  const pointsData = await db.query.userPoints.findFirst({
    where: eq(userPoints.userId, userId),
  });

  return {
    followers: followerCount?.count || 0,
    following: followingCount?.count || 0,
    points: pointsData?.totalPoints || 0,
    level: pointsData?.level || 1,
  };
}

async function getUserProjects(userId: string) {
  return db.query.projects.findMany({
    where: and(
      eq(projects.userId, userId),
      or(eq(projects.status, "approved"), eq(projects.status, "featured"))
    ),
    orderBy: desc(projects.createdAt),
    limit: 6,
  });
}

async function getUserDiscussions(userId: string) {
  return db.query.discussions.findMany({
    where: eq(discussions.userId, userId),
    orderBy: desc(discussions.createdAt),
    limit: 6,
  });
}

async function checkIsFollowing(currentUserId: string | undefined, targetUserId: string) {
  if (!currentUserId || currentUserId === targetUserId) return false;

  const follow = await db.query.userFollows.findFirst({
    where: and(
      eq(userFollows.followerId, currentUserId),
      eq(userFollows.followingId, targetUserId)
    ),
  });

  return !!follow;
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const userData = await getUserData(id);

  if (!userData) {
    notFound();
  }

  const [stats, userProjectsList, userDiscussionsList, isFollowing, userBadgesList] = await Promise.all([
    getUserStats(id),
    getUserProjects(id),
    getUserDiscussions(id),
    checkIsFollowing(session?.user?.id, id),
    getUserBadges(id),
  ]);

  const isOwnProfile = session?.user?.id === id;

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarImage src={userData.image || ""} alt={userData.name || ""} />
              <AvatarFallback className="text-2xl">
                {userData.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">{userData.name || "Anonymous"}</CardTitle>
            {userData.settings?.bio && (
              <p className="text-sm text-muted-foreground mt-2">{userData.settings.bio}</p>
            )}
            {userData.settings?.location && (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {userData.settings.location}
              </p>
            )}
            <div className="flex items-center justify-center gap-2 mt-3">
              <Badge variant="outline" className="gap-1">
                <Trophy className="h-3 w-3" />
                Level {stats.level}
              </Badge>
              <Badge variant="secondary">
                {stats.points.toLocaleString()} pts
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Follow Stats */}
            <div className="flex items-center justify-center gap-6 py-4 border-y">
              <FollowersList userId={id} type="followers" count={stats.followers} />
              <FollowersList userId={id} type="following" count={stats.following} />
            </div>

            {/* Follow Button */}
            {!isOwnProfile && (
              <div className="mt-4">
                <FollowButton
                  userId={id}
                  initialIsFollowing={isFollowing}
                  size="default"
                  variant="default"
                />
              </div>
            )}

            {/* Social Links */}
            {(userData.settings?.website || userData.settings?.github || userData.settings?.twitter) && (
              <div className="mt-4 pt-4 border-t space-y-2">
                {userData.settings.website && (
                  <a
                    href={userData.settings.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {userData.settings.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {userData.settings.github && (
                  <a
                    href={`https://github.com/${userData.settings.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Code2 className="h-4 w-4" />
                    {userData.settings.github}
                  </a>
                )}
              </div>
            )}

            {/* Own Profile Link */}
            {isOwnProfile && (
              <div className="mt-4">
                <Link
                  href="/profile"
                  className="text-sm text-primary hover:underline"
                >
                  Go to your dashboard
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList>
              <TabsTrigger value="projects" className="gap-2">
                <Rocket className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="discussions" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Discussions
              </TabsTrigger>
              <TabsTrigger value="badges" className="gap-2">
                <Trophy className="h-4 w-4" />
                Badges
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              {userProjectsList.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {userProjectsList.map((project) => (
                    <Card key={project.id}>
                      <CardContent className="pt-6">
                        <Link
                          href={`/create/showcase/${project.id}`}
                          className="font-medium hover:underline"
                        >
                          {project.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {project.description}
                        </p>
                        {project.status === "featured" && (
                          <Badge className="mt-2 bg-yellow-500">Featured</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No public projects yet.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="discussions" className="space-y-4">
              {userDiscussionsList.length > 0 ? (
                <div className="space-y-4">
                  {userDiscussionsList.map((discussion) => (
                    <Card key={discussion.id}>
                      <CardContent className="pt-6">
                        <Link
                          href={`/practice/discussions/${discussion.id}`}
                          className="font-medium hover:underline"
                        >
                          {discussion.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {discussion.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {discussion.createdAt?.toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No discussions yet.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="badges">
              <BadgeDisplay badges={userBadgesList} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
