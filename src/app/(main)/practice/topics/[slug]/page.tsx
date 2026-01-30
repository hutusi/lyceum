import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { practiceTopics, discussions, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Users as UsersIcon, Pin } from "lucide-react";
import { NewDiscussionForm } from "./new-discussion-form";

type Props = {
  params: Promise<{ slug: string }>;
};

const difficultyColors = {
  easy: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  hard: "bg-red-500/10 text-red-500",
};

async function getTopicWithDiscussions(slug: string) {
  const topic = await db
    .select({
      id: practiceTopics.id,
      title: practiceTopics.title,
      slug: practiceTopics.slug,
      description: practiceTopics.description,
      difficulty: practiceTopics.difficulty,
      category: practiceTopics.category,
      createdAt: practiceTopics.createdAt,
    })
    .from(practiceTopics)
    .where(eq(practiceTopics.slug, slug))
    .limit(1);

  if (topic.length === 0) {
    return null;
  }

  const discussionsList = await db
    .select({
      id: discussions.id,
      title: discussions.title,
      content: discussions.content,
      isPinned: discussions.isPinned,
      createdAt: discussions.createdAt,
      userId: discussions.userId,
      userName: users.name,
      userImage: users.image,
      commentCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE discussion_id = ${discussions.id})`,
    })
    .from(discussions)
    .leftJoin(users, eq(discussions.userId, users.id))
    .where(eq(discussions.topicId, topic[0].id))
    .orderBy(desc(discussions.isPinned), desc(discussions.createdAt));

  return { topic: topic[0], discussions: discussionsList };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTopicWithDiscussions(slug);

  if (!data) {
    return { title: "Topic Not Found" };
  }

  return {
    title: data.topic.title,
    description: data.topic.description || `Practice topic: ${data.topic.title}`,
  };
}

export default async function TopicDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getTopicWithDiscussions(slug);

  if (!data) {
    notFound();
  }

  const session = await auth();
  const { topic, discussions: discussionsList } = data;

  return (
    <div className="container py-8">
      <Link
        href="/practice"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Practice
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Topic Info */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
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
              <CardTitle>{topic.title}</CardTitle>
              {topic.description && (
                <CardDescription className="mt-2">{topic.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{discussionsList.length} discussions</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Discussions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Discussions</h2>
          </div>

          {/* New Discussion Form */}
          {session?.user ? (
            <NewDiscussionForm topicSlug={topic.slug} />
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Sign in to start a discussion
                </p>
                <Button asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Discussion List */}
          {discussionsList.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <CardTitle>No Discussions Yet</CardTitle>
                <CardDescription>
                  Be the first to start a discussion on this topic!
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-4">
              {discussionsList.map((discussion) => (
                <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {discussion.isPinned && (
                            <Pin className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <CardTitle className="text-lg">
                          <Link
                            href={`/practice/discussions/${discussion.id}`}
                            className="hover:underline"
                          >
                            {discussion.title}
                          </Link>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {discussion.content}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4" />
                        {discussion.userName || "Anonymous"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {discussion.commentCount} replies
                      </span>
                      <span>
                        {discussion.createdAt?.toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
