import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, Code2, Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your profile and learning progress.",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
              <AvatarFallback className="text-2xl">
                {session.user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">{session.user.name}</CardTitle>
            <CardDescription>{session.user.email}</CardDescription>
            <Badge variant="secondary" className="mt-2">
              {session.user.role === "admin" ? "Administrator" : "Member"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Courses Enrolled</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Courses Completed</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discussions</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Projects</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity & Progress */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="progress" className="space-y-6">
            <TabsList>
              <TabsTrigger value="progress" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Learning Progress
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Recent Activity
              </TabsTrigger>
              <TabsTrigger value="projects" className="gap-2">
                <Rocket className="h-4 w-4" />
                My Projects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="progress" className="space-y-4">
              <Card className="border-dashed">
                <CardHeader className="text-center">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <CardTitle>No Courses Started</CardTitle>
                  <CardDescription>
                    Start learning by enrolling in a course from the Learn section.
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card className="border-dashed">
                <CardHeader className="text-center">
                  <Code2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <CardTitle>No Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent discussions and contributions will appear here.
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <Card className="border-dashed">
                <CardHeader className="text-center">
                  <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <CardTitle>No Projects Yet</CardTitle>
                  <CardDescription>
                    Submit your projects in the Create section to showcase them here.
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
