import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, Code2, Rocket, Share2, ArrowRight } from "lucide-react";

const sections = [
  {
    title: "Know",
    description: "Stay informed with the latest AI tool news, articles, and insights from the industry.",
    icon: BookOpen,
    href: "/know",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Learn",
    description: "Master AI coding through structured courses, workshops, and prompt engineering techniques.",
    icon: GraduationCap,
    href: "/learn",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Practice",
    description: "Sharpen your skills with coding tasks, exercises, and community discussions.",
    icon: Code2,
    href: "/practice",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Create",
    description: "Build innovative AI applications, showcase your projects, and explore the AI Nexus Weekly.",
    icon: Rocket,
    href: "/create",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Share",
    description: "Share your skills, sub-agents, and MCPs with the community. Discover tools built by others.",
    icon: Share2,
    href: "/share",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Coding Lyceum
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Your community for AI coding education, practice, and creation. Learn, build, and share
            with fellow AI enthusiasts.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/learn">
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/know">Explore News</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sections Overview */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Explore Our Sections</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${section.color}`} />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      {section.title}
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" asChild className="p-0 h-auto">
                      <Link href={section.href} className={section.color}>
                        Explore {section.title} →
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your AI Journey?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join our community of learners, practitioners, and creators. Sign up today and unlock
            access to all our resources.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Create Free Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
