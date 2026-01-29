import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, MessageCircle, HelpCircle, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Practice",
  description: "Sharpen your skills with coding tasks, exercises, and community discussions.",
};

const topics = [
  {
    id: 1,
    title: "Build a Chatbot with OpenAI API",
    description: "Create a simple chatbot using the OpenAI API with streaming responses.",
    difficulty: "easy",
    category: "AI Integration",
    discussions: 24,
  },
  {
    id: 2,
    title: "Implement RAG System",
    description: "Build a Retrieval-Augmented Generation system with vector embeddings.",
    difficulty: "medium",
    category: "AI Agents",
    discussions: 18,
  },
  {
    id: 3,
    title: "Multi-Agent Orchestration",
    description: "Design and implement a multi-agent system for complex task automation.",
    difficulty: "hard",
    category: "Advanced",
    discussions: 12,
  },
];

const recentDiscussions = [
  {
    id: 1,
    title: "How to handle streaming responses in Next.js?",
    author: "johndoe",
    replies: 5,
    topicId: 1,
  },
  {
    id: 2,
    title: "Best vector database for small projects?",
    author: "janedoe",
    replies: 12,
    topicId: 2,
  },
  {
    id: 3,
    title: "Prompt optimization techniques",
    author: "aidev",
    replies: 8,
    topicId: 1,
  },
];

const difficultyColors = {
  easy: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  hard: "bg-red-500/10 text-red-500",
};

export default function PracticePage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Practice</h1>
        <p className="text-muted-foreground">
          Sharpen your skills with coding tasks, exercises, and community discussions.
        </p>
      </div>

      <Tabs defaultValue="topics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="topics" className="gap-2">
            <Code2 className="h-4 w-4" />
            Practice Topics
          </TabsTrigger>
          <TabsTrigger value="discussions" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Discussions
          </TabsTrigger>
          <TabsTrigger value="questions" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Q&A
          </TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Card key={topic.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex gap-2 mb-2">
                    <Badge className={difficultyColors[topic.difficulty as keyof typeof difficultyColors]}>
                      {topic.difficulty}
                    </Badge>
                    <Badge variant="outline">{topic.category}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{topic.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{topic.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {topic.discussions} discussions
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/practice/topics/${topic.id}`}>Start Practice</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discussions" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Discussions</h2>
            <Button asChild>
              <Link href="/practice/discussions/new">Start Discussion</Link>
            </Button>
          </div>
          <div className="space-y-4">
            {recentDiscussions.map((discussion) => (
              <Card key={discussion.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        <Link href={`/practice/discussions/${discussion.id}`} className="hover:underline">
                          {discussion.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Users className="h-4 w-4" />
                        <span>by {discussion.author}</span>
                        <span>•</span>
                        <span>{discussion.replies} replies</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Questions & Answers</h2>
            <Button asChild>
              <Link href="/practice/questions/new">Ask Question</Link>
            </Button>
          </div>
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>No Questions Yet</CardTitle>
              <CardDescription>
                Be the first to ask a question and get help from the community!
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
