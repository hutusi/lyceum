import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Code2,
  Rocket,
  Newspaper,
  Share2,
  Users,
  Settings,
  ArrowLeft,
  ShieldCheck,
  Activity,
} from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldCheck },
  { href: "/admin/content/articles", label: "Articles", icon: FileText },
  { href: "/admin/content/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/content/practice", label: "Practice Topics", icon: Code2 },
  { href: "/admin/content/projects", label: "Projects", icon: Rocket },
  { href: "/admin/content/nexus-weekly", label: "Nexus Weekly", icon: Newspaper },
  { href: "/admin/content/tools", label: "Shared Tools", icon: Share2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/activity", label: "Activity Log", icon: Activity },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 p-4 hidden md:block">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">L</span>
          </div>
          <span className="font-bold">Admin Panel</span>
        </div>

        <nav className="space-y-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className="w-full justify-start"
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="mt-8 pt-8 border-t">
          <Button variant="outline" asChild className="w-full justify-start">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Site
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
