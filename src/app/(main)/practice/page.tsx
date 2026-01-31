import { Metadata } from "next";
import Link from "next/link";
import { eq, desc, sql, like } from "drizzle-orm";
import { db } from "@/lib/db";
import { practiceTopics, discussions, users, comments } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, MessageCircle, HelpCircle, Users as UsersIcon } from "lucide-react";
import { TopicSearch } from "./topic-search";
import { TopicFilters } from "./topic-filters";

export const metadata: Metadata = {
  title: "Practice",
  description: "Sharpen your skills with coding tasks, exercises, and community discussions.",
};

export const dynamic = "force-dynamic";

const difficultyColors = {
  easy: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  hard: "bg-red-500/10 text-red-500",
};

interface Props {
  searchParams: Promise<{
    search?: string;
    difficulty?: string;
    category?: string;
    tab?: string;
  }>;
}

export default async function PracticePage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search || "";
  const difficulty = params.difficulty || "all";
  const category = params.category || "all";
  const activeTab = params.tab || "topics";

  // Fetch topics with discussion counts
  let topicsQuery = db
    .select({
      id: practiceTopics.id,
      title: practiceTopics.title,
      slug: practiceTopics.slug,
      description: practiceTopics.description,
      difficulty: practiceTopics.difficulty,
      category: practiceTopics.category,
      createdAt: practiceTopics.createdAt,
      discussionCount: sql<number>`(SELECT COUNT(*) FROM discussions WHERE topic_id = ${practiceTopics.id})`,
    })
    .from(practiceTopics)
    .$dynamic();

  if (search) {
    topicsQuery = topicsQuery.where(like(practiceTopics.title, `%${search}%`));
  }

  if (difficulty !== "all") {
    topicsQuery = topicsQuery.where(eq(practiceTopics.difficulty, difficulty as "easy" | "medium" | "hard"));
  }

  if (category !== "all") {
    topicsQuery = topicsQuery.where(eq(practiceTopics.category, category));
  }

  const topics = await topicsQuery.orderBy(desc(practiceTopics.createdAt));

  // Get unique categories
  const allTopics = await db.select({ category: practiceTopics.category }).from(practiceTopics);
  const categories = [...new Set(allTopics.map(t => t.category).filter(Boolean))];

  // Fetch recent discussions
  const recentDiscussions = await db
    .select({
      id: discussions.id,
      title: discussions.title,
      content: discussions.content,
      createdAt: discussions.createdAt,
      isPinned: discussions.isPinned,
      userId: discussions.userId,
      userName: users.name,
      topicSlug: practiceTopics.slug,
      topicTitle: practiceTopics.title,
      commentCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE discussion_id = ${discussions.id})`,
    })
    .from(discussions)
    .leftJoin(users, eq(discussions.userId, users.id))
    .leftJoin(practiceTopics, eq(discussions.topicId, practiceTopics.id))
    .orderBy(desc(discussions.isPinned), desc(discussions.createdAt))
    .limit(10);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Practice</h1>
        <p className="text-muted-foreground">
          Sharpen your skills with coding tasks, exercises, and community discussions.
        </p>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="topics" className="gap-2" asChild>
            <Link href="/practice?tab=topics">
              <Code2 className="h-4 w-4" />
              Practice Topics
            </Link>
          </TabsTrigger>
          <TabsTrigger value="discussions" className="gap-2" asChild>
            <Link href="/practice?tab=discussions">
              <MessageCircle className="h-4 w-4" />
              Discussions
            </Link>
          </TabsTrigger>
          <TabsTrigger value="questions" className="gap-2" asChild>
            <Link href="/practice?tab=questions">
              <HelpCircle className="h-4 w-4" />
              Q&A
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <TopicSearch />
            <TopicFilters categories={categories as string[]} />
          </div>

          {topics.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="text-center">
                <Code2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <CardTitle>No Topics Found</CardTitle>
                <CardDescription>
                  {search || difficulty !== "all" || category !== "all"
                    ? "Try adjusting your filters or search query."
                    : "Practice topics will appear here once they're added."}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <Card key={topic.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex gap-2 mb-2">
                      {topic.difficulty && (
                        <Badge className={difficultyColors[topic.difficulty as keyof typeof difficultyColors]}>
                          {topic.difficulty}
                        </Badge>
                      )}
                      {topic.category && (
                        <Badge variant="outline">{topic.category}</Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">{topic.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{topic.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {topic.discussionCount} discussions
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/practice/topics/${topic.slug}`}>View Topic</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discussions" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Discussions</h2>
          </div>
          {recentDiscussions.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <CardTitle>No Discussions Yet</CardTitle>
                <CardDescription>
                  Start a discussion on any practice topic to get help from the community!
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentDiscussions.map((discussion) => (
                <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="py-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {discussion.isPinned && (
                            <Badge variant="secondary" className="text-xs">Pinned</Badge>
                          )}
                          {discussion.topicTitle && (
                            <Link
                              href={`/practice/topics/${discussion.topicSlug}`}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              {discussion.topicTitle}
                            </Link>
                          )}
                        </div>
                        <CardTitle className="text-lg">
                          <Link href={`/practice/discussions/${discussion.id}`} className="hover:underline">
                            {discussion.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <UsersIcon className="h-4 w-4" />
                          <span>by {discussion.userName || "Anonymous"}</span>
                          <span>-</span>
                          <span>{discussion.commentCount} replies</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Questions & Answers</h2>
          </div>
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                The Q&A section is under development. Check back soon!
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
