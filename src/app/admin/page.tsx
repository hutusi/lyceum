import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, GraduationCap, Users, Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "AI Coding Lyceum administration dashboard.",
};

const stats = [
  {
    title: "Total Articles",
    value: "0",
    description: "Published articles and news",
    icon: FileText,
  },
  {
    title: "Total Courses",
    value: "0",
    description: "Available courses and workshops",
    icon: GraduationCap,
  },
  {
    title: "Total Users",
    value: "0",
    description: "Registered users",
    icon: Users,
  },
  {
    title: "Total Projects",
    value: "0",
    description: "Submitted projects",
    icon: Rocket,
  },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the AI Coding Lyceum admin panel.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent activity to display.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors">
              <p className="font-medium">Create New Article</p>
              <p className="text-sm text-muted-foreground">Add a new article or news post</p>
            </div>
            <div className="p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors">
              <p className="font-medium">Create New Course</p>
              <p className="text-sm text-muted-foreground">Add a new course or workshop</p>
            </div>
            <div className="p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors">
              <p className="font-medium">Create Practice Topic</p>
              <p className="text-sm text-muted-foreground">Add a new practice topic</p>
            </div>
            <div className="p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors">
              <p className="font-medium">Publish Nexus Weekly</p>
              <p className="text-sm text-muted-foreground">Create a new weekly issue</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
