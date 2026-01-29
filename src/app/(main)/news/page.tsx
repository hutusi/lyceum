import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, Video, Radio } from "lucide-react";

export const metadata: Metadata = {
  title: "News",
  description: "Stay informed with the latest AI tool news, articles, and insights.",
};

export default function NewsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">News</h1>
        <p className="text-muted-foreground">
          Stay informed with the latest AI tool news, general information, and release notes.
        </p>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="articles" className="gap-2">
            <Newspaper className="h-4 w-4" />
            Articles
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Video className="h-4 w-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="livestream" className="gap-2">
            <Radio className="h-4 w-4" />
            Live Streams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder articles */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary">AI News</Badge>
                  </div>
                  <CardTitle className="line-clamp-2">
                    Getting Started with AI Development in 2025
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    A comprehensive guide to beginning your journey in AI development with the latest
                    tools and frameworks.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">January 15, 2025</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                <Video className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">Introduction to Prompt Engineering</CardTitle>
                <CardDescription>Learn the basics of crafting effective prompts</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="livestream" className="space-y-4">
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <Radio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>No Upcoming Live Streams</CardTitle>
              <CardDescription>
                Check back later for scheduled live streams and events.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
